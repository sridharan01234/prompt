'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supportPrompt, SupportPromptType } from '@/lib/prompt-core'

export default function PromptPlayground() {
  const [userText, setUserText] = useState<string>('Write a function to sort an array efficiently')
  const [error, setError] = useState<string>('')
  const [model, setModel] = useState<string>('')
  const [models, setModels] = useState<string[]>([])
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
        const preferred = list.find((m) => m.includes('gpt-4o')) || list[0] || ''
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed right-4 top-4 z-50 rounded-md border border-indigo-200 bg-white/90 px-3 py-1.5 text-xs text-indigo-700 shadow"
          >
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left column - controls with subtle 3D tilt */}
      <motion.section
        className="card space-y-4 will-change-transform"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Playground</h2>
            <p className="text-xs text-gray-500">Describe your task and let AI refine it</p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="kbd">⌘</span>
            <span className="text-xs text-gray-600">+</span>
            <span className="kbd">Enter</span>
            <span className="text-xs text-gray-600">to Ask AI</span>
          </div>
        </div>

        {/* Language, model, and prompt type selection */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="panel">
            <label className="mb-2 block text-xs font-medium text-gray-600">Prompt type</label>
            <select value={promptType} onChange={(e) => setPromptType(e.target.value as SupportPromptType)} className="w-full">
              {promptTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-gray-500">
              {supportPrompt.getDescription(promptType)}
            </p>
          </div>

          <div className="panel">
            <label className="mb-2 block text-xs font-medium text-gray-600">Programming language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full">
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="panel">
            <label className="mb-2 block text-xs font-medium text-gray-600">OpenAI model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full"
              disabled={modelsLoading || models.length === 0}
            >
              {modelsLoading && <option>Loading models…</option>}
              {!modelsLoading && models.length === 0 && <option disabled>No models found</option>}
              {!modelsLoading &&
                models.length > 0 &&
                models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
            </select>
            {modelsError && <p className="mt-2 text-xs text-red-600">{modelsError}</p>}
          </div>
        </div>

        {/* Input */}
        <div className="panel">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600">Your input</label>
            <span className="text-[11px] text-gray-500">{charCount} chars</span>
          </div>
          <textarea
            ref={inputRef}
            rows={10}
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            className="font-mono"
            placeholder="Describe what you need…"
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -1 }}
            onClick={onAskOpenAI}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={loading || modelsLoading || !model}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                Asking OpenAI…
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4">✨</span>
                Ask OpenAI
              </span>
            )}
          </motion.button>
          <motion.button whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }} onClick={() => setUserText('')} className="bg-gray-700 hover:bg-gray-800">
            <span className="mr-2 inline-block h-4 w-4">↺</span>
            Reset
          </motion.button>
        </div>
      </motion.section>

      {/* Right column - only AI output now */}
      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">OpenAI Response</label>
              <p className="text-xs text-gray-500">Result from the selected model</p>
            </div>
            <button onClick={() => onCopy(aiOutput)} disabled={!aiOutput} className="bg-indigo-500 hover:bg-indigo-600">
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {loading ? (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-white/70 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
            </div>
          ) : (
            <motion.pre
              key={aiOutput ? 'has-output' : 'empty'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-white/70 p-3 text-sm"
            >
              {aiOutput || 'OpenAI response will appear here...'}
            </motion.pre>
          )}
        </div>
      </motion.section>
    </div>
  )
}
