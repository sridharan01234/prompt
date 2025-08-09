import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supportPrompt, SupportPromptType } from 'prompt-core'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isPremiumModel, isLimitedModel } from '@/lib/models'
import { checkAndConsumeTokens } from '@/lib/quota'

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

    const prompt = supportPrompt.create(type, params)

    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is missing. Create web/.env.local with OPENAI_API_KEY=your_key and restart dev server.' },
        { status: 500 }
      )
    }

    // Estimate tokens (simple heuristic: ~4 chars/token)
    const estimatedTokens = Math.ceil((prompt?.length || 0) / 4) + 512 // account for output
    const quota = await checkAndConsumeTokens(userId, model, estimatedTokens)
    if (!quota.allowed) {
      return NextResponse.json(
        { error: `Daily token limit reached for ${isPremiumModel(model) ? 'premium' : 'free'} tier. Remaining: ${quota.remaining}/${quota.limit}` },
        { status: 429 }
      )
    }

    const client = new OpenAI({ apiKey })

    // Different system prompts based on prompt type for better results
    const systemPrompts: Record<SupportPromptType, string> = {
      ENHANCE: 'You are an expert prompt engineer specializing in creating effective, structured prompts.',
      ANALYZE: 'You are a senior software architect and code reviewer with expertise in multiple programming languages.',
      DEBUG: 'You are an expert debugger with systematic problem-solving skills and deep technical knowledge.',
      OPTIMIZE: 'You are a performance optimization expert with deep knowledge of algorithms and system efficiency.',
      DOCUMENT: 'You are a technical documentation specialist who creates clear, comprehensive, and maintainable documentation.',
      TEST: 'You are a testing expert specializing in comprehensive test strategies and quality assurance.'
    }

    // Check if client requests streaming via header or query param
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
              temperature: 0.7,
              max_tokens: 4000
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
