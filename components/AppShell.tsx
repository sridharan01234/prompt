'use client'

import { MotionConfig, motion } from 'framer-motion'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {/* Light, subtle background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-white to-slate-50" />

      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">P</span>
              <span className="text-sm font-semibold text-slate-900">Prompt Enhancer</span>
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">Beta</span>
            </div>
            <nav className="flex items-center gap-4 text-xs">
              <a href="/" className="text-slate-600 hover:text-slate-900">
                Home
              </a>
              <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900">
                GitHub
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-6xl px-4 py-6">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 text-center"
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Playground</h1>
          <p className="mt-1 text-sm text-slate-600">Describe, refine, and run prompts in one place.</p>
        </motion.header>

        {/* Fit main grid into viewport height */}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="fit-vh"
        >
          {children}
        </motion.main>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="mt-6 text-center text-xs text-slate-500"
        >
          Built with ❤️ for better prompts
        </motion.footer>
      </div>
    </MotionConfig>
  )
}
