'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from './AuthProvider'

interface GoogleSignInButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  size?: 'large' | 'medium' | 'small'
  width?: number
  className?: string
}

export function GoogleSignInButton({ 
  text = 'signin_with',
  size = 'medium',
  width = 240,
  className = ''
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const { signIn, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!buttonRef.current || isAuthenticated || !window.google) {
      return
    }

    window.google.accounts.id.renderButton(buttonRef.current, {
      text,
      size,
      width,
      theme: 'outline',
      type: 'standard',
    })
  }, [text, size, width, isAuthenticated])

  if (isAuthenticated) {
    return null
  }

  return (
    <div className={className}>
      <div ref={buttonRef}></div>
    </div>
  )
}

export function GoogleOneTapSignIn() {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isAuthenticated || isLoading || !window.google) {
      return
    }

    // Show One Tap after a short delay to ensure the page is loaded
    const timer = setTimeout(() => {
      if (window.google) {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log('One Tap not displayed:', notification.getNotDisplayedReason())
          }
        })
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [isAuthenticated, isLoading])

  // This component doesn't render anything visible
  return null
}
