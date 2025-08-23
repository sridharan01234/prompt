import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    if (!type || !data) {
      return NextResponse.json({ error: 'Type and data are required' }, { status: 400 })
    }

    switch (type) {
      case 'store_research':
        await storeResearchData(data)
        break
      case 'store_proposal':
        await storeProposalData(data)
        break
      case 'get_insights':
        return NextResponse.json(await getStoredInsights(data.query))
      default:
        return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Memory operation failed:', error)
    return NextResponse.json({ error: 'Memory operation failed' }, { status: 500 })
  }
}

async function storeResearchData(data: any) {
  try {
    // Use Memory MCP to store research insights and job analysis
    const entities = [
      {
        name: `ResearchSession_${Date.now()}`,
        entityType: 'UpworkResearch',
        observations: [
          `Specialization: ${data.specialization}`,
          `Job complexity: ${data.analysis.complexity}`,
          `Industry: ${data.analysis.industry}`,
          `Required skills: ${data.analysis.skills.join(', ')}`,
          `Research insights: ${JSON.stringify(data.research)}`
        ]
      },
      {
        name: `JobAnalysis_${Date.now()}`,
        entityType: 'JobRequirements',
        observations: [
          `Skills: ${data.analysis.skills.join(', ')}`,
          `Budget: ${data.analysis.budget}`,
          `Timeline: ${data.analysis.timeline}`,
          `Client type: ${data.analysis.clientType}`
        ]
      }
    ]

    // This would call the actual Memory MCP
    console.log('Storing research data in Memory MCP:', entities)
    
    // Mock storing in memory for now
    return { success: true, stored: entities.length }
  } catch (error) {
    console.error('Failed to store research data:', error)
    throw error
  }
}

async function storeProposalData(data: any) {
  try {
    // Store successful proposal data for learning
    const entity = {
      name: `SuccessfulProposal_${Date.now()}`,
      entityType: 'ProposalTemplate',
      observations: [
        `Specialization: ${data.specialization}`,
        `Client type: ${data.clientType}`,
        `Project complexity: ${data.complexity}`,
        `Proposal structure: ${Object.keys(data.proposal).join(', ')}`,
        `Success metrics: ${data.metrics || 'N/A'}`
      ]
    }

    console.log('Storing proposal data in Memory MCP:', entity)
    return { success: true, stored: 1 }
  } catch (error) {
    console.error('Failed to store proposal data:', error)
    throw error
  }
}

async function getStoredInsights(query: string) {
  try {
    // Retrieve relevant insights from Memory MCP based on query
    // This would search through stored entities and relations
    
    // Mock response for now
    const insights = {
      similarJobs: [
        'Previous React + Node.js project with similar requirements',
        'E-commerce platform with payment integration experience',
        'Scalable backend architecture for growing startup'
      ],
      successfulStrategies: [
        'Emphasize specific technical experience first',
        'Include timeline breakdown with milestones',
        'Mention relevant portfolio projects',
        'Address potential challenges proactively'
      ],
      industryContext: 'Based on stored data, similar projects in this industry typically focus on scalability and user experience.',
      recommendedApproach: 'Lead with technical expertise, provide detailed project plan, and emphasize communication style.'
    }

    return insights
  } catch (error) {
    console.error('Failed to retrieve insights:', error)
    return {
      similarJobs: [],
      successfulStrategies: [],
      industryContext: 'No previous context available.',
      recommendedApproach: 'Standard professional approach recommended.'
    }
  }
}
