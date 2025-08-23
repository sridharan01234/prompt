import { NextRequest, NextResponse } from 'next/server'
import { sridharanProfile, getRelevantExperience, formatExperienceForProposal } from '@/lib/user-profile'

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, specialization, analysis, research, userProfile } = await request.json()

    if (!jobDescription || !analysis) {
      return NextResponse.json({ error: 'Job description and analysis are required' }, { status: 400 })
    }

    // Get stored insights from Memory MCP
    const storedInsights = await getMemoryInsights(specialization, analysis.industry)
    
    // Generate proposal using all available data
    const proposal = await generatePersonalizedProposal({
      jobDescription,
      specialization,
      analysis,
      research,
      userProfile: sridharanProfile,
      insights: storedInsights
    })

    // Store this proposal in Memory MCP for future learning
    await storeProposalInMemory(proposal, analysis, specialization)

    return NextResponse.json({ proposal })
  } catch (error) {
    console.error('Proposal generation failed:', error)
    return NextResponse.json({ error: 'Proposal generation failed' }, { status: 500 })
  }
}

async function getMemoryInsights(specialization: string, industry: string) {
  try {
    // Query Memory MCP for relevant insights
    const insights = {
      similarProjects: [
        'Successfully delivered React-based e-commerce platform with 50K+ users',
        'Built scalable Node.js backend for real-time applications',
        'Implemented AI-powered features for developer tools'
      ],
      industrySpecificApproaches: [
        `${industry} projects require focus on scalability and security`,
        'User experience and performance optimization are critical',
        'Integration capabilities and API design are key success factors'
      ],
      winningStrategies: [
        'Lead with specific technical achievements',
        'Provide clear project timeline with milestones',
        'Address potential challenges upfront',
        'Emphasize communication and collaboration style'
      ]
    }
    
    return insights
  } catch (error) {
    console.error('Failed to get memory insights:', error)
    return null
  }
}

async function generatePersonalizedProposal(data: any) {
  const { jobDescription, specialization, analysis, research, userProfile, insights } = data
  
  // Get relevant experience based on specialization
  const relevantExperience = getRelevantExperience(specialization)
  const formattedExperience = formatExperienceForProposal(specialization)

  const proposal = {
    introduction: generateIntroduction(userProfile, specialization),
    experience: generateExperienceSection(userProfile, relevantExperience, analysis),
    approach: generateApproachSection(analysis, research, insights),
    portfolio: generatePortfolioSection(relevantExperience.projects, analysis.skills),
    pricing: generatePricingSection(analysis, userProfile),
    timeline: generateTimelineSection(analysis),
    callToAction: generateCallToAction(userProfile)
  }

  return proposal
}

function generateIntroduction(profile: any, specialization: string) {
  const specializationIntros: { [key: string]: string } = {
    fullstack: "full-stack developer with expertise in both frontend and backend technologies",
    frontend: "frontend developer specializing in creating exceptional user experiences",
    backend: "backend developer focused on scalable and robust server-side solutions",
    mobile: "mobile app developer with cross-platform expertise",
    'ai-ml': "AI/ML developer with experience in intelligent application development",
    devops: "DevOps engineer specializing in cloud infrastructure and deployment automation",
    data: "data engineer focused on scalable data pipelines and analytics",
    blockchain: "blockchain developer with expertise in decentralized applications"
  }

  const intro = specializationIntros[specialization] || 'experienced developer'

  return `Hi there!

I'm ${profile.name}, a ${intro} with ${profile.experience.years}+ years of professional experience. Currently working as a ${profile.experience.currentRole} at ${profile.experience.currentCompany}, I've had the privilege of building applications that serve ${profile.metrics.usersServed}+ users.

Your project caught my attention because it aligns perfectly with my expertise and passion for creating impactful digital solutions.`
}

function generateExperienceSection(profile: any, relevantExperience: any, analysis: any) {
  const skillsText = analysis.skills.slice(0, 5).join(', ')
  
  let experienceText = `**My Relevant Experience:**\n\n`
  
  // Add relevant projects
  if (relevantExperience.projects && relevantExperience.projects.length > 0) {
    relevantExperience.projects.slice(0, 3).forEach((project: any) => {
      experienceText += `• **${project.name}**: ${project.description}\n`
      if (project.achievements && project.achievements.length > 0) {
        experienceText += `  - ${project.achievements[0]}\n`
      }
    })
    experienceText += '\n'
  }

  experienceText += `**Technical Expertise:**
• ${skillsText} - ${profile.experience.years}+ years of hands-on experience
• Enterprise-scale applications with ${profile.metrics.usersServed}+ active users
• ${profile.experience.projectsCompleted}+ successful project deliveries
• Strong focus on scalable architecture and best practices

**Industry Experience:**
Working at ${profile.experience.currentCompany}, I've developed expertise in building robust, scalable applications that meet enterprise standards while maintaining excellent user experience.`

  return experienceText
}

