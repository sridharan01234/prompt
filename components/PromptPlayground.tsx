'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supportPrompt, SupportPromptType } from '@/lib/prompt-core'
import { createPortal } from 'react-dom'
import { useAuth } from './AuthProvider'
import { GoogleSignInButton, GoogleOneTapSignIn } from './GoogleSignInButton'
import { useStreamingApi } from '@/lib/useStreamingApi'

// Enhanced reusable dropdown component with modern styling
interface DropdownOption {
  value: string
  label: string
  icon?: string
  description?: string
  disabled?: boolean
  premium?: boolean
}

interface DropdownGroup {
  label: string
  options: DropdownOption[]
  color?: 'green' | 'amber' | 'blue' | 'purple'
}

function ModernDropdown({
  value,
  onChange,
  options = [],
  groups = [],
  placeholder = 'Select an option',
  searchable = false,
  loading = false,
  error,
  disabled = false,
  className = ''
}: {
  value: string
  onChange: (value: string) => void
  options?: DropdownOption[]
  groups?: DropdownGroup[]
  placeholder?: string
  searchable?: boolean
  loading?: boolean
  error?: string
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 })

  const updatePosition = () => {
    const btn = buttonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX, width: rect.width })
  }

  // Close on outside click / Esc
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    const onScroll = () => updatePosition()
    const onResize = () => updatePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const filterOptions = (opts: DropdownOption[]) =>
    opts.filter((opt) => opt.label.toLowerCase().includes(query.trim().toLowerCase()))

  const allOptions = [...options, ...groups.flatMap(g => g.options)]
  const selectedOption = allOptions.find(opt => opt.value === value)
  const selectedLabel = selectedOption?.label || placeholder

  const groupColors = {
    green: { bg: 'bg-green-600/20', text: 'text-green-300', border: 'border-green-400', section: 'text-green-400' },
    amber: { bg: 'bg-amber-600/20', text: 'text-amber-300', border: 'border-amber-400', section: 'text-amber-400' },
    blue: { bg: 'bg-blue-600/20', text: 'text-blue-300', border: 'border-blue-400', section: 'text-blue-400' },
    purple: { bg: 'bg-purple-600/20', text: 'text-purple-300', border: 'border-purple-400', section: 'text-purple-400' }
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled || loading}
        onClick={() => {
          if (disabled || loading) return
          setOpen((v) => !v)
          setTimeout(updatePosition, 0)
        }}
        className={`group flex w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 py-3 text-sm shadow-lg transition-all duration-300 hover:bg-white/10 hover:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
          disabled || loading ? 'opacity-50 cursor-not-allowed' : 'border-white/10'
        } ${selectedOption?.premium ? 'border-amber-400/50 bg-amber-400/10' : ''}`}
      >
        <span className="flex items-center gap-3">
          {selectedOption?.icon && (
            <span aria-hidden className="text-lg">{selectedOption.icon}</span>
          )}
          {selectedOption?.premium && (
            <span aria-hidden className="text-amber-400 group-hover:animate-pulse">🔒</span>
          )}
          <span className="truncate text-white font-medium">
            {loading ? 'Loading...' : selectedLabel}
          </span>
        </span>
        <svg 
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          aria-hidden
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
        </svg>
      </button>

      {open &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="z-50 overflow-hidden border border-white/20 bg-black/80 backdrop-blur-xl shadow-2xl rounded-xl"
              style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, minWidth: menuPos.width }}
            >
              {searchable && (
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-sm text-white placeholder-gray-400 rounded-lg focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>
              )}

              {loading && (
                <div className="p-4 text-sm text-gray-300 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                  Loading...
                </div>
              )}
              {!loading && error && (
                <div className="p-4 text-sm text-red-400 bg-red-500/10 border-l-4 border-red-500">
                  {error}
                </div>
              )}

              {!loading && !error && (
                <div className="max-h-64 overflow-auto text-sm">
                  {/* Render standalone options first */}
                  {options.length > 0 && filterOptions(options).map((option) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        if (option.disabled) return
                        onChange(option.value)
                        setOpen(false)
                      }}
                      className={`cursor-pointer w-full px-4 py-3 text-left border-b border-white/5 last:border-b-0 transition-all duration-150 ${
                        option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        value === option.value 
                          ? 'bg-blue-600/20 text-blue-300 border-l-4 border-blue-400' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {option.icon && <span className="text-lg">{option.icon}</span>}
                          {option.premium && <span className="text-amber-400 text-xs">🔒</span>}
                          <span className="font-medium">{option.label}</span>
                        </span>
                        {value === option.value && (
                          <span className="text-blue-400 ml-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      {option.description && (
                        <div className="text-xs text-gray-400 mt-1">{option.description}</div>
                      )}
                    </div>
                  ))}

                  {/* Render grouped options */}
                  {groups.map((group) => {
                    const filteredOptions = filterOptions(group.options)
                    if (filteredOptions.length === 0) return null
                    const colors = groupColors[group.color || 'blue']
                    
                    return (
                      <div key={group.label}>
                        <div className={`sticky top-0 z-10 bg-black/90 backdrop-blur-md px-4 py-3 text-xs font-semibold uppercase tracking-wider ${colors.section} border-b border-white/10`}>
                          {group.label}
                        </div>
                        {filteredOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => {
                              if (option.disabled) return
                              onChange(option.value)
                              setOpen(false)
                            }}
                            className={`cursor-pointer w-full px-4 py-3 text-left border-b border-white/5 last:border-b-0 transition-all duration-150 ${
                              option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                            } ${
                              value === option.value 
                                ? `${colors.bg} ${colors.text} border-l-4 ${colors.border}` 
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                {option.icon && <span className="text-lg">{option.icon}</span>}
                                {option.premium && <span className="text-amber-400 text-xs">🔒</span>}
                                <span className="font-medium">{option.label}</span>
                              </span>
                              {value === option.value && (
                                <span className={`${colors.text} ml-2`}>
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              )}
                            </div>
                            {option.description && (
                              <div className="text-xs text-gray-400 mt-1">{option.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}

// Legacy ModelDropdown wrapper for backward compatibility
function ModelDropdown({
  value,
  onChange,
  limited,
  premium,
  authed,
  loading,
  error
}: {
  value: string
  onChange: (v: string) => void
  limited: string[]
  premium: string[]
  authed: boolean
  loading: boolean
  error?: string
}) {
  const groups: DropdownGroup[] = [
    {
      label: 'Free Models',
      color: 'green',
      options: limited.map(model => ({ value: model, label: model }))
    },
    {
      label: 'Premium Models',
      color: 'amber',
      options: premium.map(model => ({ 
        value: model, 
        label: model, 
        premium: !authed,
        disabled: false
      }))
    }
  ]

  return (
    <ModernDropdown
      value={value}
      onChange={onChange}
      groups={groups}
      placeholder={loading ? 'Loading models...' : 'Select a model'}
      searchable={true}
      loading={loading}
      error={error}
    />
  )
}

export default function PromptPlayground() {
  const { user, isAuthenticated, signOut } = useAuth()
  const [userText, setUserText] = useState<string>('Write a function to sort an array efficiently')
  const [error, setError] = useState<string>('')
  const [model, setModel] = useState<string>('')
  const [models, setModels] = useState<string[]>([])
  const [premiumModels, setPremiumModels] = useState<string[]>([])
  const [limitedModels, setLimitedModels] = useState<string[]>([])
  const [modelsLoading, setModelsLoading] = useState<boolean>(true)
  const [modelsError, setModelsError] = useState<string>('')
  const [aiOutput, setAiOutput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  // Initialize streaming API hook
  const {
    isStreaming,
    streamedContent,
    error: streamError,
    startStreaming,
    cancelStreaming,
    resetStream
  } = useStreamingApi({
    onContent: (content) => {
      // Real-time content updates as they stream in
      // This callback is called for each chunk received
    },
    onComplete: (fullContent) => {
      // Called when streaming is complete
      setAiOutput(fullContent)
      setLoading(false)
    },
    onError: (errorMessage) => {
      // Handle streaming errors
      setError(errorMessage)
      setLoading(false)
    },
    onMetadata: (metadata) => {
      // Handle initial metadata from stream
      console.log('Stream metadata:', metadata)
    }
  })

  // Update aiOutput with streamed content in real-time
  useEffect(() => {
    if (streamedContent) {
      setAiOutput(streamedContent)
    }
  }, [streamedContent])

  // Update error state from streaming
  useEffect(() => {
    if (streamError) {
      setError(streamError)
    }
  }, [streamError])

  // 3D tilt for the left card
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 })
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const px = x / rect.width - 0.5
    const py = y / rect.height - 0.5
    const max = 6 // deg
    setTilt({ rx: -(py * max), ry: px * max })
  }
  const handleMouseLeave = () => setTilt({ rx: 0, ry: 0 })

  // refs for focus management
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  // Programming language selection
  const [language, setLanguage] = useState<string>('TypeScript')
  const languageOptions = useMemo(
    () => [
      'TypeScript',
      'JavaScript',
      'Python',
      'Java',
      'C#',
      'Go',
      'Rust',
      'C++',
      'C',
      'Kotlin',
      'Swift',
      'PHP',
      'Ruby',
      'SQL',
      'Bash',
      'HTML',
      'CSS'
    ],
    []
  )

  // Prompt type selection
  const [promptType, setPromptType] = useState<SupportPromptType>('ENHANCE')
  const promptTypes = supportPrompt.getAvailableTypes()

  useEffect(() => {
    // Fetch available models from the server and populate dropdown
    const fetchModels = async () => {
      setModelsLoading(true)
      setModelsError('')
      try {
        const res = await fetch('/api/models')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch models')
        const list: string[] = Array.isArray(data.models) ? data.models : []
        setModels(list)
        setPremiumModels(Array.isArray(data.premium) ? data.premium : [])
        setLimitedModels(Array.isArray(data.limited) ? data.limited : [])
        const preferred = (Array.isArray(data.models) ? data.models : []).find((m: string) => m.includes('gpt-4o')) || list[0] || ''
        setModel(preferred)
      } catch (e) {
        setModelsError((e as Error).message)
        setModels([])
        setModel('')
      } finally {
        setModelsLoading(false)
      }
    }
    fetchModels()
  }, [])

  useEffect(() => {
    // Keyboard shortcuts: Cmd/Ctrl+Enter = Ask OpenAI, Cmd/Ctrl+K = focus input, Esc = cancel streaming
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (e.key === 'Escape' && (loading || isStreaming)) {
        e.preventDefault()
        onCancelRequest()
      } else if (!mod) return
      
      if (e.key.toLowerCase() === 'enter') {
        e.preventDefault()
        onAskOpenAI()
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, userText, language, loading, isStreaming])

  /**
   * Initiates AI request with streaming or fallback support
   * Handles authentication, model validation, and request preparation
   */
  const onAskOpenAI = async () => {
    // Prevent multiple concurrent requests
    if (loading || isStreaming) return
    
    // Reset previous state
    setError('')
    setAiOutput('')
    resetStream()
    
    // Validate authentication for premium models
    if (!isAuthenticated && premiumModels.includes(model)) {
      setError('Sign in with Google to use premium models.')
      return
    }
    
    // Set loading state
    setLoading(true)
    
    try {
      // Prepare request parameters
      const requestParams = { 
        userInput: userText, 
        language 
      }
      
      const requestBody = { 
        model: model || undefined, 
        type: promptType, 
        params: requestParams 
      }

      // Start streaming request with fallback support
      await startStreaming('/api/generate', requestBody, true)
      
    } catch (e) {
      // Handle any setup errors
      setError((e as Error).message)
      setLoading(false)
    }
  }

  /**
   * Cancels the current AI request
   * Handles both streaming and regular request cancellation
   */
  const onCancelRequest = () => {
    if (isStreaming) {
      cancelStreaming()
    }
    setLoading(false)
    setError('')
  }

  const onCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const charCount = userText.length

  return (
    <>
      <GoogleOneTapSignIn />
      
      {/* Floating notification for copy action */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="fixed right-6 top-6 z-50 rounded-xl border border-green-400/30 bg-green-500/10 backdrop-blur-xl px-4 py-3 text-sm text-green-300 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copied to clipboard!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 content-start items-start">
        {/* Left column - Input */}
        <motion.section 
          className="card group hover:scale-[1.01] transition-transform duration-300 self-start"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Playground</h2>
                <p className="text-xs text-gray-300">Describe your task, get refined prompts</p>
              </div>
            </div>
            
            {/* User authentication section */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="badge badge-green flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    {user?.name || user?.email}
                  </div>
                  <button 
                    onClick={signOut}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors duration-200 hover:underline"
                  >
                    Sign out
                  </button>
                </motion.div>
              ) : (
                <div className="flex items-center gap-3">
                  <GoogleSignInButton 
                    text="signin_with"
                    size="medium"
                    className="transform hover:scale-105 transition-transform duration-200"
                  />
                  <span className="text-xs text-gray-400">for premium models</span>
                </div>
              )}
            </div>
          </div>

          {/* Control selections */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-4 items-stretch auto-rows-fr">
            <div className="panel h-full group hover:bg-white/8 transition-all duration-300 flex flex-col">
               <label className="mb-1 block text-xs font-semibold text-gray-200">Prompt type</label>
               <ModernDropdown
                 value={promptType}
                 onChange={(value) => setPromptType(value as SupportPromptType)}
                 options={promptTypes.map(type => ({ 
                   value: type, 
                   label: type,
                   icon: type === 'ENHANCE' ? '✨' : type === 'ANALYZE' ? '🔍' : type === 'DEBUG' ? '🐛' : 
                         type === 'OPTIMIZE' ? '⚡' : type === 'DOCUMENT' ? '�' : type === 'TEST' ? '🧪' : '📝'
                 }))}
                 placeholder="Select prompt type"
               />
             </div>

            <div className="panel h-full group hover:bg-white/8 transition-all duration-300 flex flex-col">
               <label className="mb-1 block text-xs font-semibold text-gray-200">Language</label>
               <ModernDropdown
                 value={language}
                 onChange={setLanguage}
                 options={languageOptions.map(lang => ({
                   value: lang,
                   label: lang,
                   icon: lang === 'TypeScript' ? '🔷' : lang === 'JavaScript' ? '💛' : lang === 'Python' ? '🐍' : 
                         lang === 'Java' ? '☕' : lang === 'Go' ? '🔵' : lang === 'Rust' ? '🦀' : '📄'
                 }))}
                 placeholder="Select language"
                 searchable={true}
               />
             </div>

            <div className="panel h-full group hover:bg-white/8 transition-all duration-300 flex flex-col">
               <div className="mb-1 flex items-center justify-between">
                 <label className="text-xs font-semibold text-gray-200">OpenAI model</label>
                 <span className="kbd text-[10px] px-2 py-1">⌘K</span>
               </div>
               <ModelDropdown
                 value={model}
                 onChange={setModel}
                 limited={limitedModels}
                 premium={premiumModels}
                 authed={isAuthenticated}
                 loading={modelsLoading}
                 error={modelsError}
               />
               {!isAuthenticated && premiumModels.includes(model) && (
                 <motion.p 
                   className="mt-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2"
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.3 }}
                 >
                   🔒 Premium model selected. Sign in to use it, or pick a free model.
                 </motion.p>
               )}
             </div>
           </div>

          {/* Input area */}
          <div className="panel group hover:bg-white/8 transition-all duration-300">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Your input
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{charCount} chars</span>
                <div className={`w-1.5 h-1.5 rounded-full ${charCount > 0 ? 'bg-green-400' : 'bg-gray-500'} transition-colors duration-200`}></div>
              </div>
            </div>
            <textarea
              ref={inputRef}
              rows={6}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              className="font-mono text-sm bg-black/30 border border-white/20 rounded-xl p-3 text-white placeholder-gray-400 focus:border-blue-400/50 focus:bg-black/40 transition-all duration-200 resize-none"
              placeholder="Describe what you need... For example: 'Write a function to sort an array efficiently'"
            />
            {error && (
              <motion.p 
                className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                ⚠️ {error}
              </motion.p>
            )}
            {!isAuthenticated && (
              <p className="mt-3 text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                💡 Free tier: 2.5M tokens/day across limited models. Sign in to unlock premium models (250k/day).
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            <motion.button 
              onClick={onAskOpenAI} 
              disabled={loading || modelsLoading || !model}
              className="btn-primary flex-1 min-w-[180px] flex items-center justify-center gap-2 relative overflow-hidden py-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                  <span className="text-sm">Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm">Generate with AI</span>
                </>
              )}
            </motion.button>
            <motion.button 
              onClick={() => setUserText('')} 
              className="btn-secondary flex items-center gap-2 px-3 py-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">Reset</span>
            </motion.button>
          </div>
        </motion.section>

        {/* Right column - Output */}
        <motion.section 
          className="card group hover:scale-[1.02] transition-transform duration-300 self-start"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Output header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Response</h3>
                <p className="text-sm text-gray-300">Enhanced result from the selected model</p>
              </div>
            </div>
            <motion.button 
              onClick={() => onCopy(aiOutput)} 
              disabled={!aiOutput} 
              className="btn-success flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copied!' : 'Copy'}
            </motion.button>
          </div>

          {/* Output content */}
          {loading && !isStreaming ? (
            <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 backdrop-blur-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
                <span className="text-gray-300">AI is thinking...</span>
              </div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="shimmer h-4 rounded bg-white/5" style={{ width: `${Math.random() * 40 + 60}%` }} />
              ))}
            </div>
          ) : (
            <div className="relative">
              <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/20 backdrop-blur-md p-6 text-sm text-gray-100 font-mono leading-relaxed shadow-inner">
                {aiOutput || (
                  <div className="text-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-lg font-medium mb-2">Ready for AI magic!</p>
                    <p className="text-sm">Your enhanced prompt will appear here...</p>
                  </div>
                )}
              </pre>
              {(aiOutput || isStreaming) && (
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-blue-400 animate-pulse' : 'bg-green-400'}`}></div>
                  {isStreaming && <span className="text-[10px] text-blue-300">streaming…</span>}
                </div>
              )}
            </div>
          )}
        </motion.section>
      </div>
    </>
  )
}
