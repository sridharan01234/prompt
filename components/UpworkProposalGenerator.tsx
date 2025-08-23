'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './AuthProvider'

interface JobAnalysis {
  skills: string[]
  budget: string
  timeline: string
  complexity: 'low' | 'medium' | 'high'
  industry: string
  clientType: 'individual' | 'startup' | 'enterprise'
}

interface ResearchData {
  companyInfo?: string
  industryInsights?: string
  competitorAnalysis?: string
  marketTrends?: string
}

interface ProposalData {
  introduction: string
  experience: string
  approach: string
  portfolio: string
  pricing: string
  timeline: string
  callToAction: string
}

const specializationOptions = [
  { value: 'fullstack', label: 'Full-Stack Development', icon: '🔧' },
  { value: 'frontend', label: 'Frontend Development', icon: '🎨' },
  { value: 'backend', label: 'Backend Development', icon: '⚙️' },
  { value: 'mobile', label: 'Mobile Development', icon: '📱' },
  { value: 'ai-ml', label: 'AI/ML Development', icon: '🤖' },
  { value: 'devops', label: 'DevOps & Cloud', icon: '☁️' },
  { value: 'data', label: 'Data Engineering', icon: '📊' },
  { value: 'blockchain', label: 'Blockchain', icon: '⛓️' },
]

export default function UpworkProposalGenerator() {
  const { user } = useAuth()
  const [jobDescription, setJobDescription] = useState('')
  const [specialization, setSpecialization] = useState('fullstack')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null)
  const [researchData, setResearchData] = useState<ResearchData | null>(null)
  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const proposalRef = useRef<HTMLDivElement>(null)

  const steps = [
    'Analyzing job requirements',
    'Researching company & industry',
    'Gathering portfolio data',
    'Creating personalized proposal',
    'Optimizing for Upwork algorithm'
  ]

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) return

    setIsAnalyzing(true)
    setCurrentStep(0)

    try {
      // Step 1: Analyze job requirements with Memory MCP
      setCurrentStep(0)
      const analysisResponse = await fetch('/api/upwork/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, specialization })
      })
      const analysis = await analysisResponse.json()
      setJobAnalysis(analysis)

      // Step 2: Research with Firecrawl MCP
      setCurrentStep(1)
      const researchResponse = await fetch('/api/upwork/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobDescription, 
          analysis,
          keywords: analysis.skills?.slice(0, 5) || [] 
        })
      })
      const research = await researchResponse.json()
      setResearchData(research)

      // Step 3: Store insights in Memory MCP
      setCurrentStep(2)
      await fetch('/api/upwork/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'store_research',
          data: { analysis, research, specialization }
        })
      })

    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateProposal = async () => {
    if (!jobAnalysis || !researchData) return

    setIsGenerating(true)
    setCurrentStep(3)

    try {
      // Step 4: Generate proposal with all MCP data
      const response = await fetch('/api/upwork/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          specialization,
          analysis: jobAnalysis,
          research: researchData,
          userProfile: user
        })
      })

      const result = await response.json()
      setProposal(result.proposal)
      setCurrentStep(4)

      // Auto-scroll to proposal
      setTimeout(() => {
        proposalRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 500)

    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Add toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Specialization Selection */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Your Specialization</h3>
            <div className="grid grid-cols-2 gap-3">
              {specializationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSpecialization(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    specialization === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 text-gray-700'
                  }`}
                >
                  <div className="text-lg mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Job Description Input */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Job Description</h3>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete Upwork job description here, including requirements, budget, timeline, and any specific details from the client..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={analyzeJobDescription}
                disabled={!jobDescription.trim() || isAnalyzing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isAnalyzing ? 'Analyzing...' : '🔍 Analyze Job'}
              </button>
              <button
                onClick={generateProposal}
                disabled={!jobAnalysis || isGenerating}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? 'Generating...' : '✨ Generate Proposal'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Analysis & Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Progress Indicator */}
          {(isAnalyzing || isGenerating) && (
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Processing</h3>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      index < currentStep ? 'bg-green-500 text-white' :
                      index === currentStep ? 'bg-blue-500 text-white animate-pulse' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                    <span className={`text-sm ${
                      index <= currentStep ? 'text-gray-800 font-medium' : 'text-gray-500'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Analysis Results */}
          {jobAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Job Analysis</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobAnalysis.skills?.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Budget</h4>
                    <p className="text-sm text-gray-600">{jobAnalysis.budget || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Timeline</h4>
                    <p className="text-sm text-gray-600">{jobAnalysis.timeline || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Research Data */}
          {researchData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Research Insights</h3>
              <div className="space-y-3">
                {researchData.industryInsights && (
                  <div>
                    <h4 className="font-medium text-gray-700">Industry Insights</h4>
                    <p className="text-sm text-gray-600">{researchData.industryInsights}</p>
                  </div>
                )}
                {researchData.marketTrends && (
                  <div>
                    <h4 className="font-medium text-gray-700">Market Trends</h4>
                    <p className="text-sm text-gray-600">{researchData.marketTrends}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Generated Proposal */}
      {proposal && (
        <motion.div
          ref={proposalRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white rounded-xl p-8 shadow-xl border border-gray-200"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Your Winning Proposal</h3>
            <button
              onClick={() => copyToClipboard(Object.values(proposal).join('\n\n'))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              📋 Copy All
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(proposal).map(([section, content]) => (
              <div key={section} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-800 mb-2 capitalize">
                  {section.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <div className="text-gray-700 whitespace-pre-wrap">{content}</div>
                <button
                  onClick={() => copyToClipboard(content)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  📋 Copy Section
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
