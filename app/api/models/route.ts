import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ALL_MODELS, LIMITED_MODELS, PREMIUM_MODELS } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    let isAuthed = Boolean(session)

    // Check for our custom Google auth cookie if no NextAuth session
    if (!isAuthed) {
      const googleAuthCookie = request.cookies.get('google-auth-user')
      isAuthed = Boolean(googleAuthCookie)
    }

    // Always return all models so free users can see premium choices in the UI
    // Include metadata so the client can distinguish premium vs free and auth state
    const payload = {
      models: [...ALL_MODELS].sort(),
      premium: [...PREMIUM_MODELS].sort(),
      limited: [...LIMITED_MODELS].sort(),
      authed: isAuthed
    }

    return NextResponse.json(payload)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
