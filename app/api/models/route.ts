import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is missing. Create web/.env.local with OPENAI_API_KEY=your_key and restart dev server.' },
        { status: 500 }
      )
    }

    const res = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: 'no-store'
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    const models = Array.isArray(data.data)
      ? data.data
          .map((m: any) => m.id as string)
          .filter((id: string) => typeof id === 'string')
          .sort()
      : []

    return NextResponse.json({ models })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
