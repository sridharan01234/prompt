'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Clean, modern header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex h-14 items-center justify-between">
            <motion.div 
              className="flex items-center gap-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">P</span>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">AI Tools</span>
                </div>
              </div>
              
              {/* Navigation tabs */}
              <nav className="flex items-center gap-1">
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === '/' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  ✨ Prompt Enhancer
                </Link>
                <Link
                  href="/upwork"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === '/upwork' 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  💼 Upwork Proposals
                </Link>
              </nav>
            </motion.div>
            
            <motion.nav 
              className="flex items-center gap-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <a 
                href="https://github.com/sridharan01234/prompt" 
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </motion.nav>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto py-4 px-4">
        {pathname === '/' && (
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
              Prompt Enhancer
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your ideas into powerful prompts using proven prompt engineering techniques
            </p>
          </motion.header>
        )}

        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
