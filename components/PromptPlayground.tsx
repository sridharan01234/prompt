'use client'

import { useState, useMemo, useEffect } from 'react'
import { supportPrompt } from 'prompt-core'
import type { SupportPromptType } from 'prompt-core'
const DEFAULT_TYPE: SupportPromptType = 'ENHANCE'

export default function PromptPlayground() {
  const [type, setType] = useState<SupportPromptType>(DEFAULT_TYPE)
  const [userText, setUserText] = useState<string>('Write a function to sort an array')
  const [output, setOutput] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [model, setModel] = useState<string>('')
  const [models, setModels] = useState<string[]>([])
  const [modelsLoading, setModelsLoading] = useState<boolean>(true)
  const [modelsError, setModelsError] = useState<string>('')
  const [aiOutput, setAiOutput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const templates = useMemo(() => supportPrompt.default, [])
  const templateVariables = useMemo(() => {
    const tpl = supportPrompt.get(undefined, type)
    const matches = Array.from(tpl.matchAll(/\$\{([a-zA-Z0-9_]+)\}/g))
    const vars = Array.from(new Set(matches.map((m) => m[1])))
    return vars
  }, [type])

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

  const onGenerate = () => {
    setError('')
    try {
      const params = { userInput: userText }
      const prompt = supportPrompt.create(type, params)
      setOutput(prompt)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const onAskOpenAI = async () => {
    setError('')
    setAiOutput('')
    setLoading(true)
    try {
      const params = { userInput: userText }
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: model || undefined, type, params })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setOutput(data.prompt)
      setAiOutput(data.output)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const onCopy = async () => {
    await navigator.clipboard.writeText(output)
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="space-y-3">
        <div className="rounded-md border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Prompt type</label>
            <span className="text-xs text-gray-500">Variables: {templateVariables.join(', ') || 'none'}</span>
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SupportPromptType)}
            className="w-full"
          >
            {Object.keys(templates).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-md border bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium">Your input</label>
          <textarea rows={12} value={userText} onChange={(e) => setUserText(e.target.value)} />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="rounded-md border bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium">OpenAI model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full"
            disabled={modelsLoading || models.length === 0}
          >
            {modelsLoading && <option>Loading models…</option>}
            {!modelsLoading && models.length === 0 && <option disabled>No models found</option>}
            {!modelsLoading && models.length > 0 &&
              models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
          </select>
          {modelsError && <p className="mt-2 text-sm text-red-600">{modelsError}</p>}
        </div>

        <div className="flex gap-3">
          <button onClick={onGenerate}>Generate</button>
          <button
            onClick={onAskOpenAI}
            className="bg-green-600 hover:bg-green-700"
            disabled={loading || modelsLoading || !model}
          >
            {loading ? 'Asking OpenAI…' : 'Ask OpenAI'}
          </button>
          <button onClick={() => setUserText('')} className="bg-gray-600 hover:bg-gray-700">
            Reset
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="rounded-md border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Generated Prompt</label>
            <div className="flex gap-2">
              <button onClick={onCopy} disabled={!output}>Copy</button>
            </div>
          </div>
          <pre className="max-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
            {output || 'Generated prompt will appear here...'}
          </pre>
        </div>

        <div className="rounded-md border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">OpenAI Response</label>
          </div>
          <pre className="max-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
            {aiOutput || 'OpenAI response will appear here...'}
          </pre>
        </div>
      </section>
    </div>
  )
}
