import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'
import { LIMITED_MODELS, PREMIUM_MODELS } from '@/lib/models'

export async function GET(request: NextRequest) {
  let isAuthed = false
  try {
    const session = await getServerSession(authOptions as any)
    isAuthed = Boolean(session)

    // Check for our custom Google auth cookie if no NextAuth session
    if (!isAuthed) {
      const googleAuthCookie = request.cookies.get('google-auth-user')
      isAuthed = Boolean(googleAuthCookie)
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is missing')
    }

    const openai = new OpenAI({ apiKey })
    const response = await openai.models.list()
    const apiModelIds = response.data.map(m => m.id)

    // Filter our specified models to only include the ones returned/supported by the OpenAI API
    const premium = PREMIUM_MODELS.filter(m => apiModelIds.includes(m)).sort()
    const limited = LIMITED_MODELS.filter(m => apiModelIds.includes(m)).sort()
    const models = [...limited, ...premium].sort()

    // If both filtered lists are empty, fallback to the full list to prevent a blank UI in dev
    if (models.length === 0) {
      console.warn('OpenAI API models list returned no matching specified models, falling back to full static lists.')
      return NextResponse.json({
        models: [...LIMITED_MODELS, ...PREMIUM_MODELS].sort(),
        premium: [...PREMIUM_MODELS].sort(),
        limited: [...LIMITED_MODELS].sort(),
        authed: isAuthed
      })
    }

    const payload = {
      models,
      premium,
      limited,
      authed: isAuthed
    }

    return NextResponse.json(payload)
  } catch (e) {
    console.error('Error fetching dynamic models from OpenAI API, falling back to static lists:', e)
    
    // Graceful fallback to static list to avoid breaking frontend playground
    const premium = [...PREMIUM_MODELS].sort()
    const limited = [...LIMITED_MODELS].sort()
    const models = [...limited, ...premium].sort()

    return NextResponse.json({
      models,
      premium,
      limited,
      authed: isAuthed,
      error: (e as Error).message
    })
  }
}