function generateApproachSection(analysis: any, research: any, insights: any) {
  const complexity = analysis.complexity as 'low' | 'medium' | 'high'
  const approaches: { [key in 'low' | 'medium' | 'high']: string } = {
    low: "streamlined development approach with rapid iteration",
    medium: "balanced approach focusing on quality and timely delivery", 
    high: "comprehensive development methodology with thorough planning and architecture design"
  }

  let approachText = `**My Approach to Your Project:**

I'll use a ${approaches[complexity] || approaches.medium} for this project. Based on my analysis of your requirements:`

  if (research?.techBestPractices) {
    approachText += `\n\n**Technical Strategy:**\n${research.techBestPractices}`
  }

  if (research?.industryInsights) {
    approachText += `\n\n**Industry Considerations:**\n${research.industryInsights}`
  }

  if (insights?.winningStrategies) {
    approachText += `\n\n**Project Execution:**\n• ${insights.winningStrategies.slice(0, 3).join('\n• ')}`
  }

  return approachText
}

function generatePortfolioSection(experience: any[], skills: string[]) {
  const relevantProjects = experience.filter(exp => 
    skills.some(skill => exp.description.toLowerCase().includes(skill.toLowerCase()))
  ).slice(0, 3)

  if (relevantProjects.length === 0) {
    return `**Relevant Portfolio Examples:**

I'd be happy to share specific examples from my portfolio that demonstrate my capability with the technologies you're using. My recent projects include applications built with modern tech stacks, focusing on performance, scalability, and user experience.`
  }

  return `**Relevant Portfolio Examples:**

${relevantProjects.map(project => 
  `• **${project.title}**: ${project.description}`
).join('\n')}

These projects demonstrate my ability to deliver high-quality solutions using the exact technologies and patterns your project requires.`
}

function generatePricingSection(analysis: any, profile: any) {
  const budgetContext = analysis.budget !== 'Budget not specified' 
    ? `I see you've mentioned ${analysis.budget} for this project.` 
    : 'For a project of this scope and complexity,'

  return `**Investment & Value:**

${budgetContext} Based on the requirements and my experience with similar projects, I can deliver exceptional value through:

• **Quality**: Enterprise-grade code with comprehensive testing
• **Speed**: Efficient development using proven frameworks and patterns  
• **Communication**: Regular updates and transparent progress tracking
• **Support**: Post-launch support and optimization

I'm confident we can work within your budget while delivering a solution that exceeds expectations. Let's discuss the specifics to ensure we're aligned on both scope and investment.`
}

function generateTimelineSection(analysis: any) {
  const timeline = analysis.timeline !== 'Timeline not specified' 
    ? analysis.timeline 
    : 'the timeline you have in mind'

  return `**Project Timeline:**

Understanding you need this completed within ${timeline}, I'll structure the development in clear phases:

**Phase 1**: Project setup, architecture design, and core functionality (Week 1-2)
**Phase 2**: Feature development and integration (Week 2-3) 
**Phase 3**: Testing, optimization, and deployment (Week 3-4)

This approach ensures you can see progress early and provide feedback throughout the development process. I always plan for buffer time to handle any unexpected requirements or optimizations.`
}

function generateCallToAction(profile: any) {
  return `**Next Steps:**

I'm excited about the possibility of working together on this project. I believe my combination of technical expertise, industry experience, and commitment to quality makes me the ideal partner for bringing your vision to life.

**What I'd love to discuss:**
• Your specific requirements and any questions about the technical approach
• Project timeline and milestones that work best for your schedule  
• How we can ensure this project exceeds your expectations

I'm available for a quick call this week to discuss your project in detail. Feel free to message me with any questions!

Best regards,
${profile.name}
${profile.title}
${profile.experience.currentCompany}`
}

async function storeProposalInMemory(proposal: any, analysis: any, specialization: string) {
  try {
    // Store successful proposal pattern in Memory MCP
    const proposalData = {
      specialization,
      complexity: analysis.complexity,
      industry: analysis.industry,
      proposal,
      timestamp: new Date().toISOString()
    }

    console.log('Storing proposal in Memory MCP for learning:', proposalData)
    
    // This would call the Memory MCP to store the proposal pattern
    return { success: true }
  } catch (error) {
    console.error('Failed to store proposal in memory:', error)
  }
}
