'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import UpworkProposalGenerator from '@/components/UpworkProposalGenerator'

export default function UpworkPage() {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
              <span className="text-2xl">💼</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Upwork Proposal Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI-powered proposal generator with advanced web research, portfolio integration, 
            and personalized content creation using multiple MCP servers for maximum effectiveness.
          </p>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-green-200"
            >
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-semibold text-gray-800">Smart Research</h3>
              <p className="text-sm text-gray-600">Deep web research with Firecrawl MCP</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200"
            >
              <div className="text-2xl mb-2">🧠</div>
              <h3 className="font-semibold text-gray-800">AI Memory</h3>
              <p className="text-sm text-gray-600">Knowledge graph with Memory MCP</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200"
            >
              <div className="text-2xl mb-2">🖼️</div>
              <h3 className="font-semibold text-gray-800">Image Analysis</h3>
              <p className="text-sm text-gray-600">Visual content with ImageSorcery MCP</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Authentication */}
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">🚀</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Upwork AI</h2>
                <p className="text-gray-600">Sign in to access personalized proposal generation</p>
              </div>
              <GoogleSignInButton />
            </motion.div>
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <UpworkProposalGenerator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
