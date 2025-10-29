'use client'

import { useEffect, useRef, useState } from 'react'

type OfferUpdate = {
  slotId: string
  qtyRemaining: number
  state?: string
  isEndingSoon?: boolean
}

type UseOfferUpdatesOptions = {
  enabled?: boolean
  interval?: number
  onUpdate?: (updates: OfferUpdate[]) => void
}

export function useOfferUpdates({
  enabled = true,
  interval = 30000, // 30 seconds
  onUpdate,
}: UseOfferUpdatesOptions = {}) {
  const [updates, setUpdates] = useState<OfferUpdate[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchRef = useRef<Date>(new Date())

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    async function fetchUpdates() {
      try {
        const params = new URLSearchParams({
          since: lastFetchRef.current.toISOString(),
        })

        const response = await fetch(`/api/web/offers/updates?${params.toString()}`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          const newUpdates = data.updates || []

          if (newUpdates.length > 0) {
            setUpdates(newUpdates)
            onUpdate?.(newUpdates)
          }

          lastFetchRef.current = new Date()
        }
      } catch (error) {
        console.error('Error fetching offer updates:', error)
      }
    }

    // Initial fetch
    fetchUpdates()

    // Set up polling
    intervalRef.current = setInterval(fetchUpdates, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, interval, onUpdate])

  return { updates }
}
