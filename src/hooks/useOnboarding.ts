'use client'

import { useState, useEffect } from 'react'

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check localStorage on mount
    const completed = localStorage.getItem('onboarding_completed')
    setHasCompletedOnboarding(completed === 'true')

    // If not completed, show onboarding
    if (completed !== 'true') {
      setShowOnboarding(true)
    }
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true')
    setHasCompletedOnboarding(true)
    setShowOnboarding(false)
  }

  const skipOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true')
    setHasCompletedOnboarding(true)
    setShowOnboarding(false)
  }

  const showOnboardingAgain = () => {
    localStorage.removeItem('onboarding_completed')
    setHasCompletedOnboarding(false)
    setShowOnboarding(true)
  }

  return {
    hasCompletedOnboarding,
    showOnboarding,
    setShowOnboarding,
    completeOnboarding,
    skipOnboarding,
    showOnboardingAgain,
  }
}
