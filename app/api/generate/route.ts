import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supportPrompt, SupportPromptType } from 'prompt-core'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isPremiumModel, isLimitedModel } from '@/lib/models'
import { checkAndConsumeTokens } from '@/lib/quota'
import { sridharanProfile, formatExperienceForProposal } from '@/lib/user-profile'

// Enhanced research function for Upwork proposals
async function enhanceWithWebResearch(jobDescription: string) {
  try {
    // Research prompt engineering techniques
    const promptResearch = await fetch('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'mcp_firecrawl_firecrawl_search',
        params: {
          query: 'prompt engineering techniques best practices',
          limit: 3,
          scrapeOptions: { formats: ['markdown'], onlyMainContent: true }
        }
      })
    }).then(res => res.json()).catch(() => ({ results: [] }))

    // Research Upwork proposal best practices  
    const upworkResearch = await fetch('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'mcp_firecrawl_firecrawl_search',
        params: {
          query: 'Upwork proposal writing tips winning strategies',
          limit: 3,
          scrapeOptions: { formats: ['markdown'], onlyMainContent: true }
        }
      })
    }).then(res => res.json()).catch(() => ({ results: [] }))

    // Extract key insights from research
    const promptTechniques = promptResearch.results?.map((r: any) => r.content).join('\n') || ''
    const upworkStrategies = upworkResearch.results?.map((r: any) => r.content).join('\n') || ''

    return {
      promptTechniques: promptTechniques.substring(0, 2000), // Limit content
      upworkStrategies: upworkStrategies.substring(0, 2000),
      jobDescription
    }
  } catch (error) {
    console.error('Research error:', error)
    return { promptTechniques: '', upworkStrategies: '', jobDescription }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { model = 'gpt-4o-mini', type = 'ENHANCE', params } = body as {
      model?: string
      type?: SupportPromptType
      params: Record<string, any>
    }

    // Validate model
    const session = await getServerSession(authOptions as any)
    let userId = (session as any)?.userId || null
    let authed = Boolean(session)

    // Check for our custom Google auth cookie if no NextAuth session
    if (!authed) {
      const googleAuthCookie = req.cookies.get('google-auth-user')
      if (googleAuthCookie) {
        try {
          const user = JSON.parse(googleAuthCookie.value)
          userId = user.id
          authed = true
        } catch (error) {
          console.error('Failed to parse Google auth cookie:', error)
        }
      }
    }

    if (isPremiumModel(model) && !authed) {
      return NextResponse.json({ error: 'Sign in with Google to use premium models.' }, { status: 403 })
    }
    if (!isPremiumModel(model) && !isLimitedModel(model)) {
      return NextResponse.json({ error: 'Unsupported model.' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is missing. Create web/.env.local with OPENAI_API_KEY=your_key and restart dev server.' },
        { status: 500 }
      )
    }

    const client = new OpenAI({ apiKey })

    // Enhanced system prompts that work better with the main prompt templates
    const systemPrompts: Record<SupportPromptType, string> = {
      ENHANCE: 'You are an expert prompt engineer with deep knowledge of advanced prompting techniques, Chain-of-Thought reasoning, and effective instruction design. Apply proven prompt engineering principles to create significantly more effective prompts.',
      ANALYZE: 'You are a senior software architect and security-focused code reviewer with expertise in multiple programming languages. Provide thorough, actionable analysis with specific improvement recommendations and clear priority levels.',
      DEBUG: 'You are a systematic debugging expert with deep technical knowledge and proven problem-solving methodologies. Identify root causes quickly and provide complete solutions with clear explanations.',
      OPTIMIZE: 'You are a performance optimization specialist with expertise in algorithmic efficiency, memory management, and system performance. Focus on measurable improvements with clear before/after comparisons.',
      DOCUMENT: 'You are a technical documentation expert who creates comprehensive, well-structured documentation that serves both as reference material and learning resources. Write clear, practical documentation with good examples.',
      TEST: 'You are a testing expert with comprehensive knowledge of testing frameworks, quality assurance, and test-driven development. Create thorough, maintainable test suites with excellent coverage.',
      UPWORK: 'You are an elite Upwork proposal specialist with a proven track record of winning high-value contracts. You understand client psychology, freelancer positioning, and the competitive dynamics of the platform. Create proposals that get noticed, build trust, and secure interviews.'
    }

    // Enhanced processing for UPWORK type with web research
    let enhancedParams = params
    if (type === 'UPWORK' && params.userInput) {
      const researchData = await enhanceWithWebResearch(params.userInput)
      const profileInfo = formatExperienceForProposal(params.language || 'Web Development')
      
      enhancedParams = {
        ...params,
        userInput: params.userInput,
        language: params.language || 'Web Development',
        promptTechniques: researchData.promptTechniques,
        upworkStrategies: researchData.upworkStrategies,
        profileInfo: profileInfo,
        freelancerName: sridharanProfile.name,
        freelancerTitle: sridharanProfile.title,
        portfolioUrl: 'https://portfolio-sridharan01234s-projects.vercel.app',
        researchEnhanced: true
      }
    }

    const prompt = supportPrompt.create(type, enhancedParams)

    // Estimate tokens (simple heuristic: ~4 chars/token)
    const estimatedTokens = Math.ceil((prompt?.length || 0) / 4) + 512 // account for output
    const quota = await checkAndConsumeTokens(userId, model, estimatedTokens)
    if (!quota.allowed) {
      return NextResponse.json(
        { error: `Daily token limit reached for ${isPremiumModel(model) ? 'premium' : 'free'} tier. Remaining: ${quota.remaining}/${quota.limit}` },
        { status: 429 }
      )
    }
    const isStreamingRequested = req.headers.get('accept') === 'text/stream' || 
                                req.nextUrl.searchParams.get('stream') === 'true'

    if (isStreamingRequested) {
      // Create streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send initial metadata
            const encoder = new TextEncoder()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'metadata', 
              prompt, 
              model, 
              promptType: type 
            })}\n\n`))

            // Create streaming completion
            const completion = await client.chat.completions.create({
              model,
              messages: [
                { role: 'system', content: systemPrompts[type] },
                { role: 'user', content: prompt }
              ],
              stream: true, // Enable streaming
            })

            // Stream each chunk as it arrives
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content
              if (content) {
                // Send content chunk in Server-Sent Events format
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'content', 
                  content 
                })}\n\n`))
              }
            }

            // Send completion signal
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'complete' 
            })}\n\n`))
            
            controller.close()
          } catch (error) {
            console.error('Streaming error:', error)
            const encoder = new TextEncoder()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: (error as Error).message 
            })}\n\n`))
            controller.close()
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Accept'
        }
      })
    } else {
      // Non-streaming fallback (existing behavior)
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompts[type] },
          { role: 'user', content: prompt }
        ]
      })

      const content = completion.choices[0]?.message?.content || ''
      return NextResponse.json({ prompt, output: content, type })
    }
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
