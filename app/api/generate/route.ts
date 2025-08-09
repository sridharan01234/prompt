import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supportPrompt, SupportPromptType } from 'prompt-core'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { model = 'gpt-4o-mini', type = 'ENHANCE', params } = body as {
      model?: string
      type?: SupportPromptType
      params: Record<string, any>
    }

    const prompt = supportPrompt.create(type, params)

    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is missing. Create web/.env.local with OPENAI_API_KEY=your_key and restart dev server.' },
        { status: 500 }
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

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompts[type] },
        { role: 'user', content: prompt }
      ]
    })

    const content = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ prompt, output: content, type })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
