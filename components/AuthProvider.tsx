'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  name?: string
  email?: string
  picture?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  signIn: () => void
  signOut: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback?: (notification: any) => void) => void
          renderButton: (element: HTMLElement, config: any) => void
          disableAutoSelect: () => void
          cancel: () => void
        }
      }
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const session = await response.json()
        if (session && Object.keys(session).length > 0) {
          setUser(session.user || null)
        } else {
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Failed to check session:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (!window.google) {
      // Google Identity Services not loaded yet, wait for it
      const checkGoogle = () => {
        if (window.google) {
          initializeGoogleAuth()
        } else {
          setTimeout(checkGoogle, 100)
        }
      }
      checkGoogle()
    } else {
      initializeGoogleAuth()
    }
  }, [])

  const initializeGoogleAuth = () => {
    if (!window.google) return

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: false,
    })

    // Only show One Tap if user is not already authenticated
    if (!user && !isLoading) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap was not displayed or skipped
          console.log('One Tap not displayed:', notification.getNotDisplayedReason())
        }
      })
    }
  }

  const handleGoogleResponse = async (response: any) => {
    try {
      setIsLoading(true)
      
      // Send the credential to our API
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        // Refresh the page to update authentication state across the app
        window.location.reload()
      } else {
        console.error('Authentication failed')
      }
    } catch (error) {
      console.error('Authentication error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt()
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      
      // Sign out from our API
      await fetch('/api/auth/signout', {
        method: 'POST',
      })

      // Sign out from Google
      if (window.google) {
        window.google.accounts.id.disableAutoSelect()
      }

      setUser(null)
      // Refresh the page to update authentication state
      window.location.reload()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    signIn,
    signOut,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
