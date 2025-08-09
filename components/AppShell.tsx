'use client'

import { MotionConfig, motion } from 'framer-motion'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {/* Dynamic gradient background with floating particles */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
        
        {/* Floating particles */}
        <div className="particle absolute w-1 h-1 bg-blue-400 rounded-full opacity-20" style={{top: '10%', left: '20%', animationDelay: '0s'}}></div>
        <div className="particle absolute w-2 h-2 bg-purple-400 rounded-full opacity-20" style={{top: '60%', left: '80%', animationDelay: '-5s'}}></div>
        <div className="particle absolute w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-20" style={{top: '30%', left: '70%', animationDelay: '-10s'}}></div>
        <div className="particle absolute w-1 h-1 bg-cyan-400 rounded-full opacity-20" style={{top: '80%', left: '10%', animationDelay: '-7s'}}></div>
        <div className="particle absolute w-1.5 h-1.5 bg-pink-400 rounded-full opacity-20" style={{top: '20%', left: '60%', animationDelay: '-3s'}}></div>
      </div>

      {/* Enhanced top navigation */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-sm opacity-75"></div>
                <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg">
                  P
                </span>
              </div>
              <div>
                <span className="text-lg font-bold text-white">Prompt Enhancer</span>
                <span className="ml-3 rounded-full bg-purple-600/20 px-3 py-1 text-xs font-medium text-purple-300 border border-purple-500/30">
                  Beta
                </span>
              </div>
            </motion.div>
            
            <motion.nav 
              className="flex items-center gap-6 text-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <a href="/" className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline decoration-blue-400">
                Home
              </a>
              <a 
                href="https://github.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-gray-300 hover:text-white transition-all duration-200 hover:underline decoration-purple-400 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </motion.nav>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center"
        >
          <div className="relative">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Playground
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl -z-10"></div>
          </div>
          <p className="text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Create, refine, and perfect your prompts with AI assistance. Transform your ideas into powerful, effective prompts.
          </p>
          
          {/* Feature highlights */}
          <div className="flex justify-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              AI-Powered Enhancement
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              Real-time Preview
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
              Multiple Models
            </div>
          </div>
        </motion.header>

        {/* Enhanced main content area */}
        <motion.main
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.1 }}
           className="min-h-[calc(100vh-180px)] grid items-start"
         >
           {children}
         </motion.main>
       </div>
    </MotionConfig>
  )
}
