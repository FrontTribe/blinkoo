'use client'

import { useState, useEffect, useRef } from 'react'

type ActivityData = {
  viewers: number
  recentClaims: number
  remaining: number
}

export function useRealTimeActivity(offerId: string, pollInterval = 10000) {
  const [activity, setActivity] = useState<ActivityData>({
    viewers: 0,
    recentClaims: 0,
    remaining: 0,
  })
  const [isActive, setIsActive] = useState(true)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!offerId || !isActive) return

    async function fetchActivity() {
      try {
        const response = await fetch(`/api/web/offers/${offerId}/activity`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setActivity({
            viewers: Math.floor(Math.random() * 10) + 1, // Simulated
            recentClaims: data.recentClaims || 0,
            remaining: data.remaining || 0,
          })
        }
      } catch (error) {
        console.error('Error fetching activity:', error)
      }
    }

    // Initial fetch
    fetchActivity()

    // Set up polling
    pollTimerRef.current = setInterval(fetchActivity, pollInterval)

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
      }
    }
  }, [offerId, pollInterval, isActive])

  return {
    activity,
    isActive,
    setIsActive,
  }
}
