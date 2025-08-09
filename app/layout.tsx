import './globals.css'
import AppShell from '@/components/AppShell'
import { AuthProvider } from '@/components/AuthProvider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Prompt Enhancer',
  description: 'Create, enhance, and perfect your prompts effortlessly.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
