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

    // Clear any existing content
    buttonRef.current.innerHTML = ''

    window.google.accounts.id.renderButton(buttonRef.current, {
      text,
      size,
      width,
      theme: 'outline',
      type: 'standard',
      shape: 'rectangular',
      logo_alignment: 'left',
    })

    // Apply clean styling to the Google button
    const iframe = buttonRef.current.querySelector('iframe')
    if (iframe) {
      iframe.style.borderRadius = '8px'
      iframe.style.border = 'none'
      iframe.style.transition = 'all 0.2s ease'
    }
  }, [text, size, width, isAuthenticated])

  if (isAuthenticated) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={buttonRef}
        className="rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
      ></div>
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
    }, 1500) // Increased delay for better UX

    return () => clearTimeout(timer)
  }, [isAuthenticated, isLoading])

  // This component doesn't render anything visible
  return null
}
