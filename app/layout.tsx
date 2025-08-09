import './globals.css'
import type { Metadata } from 'next'
import AppShell from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'Prompt Enhancer',
  description: 'Enhance and generate prompts with templates and OpenAI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
