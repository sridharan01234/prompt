import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prompt Enhancer',
  description: 'Enhance and generate prompts with templates and OpenAI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-6xl p-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold">Prompt Enhancer</h1>
            <p className="text-sm text-gray-600">Create, enhance, and manage prompts. Powered by OpenAI.</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
