import { NextRequest, NextResponse } from 'next/server'

// Verify Google JWT token using Google's tokeninfo endpoint
async function verifyGoogleToken(credential: string) {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    
    if (!response.ok) {
      throw new Error('Token verification failed')
    }

    const payload = await response.json()
    
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new Error('Invalid audience')
    }

    if (!payload.email_verified) {
      throw new Error('Email not verified')
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new Error('Token verification failed')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json({ error: 'No credential provided' }, { status: 400 })
    }

    // Verify the Google token
    const googleUser = await verifyGoogleToken(credential)

    const user = {
      id: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      image: googleUser.picture,
    }

    // Set session cookie (simplified approach)
    const response = NextResponse.json({ 
      success: true, 
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
      }
    })

    response.cookies.set('google-auth-user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
