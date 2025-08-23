import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, specialization } = await request.json()

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
    }

    // Use Memory MCP to analyze job requirements and store insights
    const analysis = {
      skills: extractSkills(jobDescription, specialization),
      budget: extractBudget(jobDescription),
      timeline: extractTimeline(jobDescription),
      complexity: assessComplexity(jobDescription),
      industry: identifyIndustry(jobDescription),
      clientType: identifyClientType(jobDescription)
    }

    // Store the analysis in Memory MCP for future reference
    try {
      // Create entities for this job analysis
      await storeJobAnalysisInMemory(analysis, jobDescription)
    } catch (error) {
      console.error('Failed to store in Memory MCP:', error)
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

function extractSkills(jobDescription: string, specialization: string): string[] {
  const text = jobDescription.toLowerCase()
  const skillMap: Record<string, string[]> = {
    fullstack: ['react', 'node.js', 'javascript', 'typescript', 'mongodb', 'express', 'next.js', 'full-stack'],
    frontend: ['react', 'vue', 'angular', 'javascript', 'typescript', 'css', 'html', 'ui/ux'],
    backend: ['node.js', 'python', 'java', 'api', 'database', 'microservices', 'rest', 'graphql'],
    mobile: ['react native', 'flutter', 'ios', 'android', 'mobile', 'app development'],
    'ai-ml': ['machine learning', 'artificial intelligence', 'python', 'tensorflow', 'pytorch', 'data science'],
    devops: ['aws', 'docker', 'kubernetes', 'ci/cd', 'cloud', 'infrastructure', 'deployment'],
    data: ['data engineering', 'sql', 'python', 'etl', 'data pipeline', 'analytics', 'big data'],
    blockchain: ['blockchain', 'ethereum', 'smart contracts', 'web3', 'solidity', 'cryptocurrency']
  }

  const relevantSkills = skillMap[specialization] || []
  const foundSkills = relevantSkills.filter(skill => 
    text.includes(skill.toLowerCase())
  )

  // Add general skills found in the job description
  const generalSkills = ['api', 'database', 'testing', 'git', 'agile', 'scrum', 'responsive design']
  const additionalSkills = generalSkills.filter(skill => 
    text.includes(skill.toLowerCase())
  )

  return [...foundSkills, ...additionalSkills].slice(0, 8)
}

function extractBudget(jobDescription: string): string {
  const budgetRegex = /\$[\d,]+(?:\s*-\s*\$?[\d,]+)?|\d+\s*(?:hr|hour|hours?)\s*\$[\d,]+/gi
  const matches = jobDescription.match(budgetRegex)
  return matches ? matches[0] : 'Budget not specified'
}

function extractTimeline(jobDescription: string): string {
  const timelineRegex = /(?:within|in|by|deadline|timeline|duration)?\s*(\d+)\s*(days?|weeks?|months?|hours?)/gi
  const matches = jobDescription.match(timelineRegex)
  return matches ? matches[0] : 'Timeline not specified'
}

function assessComplexity(jobDescription: string): 'low' | 'medium' | 'high' {
  const text = jobDescription.toLowerCase()
  const complexityIndicators = {
    high: ['enterprise', 'scalable', 'microservices', 'advanced', 'complex', 'senior', 'expert'],
    medium: ['experienced', 'professional', 'multiple', 'integration', 'api'],
    low: ['simple', 'basic', 'beginner', 'small', 'quick']
  }

  for (const [level, indicators] of Object.entries(complexityIndicators)) {
    if (indicators.some(indicator => text.includes(indicator))) {
      return level as 'low' | 'medium' | 'high'
    }
  }

  return 'medium'
}

function identifyIndustry(jobDescription: string): string {
  const text = jobDescription.toLowerCase()
  const industries = {
    'E-commerce': ['ecommerce', 'e-commerce', 'shopping', 'store', 'cart', 'payment'],
    'Fintech': ['financial', 'banking', 'payment', 'cryptocurrency', 'trading'],
    'Healthcare': ['health', 'medical', 'patient', 'clinic', 'hospital'],
    'Education': ['education', 'learning', 'course', 'student', 'school'],
    'SaaS': ['saas', 'subscription', 'platform', 'software as a service'],
    'Startup': ['startup', 'mvp', 'prototype', 'launch'],
    'Enterprise': ['enterprise', 'corporate', 'business', 'organization']
  }

  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return industry
    }
  }

  return 'Technology'
}

function identifyClientType(jobDescription: string): 'individual' | 'startup' | 'enterprise' {
  const text = jobDescription.toLowerCase()
  
  if (text.includes('enterprise') || text.includes('corporate') || text.includes('large company')) {
    return 'enterprise'
  }
  if (text.includes('startup') || text.includes('small team') || text.includes('growing company')) {
    return 'startup'
  }
  return 'individual'
}

async function storeJobAnalysisInMemory(analysis: any, jobDescription: string) {
  try {
    // This would use the Memory MCP to store the analysis
    // For now, we'll simulate the storage
    console.log('Storing job analysis in Memory MCP:', analysis)
    
    // In a real implementation, you would call the Memory MCP API here
    // Example structure for what would be stored:
    const memoryData = {
      entities: [
        {
          name: `Job_${Date.now()}`,
          entityType: 'UpworkJob',
          observations: [
            `Skills required: ${analysis.skills.join(', ')}`,
            `Budget: ${analysis.budget}`,
            `Timeline: ${analysis.timeline}`,
            `Complexity: ${analysis.complexity}`,
            `Industry: ${analysis.industry}`,
            `Client type: ${analysis.clientType}`,
            `Original description: ${jobDescription.substring(0, 200)}...`
          ]
        }
      ]
    }
    
    return memoryData
  } catch (error) {
    console.error('Memory MCP storage failed:', error)
    throw error
  }
}
