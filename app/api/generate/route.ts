import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supportPrompt } from 'prompt-core'
import type { SupportPromptType } from 'prompt-core'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { model = 'gpt-4o-mini', type, params } = body as {
      model?: string
      type: SupportPromptType
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

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ]
    })

    const content = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ prompt, output: content })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
