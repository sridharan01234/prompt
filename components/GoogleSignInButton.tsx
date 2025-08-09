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
      theme: 'filled_black',
      type: 'standard',
      shape: 'rectangular',
      logo_alignment: 'left',
    })

    // Apply custom styling to the Google button
    const iframe = buttonRef.current.querySelector('iframe')
    if (iframe) {
      iframe.style.borderRadius = '12px'
      iframe.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.25)'
      iframe.style.border = '1px solid rgba(255, 255, 255, 0.1)'
      iframe.style.transition = 'all 0.3s ease'
    }
  }, [text, size, width, isAuthenticated])

  if (isAuthenticated) {
    return null
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Custom wrapper with modern styling */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
      <div 
        ref={buttonRef}
        className="relative rounded-xl overflow-hidden backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
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
