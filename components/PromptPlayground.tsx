'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supportPrompt, SupportPromptType } from '@/lib/prompt-core'
import { createPortal } from 'react-dom'
import { useAuth } from './AuthProvider'
import { GoogleSignInButton, GoogleOneTapSignIn } from './GoogleSignInButton'

// Lightweight styled dropdown for models
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

  const f = (list: string[]) =>
    list.filter((m) => m.toLowerCase().includes(query.trim().toLowerCase()))

  const isPremiumSelected = premium.includes(value)

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v)
          setTimeout(updatePosition, 0)
        }}
        className={`flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          !authed && isPremiumSelected ? 'border-amber-400' : 'border-slate-300'
        }`}
      >
        <span className="flex items-center gap-2">
          {!authed && isPremiumSelected && <span aria-hidden className="text-amber-500">🔒</span>}
          <span className="truncate text-slate-900">{value || (loading ? 'Loading…' : 'Select a model')}</span>
        </span>
        <svg className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
        </svg>
      </button>

      {open &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="z-50 overflow-hidden border border-gray-200 bg-white shadow-lg"
              style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, minWidth: menuPos.width }}
            >
              <div className="p-3 border-b border-gray-200 bg-white">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search models…"
                  className="w-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500"
                />
              </div>

              {loading && <div className="p-4 text-xs text-gray-500">Loading models…</div>}
              {!loading && error && <div className="p-4 text-xs text-red-600">{error}</div>}

              {!loading && !error && (
                <div className="max-h-64 overflow-auto text-sm">
                  <div className="sticky top-0 z-10 bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 border-b border-gray-200">Free</div>
                  {f(limited).map((m) => (
                    <div
                      key={m}
                      onClick={() => {
                        onChange(m)
                        setOpen(false)
                      }}
                      className={`cursor-pointer w-full px-4 py-2.5 text-left border-b border-gray-100 last:border-b-0 ${
                        value === m 
                          ? 'bg-gray-200 text-gray-900 font-medium' 
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{m}</span>
                        {value === m && <span className="text-gray-600 ml-2">✓</span>}
                      </div>
                    </div>
                  ))}

                  <div className="sticky top-0 z-10 bg-white px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 border-b border-gray-200">Premium</div>
                  {f(premium).map((m) => (
                    <div
                      key={m}
                      onClick={() => {
                        onChange(m)
                        setOpen(false)
                      }}
                      className={`cursor-pointer w-full px-4 py-2.5 text-left border-b border-gray-100 last:border-b-0 ${
                        value === m 
                          ? 'bg-gray-200 text-gray-900 font-medium' 
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{!authed ? <span className="mr-2 text-orange-500">🔒</span> : null}{m}</span>
                        {value === m && <span className="text-gray-600 ml-2">✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
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
    // Keyboard shortcuts: Cmd/Ctrl+Enter = Ask OpenAI, Cmd/Ctrl+K = focus input
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
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
  }, [model, userText, language])

  const onAskOpenAI = async () => {
    if (loading) return
    setError('')
    setAiOutput('')
    // Prevent free users from sending requests to premium models
    if (!isAuthenticated && premiumModels.includes(model)) {
      setError('Sign in with Google to use premium models.')
      return
    }
    setLoading(true)
    try {
      const params = { userInput: userText, language }
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: model || undefined, type: promptType, params })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      // We only show the AI response now
      setAiOutput(data.output)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 top-4 z-50 rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-xs text-indigo-700 shadow"
          >
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left column */}
      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Playground</h2>
            <p className="text-xs text-slate-600">Describe your task, get refined prompt</p>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="badge">{user?.name || user?.email}</span>
                <button 
                  onClick={signOut}
                  className="text-xs text-indigo-700 hover:underline"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <GoogleSignInButton 
                  text="signin_with"
                  size="medium"
                  className="mr-2"
                />
                <span className="text-xs text-slate-600">for premium models</span>
              </>
            )}
          </div>
        </div>

        {/* Selections */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="panel">
            <label className="mb-1 block text-xs font-medium text-slate-700">Prompt type</label>
            <select value={promptType} onChange={(e) => setPromptType(e.target.value as SupportPromptType)} className="w-full">
              {promptTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="panel">
            <label className="mb-1 block text-xs font-medium text-slate-700">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full">
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="panel">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">OpenAI model</label>
              <span className="kbd">Ctrl/⌘ K</span>
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
              <p className="mt-1 text-[11px] text-amber-700">
                Premium model selected. Sign in to use it, or pick a free model.
              </p>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="panel">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700">Your input</label>
            <span className="text-[11px] text-slate-500">{charCount} chars</span>
          </div>
          <textarea
            ref={inputRef}
            rows={9}
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            className="font-mono"
            placeholder="Describe what you need…"
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {!isAuthenticated && (
            <p className="mt-2 text-[11px] text-slate-500">
              Free tier: 2.5M tokens/day across limited models. Sign in to unlock premium models (250k/day).
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button onClick={onAskOpenAI} disabled={loading || modelsLoading || !model}>
            {loading ? 'Generating…' : 'Generate with AI'}
          </button>
          <button onClick={() => setUserText('')} className="bg-gray-600 hover:bg-gray-700">
            Reset
          </button>
        </div>
      </section>

      {/* Right column */}
      <section className="card">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-slate-900">OpenAI Response</label>
            <p className="text-xs text-slate-600">Result from the selected model</p>
          </div>
          <button onClick={() => onCopy(aiOutput)} disabled={!aiOutput} className="bg-indigo-600 hover:bg-indigo-700">
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        {loading ? (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          </div>
        ) : (
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900">
            {aiOutput || 'OpenAI response will appear here...'}
          </pre>
        )}
      </section>
    </div>
    </>
  )
}
