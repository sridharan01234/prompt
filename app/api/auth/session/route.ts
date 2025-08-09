import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // First check NextAuth session
    const session = await getServerSession(authOptions)
    
    if (session) {
      return NextResponse.json(session)
    }

    // Check for our custom Google auth cookie
    const googleAuthCookie = request.cookies.get('google-auth-user')
    
    if (googleAuthCookie) {
      try {
        const user = JSON.parse(googleAuthCookie.value)
        return NextResponse.json({
          user: {
            name: user.name,
            email: user.email,
            image: user.image,
          }
        })
      } catch (error) {
        console.error('Failed to parse Google auth cookie:', error)
      }
    }

    // No session found
    return NextResponse.json({})
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({}, { status: 500 })
  }
}
