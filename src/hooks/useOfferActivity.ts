import { useState, useEffect } from 'react'
import useSWR from 'swr'

type OfferActivity = {
  recentClaims: number
  recentRedemptions: number
  currentViewers: number
}

export function useOfferActivity(offerId: string | null) {
  const [activity, setActivity] = useState<OfferActivity>({
    recentClaims: 0,
    recentRedemptions: 0,
    currentViewers: 0,
  })

  const { data, error, isLoading } = useSWR<OfferActivity>(
    offerId ? `/api/web/offers/${offerId}/activity` : null,
    async (url: string) => {
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch activity')
      return res.json()
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    },
  )

  useEffect(() => {
    if (data) {
      setActivity(data)
    }
  }, [data])

  return {
    activity,
    isLoading,
    error,
  }
}
