'use client'

import { MotionConfig, motion } from 'framer-motion'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {/* Animated background accents */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-tr from-fuchsia-400/30 to-indigo-400/30 blur-3xl"
          animate={{ x: [0, 20, -10, 0], y: [0, -10, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-gradient-to-tr from-rose-300/30 to-violet-300/30 blur-3xl"
          animate={{ x: [0, -15, 10, 0], y: [0, 15, -10, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">Prompt Enhancer</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">Create, enhance, and manage prompts. Powered by OpenAI.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">Next.js</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Tailwind CSS</span>
            <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700">Framer Motion</span>
          </div>
        </motion.header>

        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
          {children}
        </motion.main>

        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-12 text-center text-xs text-gray-500">
          Built with ❤️ for better prompts
        </motion.footer>
      </div>
    </MotionConfig>
  )
}
