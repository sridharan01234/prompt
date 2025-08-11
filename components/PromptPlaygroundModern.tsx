'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { supportPrompt, SupportPromptType } from '@/lib/prompt-core'
import { createPortal } from 'react-dom'
import { useAuth } from './AuthProvider'
import { GoogleSignInButton, GoogleOneTapSignIn } from './GoogleSignInButton'
import { useStreamingApi } from '@/lib/useStreamingApi'

// Modern dropdown component with improved design
interface DropdownOption {
  value: string
  label: string
  icon?: string
  disabled?: boolean
  premium?: boolean
  description?: string
}

interface DropdownGroup {
  label: string
  options: DropdownOption[]
}

function ModernSelect({
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
    setMenuPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX, width: rect.width })
  }

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

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <motion.button
        ref={buttonRef}
        type="button"
        disabled={disabled || loading}
        onClick={() => {
          if (disabled || loading) return
          setOpen((v) => !v)
          setTimeout(updatePosition, 0)
        }}
        whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.99 }}
        className={`w-full flex items-center justify-between rounded-xl border-2 transition-all duration-200 px-4 py-3 text-sm text-left font-medium shadow-sm ${
          disabled || loading 
            ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' 
            : open
              ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-100'
              : selectedOption?.premium 
                ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 hover:border-amber-300 hover:shadow-md' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        }`}
      >
        <span className="flex items-center gap-3">
          {selectedOption?.icon && (
            <span className="text-lg flex-shrink-0">{selectedOption.icon}</span>
          )}
          {selectedOption?.premium && (
            <span className="text-amber-500 text-sm">✨</span>
          )}
          <span className={`truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {loading ? 'Loading...' : selectedLabel}
          </span>
        </span>
        <motion.svg 
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="h-5 w-5 text-gray-400 flex-shrink-0" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
        </motion.svg>
      </motion.button>

      {open &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="z-50 bg-white border-2 border-gray-100 rounded-xl shadow-xl overflow-hidden backdrop-blur-sm"
              style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, minWidth: menuPos.width }}
            >
              {searchable && (
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search options..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="max-h-80 overflow-auto">
                {loading && (
                  <div className="p-4 text-sm text-gray-500 flex items-center gap-3">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span>Loading options...</span>
                  </div>
                )}
                
                {!loading && error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 border-l-4 border-red-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                {!loading && !error && (
                  <>
                    {options.length > 0 && filterOptions(options).map((option) => (
                      <motion.div
                        key={option.value}
                        whileHover={{ backgroundColor: 'rgb(248 250 252)' }}
                        onClick={() => {
                          if (option.disabled) return
                          onChange(option.value)
                          setOpen(false)
                        }}
                        className={`px-4 py-3 cursor-pointer transition-colors ${
                          option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          value === option.value 
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {option.icon && <span className="text-lg flex-shrink-0">{option.icon}</span>}
                          {option.premium && <span className="text-amber-500 text-sm">✨</span>}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{option.label}</div>
                            {option.description && (
                              <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                            )}
                          </div>
                          {value === option.value && (
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {groups.map((group) => (
                      <div key={group.label}>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100 sticky top-0">
                          {group.label}
                        </div>
                        {filterOptions(group.options).map((option) => (
                          <motion.div
                            key={option.value}
                            whileHover={{ backgroundColor: 'rgb(248 250 252)' }}
                            onClick={() => {
                              if (option.disabled) return
                              onChange(option.value)
                              setOpen(false)
                            }}
                            className={`px-4 py-3 cursor-pointer transition-colors ${
                              option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                            } ${
                              value === option.value 
                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {option.icon && <span className="text-lg flex-shrink-0">{option.icon}</span>}
                              {option.premium && <span className="text-amber-500 text-sm">✨</span>}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{option.label}</div>
                                {option.description && (
                                  <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                                )}
                              </div>
                              {value === option.value && (
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}

// Enhanced Model dropdown component
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
  onChange: (value: string) => void
  limited: string[]
  premium: string[]
  authed: boolean
  loading: boolean
  error: string
}) {
  const groups: DropdownGroup[] = [
    {
      label: 'Free Models',
      options: limited.map(model => ({ 
        value: model, 
        label: model, 
        icon: '🆓',
        disabled: false,
        description: 'Free tier model'
      }))
    },
    {
      label: 'Premium Models',
      options: premium.map(model => ({ 
        value: model, 
        label: model, 
        icon: '⭐',
        premium: !authed,
        disabled: false,
        description: 'Advanced model with premium features'
      }))
    }
  ]

  return (
    <ModernSelect
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

// Enhanced Card component
function Card({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Enhanced Badge component
function Badge({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'error', className?: string }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200'
  }
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Modern button component  
function ModernButton({ 
  children, 
  variant = 'primary', 
  size = 'default',
  loading = false, 
  disabled = false,
  icon,
  className = '',
  ...props 
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'default' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
  [key: string]: any
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500',
    secondary: 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:from-red-700 hover:to-red-800 focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    default: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon}
      {children}
    </motion.button>
  )
}

export default function PromptPlaygroundModern() {
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
  const responseScrollRef = useRef<HTMLDivElement | null>(null)
  const [wrapOutput, setWrapOutput] = useState<boolean>(true)

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
      // Real-time content updates
    },
    onComplete: (fullContent) => {
      setAiOutput(fullContent)
      setLoading(false)
    },
    onError: (errorMessage) => {
      setError(errorMessage)
      setLoading(false)
    },
    onMetadata: (metadata) => {
      console.log('Stream metadata:', metadata)
    }
  })

  // Update aiOutput with streamed content in real-time
  useEffect(() => {
    if (streamedContent) {
      setAiOutput(streamedContent)
    }
  }, [streamedContent])

  // Auto-scroll response area to bottom on updates
  useEffect(() => {
    const el = responseScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [aiOutput, streamedContent, loading])

  // Update error state from streaming
  useEffect(() => {
    if (streamError) {
      setError(streamError)
    }
  }, [streamError])

  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  // Programming language selection
  const [language, setLanguage] = useState<string>('TypeScript')
  const languageOptions = useMemo(
    () => [
      { value: 'TypeScript', label: 'TypeScript', icon: '🔷', description: 'Typed JavaScript superset' },
      { value: 'JavaScript', label: 'JavaScript', icon: '💛', description: 'Dynamic web programming language' },
      { value: 'Python', label: 'Python', icon: '🐍', description: 'High-level programming language' },
      { value: 'Java', label: 'Java', icon: '☕', description: 'Object-oriented programming language' },
      { value: 'C++', label: 'C++', icon: '⚡', description: 'Systems programming language' },
      { value: 'C#', label: 'C#', icon: '🔮', description: 'Microsoft .NET language' },
      { value: 'Go', label: 'Go', icon: '🔵', description: 'Google\'s systems language' },
      { value: 'Rust', label: 'Rust', icon: '🦀', description: 'Memory-safe systems language' },
      { value: 'PHP', label: 'PHP', icon: '🐘', description: 'Server-side scripting language' },
      { value: 'Ruby', label: 'Ruby', icon: '💎', description: 'Elegant object-oriented language' },
      { value: 'Swift', label: 'Swift', icon: '🏎️', description: 'Apple\'s programming language' },
      { value: 'Kotlin', label: 'Kotlin', icon: '🎯', description: 'Modern JVM language' }
    ],
    []
  )

  // Prompt type selection
  const [promptType, setPromptType] = useState<SupportPromptType>('ENHANCE')
  const promptTypeOptions: { value: SupportPromptType; label: string; icon: string; description: string }[] = useMemo(
    () => [
      { value: 'ENHANCE', label: 'Enhance', icon: '✨', description: 'Improve and refine your prompt' },
      { value: 'ANALYZE', label: 'Analyze', icon: '🔍', description: 'Deep analysis and insights' },
      { value: 'DEBUG', label: 'Debug', icon: '🐛', description: 'Find and fix issues' },
      { value: 'OPTIMIZE', label: 'Optimize', icon: '⚡', description: 'Performance improvements' },
      { value: 'DOCUMENT', label: 'Document', icon: '📝', description: 'Create documentation' },
      { value: 'TEST', label: 'Test', icon: '🧪', description: 'Generate test cases' }
    ],
    []
  )

  // Fetch models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true)
        const response = await fetch('/api/models')
        if (!response.ok) throw new Error('Failed to fetch models')
        const data = await response.json()
        
        setModels(data.models || [])
        setLimitedModels(data.limited || [])
        setPremiumModels(data.premium || [])
        
        // Set default model
        if (!model && data.limited?.[0]) {
          setModel(data.limited[0])
        }
      } catch (err) {
        setModelsError((err as Error).message)
      } finally {
        setModelsLoading(false)
      }
    }

    fetchModels()
  }, [model])

  const handleGenerate = async () => {
    if (!userText.trim()) {
      setError('Please enter some text to enhance')
      return
    }

    if (!model) {
      setError('Please select a model')
      return
    }

    try {
      setLoading(true)
      setError('')
      resetStream()
      
      const requestParams = { 
        userInput: userText.trim(), 
        language 
      }
      
      const requestBody = { 
        model: model || undefined, 
        type: promptType, 
        params: requestParams 
      }

      await startStreaming('/api/generate', requestBody, true)
      
    } catch (e) {
      setError((e as Error).message)
      setLoading(false)
    }
  }

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
    setTimeout(() => setCopied(false), 2000)
  }

  const charCount = userText.length
  const responseSubtitle = useMemo(() => (
    promptType === 'DOCUMENT' ? 'Your document' : 'Your enhanced prompt'
  ), [promptType])
  const [activeMobileTab, setActiveMobileTab] = useState<'controls' | 'response'>('controls')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <GoogleOneTapSignIn />
      
      {/* Success notification */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed right-6 top-6 z-50 bg-green-500 text-white rounded-xl px-6 py-3 shadow-xl border border-green-400"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Copied to clipboard!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 border border-white/20 shadow-lg">
            <span className="text-3xl">🎨</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Prompt Playground
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create, refine, and perfect your prompts with AI assistance. Transform your ideas into powerful, effective prompts.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="default">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              AI-Powered Enhancement
            </Badge>
            <Badge variant="default">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Real-time Preview
            </Badge>
            <Badge variant="default">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              Multiple Models
            </Badge>
          </div>
        </motion.div>

        {/* Mobile tabs */}
        <div className="md:hidden mb-6">
          <div className="flex rounded-2xl border-2 border-gray-200 bg-white p-1.5 shadow-sm">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                activeMobileTab === 'controls' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveMobileTab('controls')}
            >
              🎛️ Controls
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                activeMobileTab === 'response' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveMobileTab('response')}
            >
              ✨ Response
            </motion.button>
          </div>
        </div>

        <LayoutGroup>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column - Input */}
            <Card 
              className={`p-8 ${activeMobileTab === 'controls' ? 'block' : 'hidden md:block'}`}
              layoutId="input-card"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Playground</h2>
                    <p className="text-gray-600">Describe your task, get refined prompts</p>
                  </div>
                </div>
                
                {/* Authentication */}
                <div className="flex items-center gap-4">
                  {isAuthenticated ? (
                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Badge variant="success">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Authenticated
                      </Badge>
                      <button 
                        onClick={signOut}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Sign out
                      </button>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <GoogleSignInButton text="signin_with" size="medium" />
                      <span className="text-xs text-gray-500">for premium models</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Prompt type</label>
                  <ModernSelect
                    value={promptType}
                    onChange={(value) => setPromptType(value as SupportPromptType)}
                    options={promptTypeOptions}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Programming language</label>
                  <ModernSelect
                    value={language}
                    onChange={setLanguage}
                    options={languageOptions}
                    searchable={true}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">OpenAI model</label>
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
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-4 text-sm text-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500">✨</span>
                        <span className="font-medium">Premium model selected.</span>
                      </div>
                      <p className="mt-1">Sign in to use it, or pick a free model.</p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Input area */}
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    Your input
                  </label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                    {charCount} characters
                  </span>
                </div>
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <textarea
                    ref={inputRef}
                    value={userText}
                    onChange={(e) => setUserText(e.target.value)}
                    className="w-full h-48 resize-none rounded-xl border-2 border-gray-200 bg-white px-4 py-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                    placeholder="Describe what you want to accomplish. Be as specific as possible..."
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    Press Shift + Enter for new line
                  </div>
                </motion.div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <ModernButton
                  onClick={loading ? onCancelRequest : handleGenerate}
                  disabled={!userText.trim() || !model}
                  variant={loading ? 'danger' : 'primary'}
                  loading={loading}
                  className="flex-1"
                  icon={!loading && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                >
                  {loading ? 'Cancel' : 'Generate with AI'}
                </ModernButton>
                
                <ModernButton
                  onClick={() => {
                    setUserText('')
                    setAiOutput('')
                    setError('')
                    resetStream()
                  }}
                  variant="secondary"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  }
                >
                  Reset
                </ModernButton>
              </div>
            </Card>

            {/* Right column - Output */}
            <Card 
              className={`p-8 ${activeMobileTab === 'response' ? 'block' : 'hidden md:block'}`}
              layoutId="output-card"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Response</h2>
                    <p className="text-gray-600">{responseSubtitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <ModernButton
                    onClick={() => setWrapOutput((w) => !w)}
                    variant="ghost"
                    size="sm"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    }
                  >
                    {wrapOutput ? 'Wrap: On' : 'Wrap: Off'}
                  </ModernButton>
                  {aiOutput && (
                    <ModernButton
                      onClick={() => onCopy(aiOutput)}
                      variant="secondary"
                      size="sm"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      }
                    >
                      Copy
                    </ModernButton>
                  )}
                </div>
              </div>

              {/* Content: fixed-size, scrollable response area */}
              <div className="relative h-[500px] bg-gray-50/50 rounded-xl border-2 border-gray-100 overflow-hidden">
                <div className="h-full overflow-y-auto p-6" ref={responseScrollRef}>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-4"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800 font-medium">Error</span>
                      </div>
                      <p className="text-red-700 mt-2">{error}</p>
                    </motion.div>
                  )}

                  {loading && !streamedContent && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-lg border border-gray-200">
                          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          <span className="text-gray-600 font-medium">Generating enhanced prompt...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(aiOutput || streamedContent) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {loading && streamedContent && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-blue-600 font-medium">Streaming response...</span>
                        </div>
                      )}
                      <div className={`prose prose-sm max-w-none ${wrapOutput ? '' : 'whitespace-pre-wrap'} text-gray-800 leading-relaxed`}>
                        {aiOutput || streamedContent}
                      </div>
                    </motion.div>
                  )}

                  {!aiOutput && !streamedContent && !loading && !error && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-600 mb-2">Ready to enhance your prompt</p>
                        <p className="text-gray-500">Enter your prompt above and click "Generate with AI" to get started</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </LayoutGroup>
      </div>
    </div>
  )
}
