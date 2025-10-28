'use client'

import { useState, useEffect } from 'react'
import { FiUsers, FiClock } from 'react-icons/fi'

type ClaimActivityProps = {
  offerId: string
  compact?: boolean
}

export function ClaimActivity({ offerId, compact = false }: ClaimActivityProps) {
  const [activity, setActivity] = useState<{
    recentCount: number
    totalCount: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await fetch(`/api/web/offers/${offerId}/activity`)
        if (response.ok) {
          const data = await response.json()
          setActivity(data)
        }
      } catch (error) {
        console.error('Error fetching activity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [offerId])

  if (loading || !activity) {
    return null
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm text-text-secondary">
        {activity.recentCount > 0 && (
          <span className="flex items-center gap-1">
            <FiUsers />
            {activity.recentCount} claimed in last hour
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="bg-primary/5 border border-primary/20 p-4">
      <div className="flex items-center gap-2 mb-2">
        <FiUsers className="text-primary text-lg" />
        <h4 className="font-semibold text-text-primary">Claimed by Others</h4>
      </div>
      <div className="space-y-2 text-sm">
        {activity.recentCount > 0 ? (
          <p className="text-text-primary">
            <span className="font-semibold text-primary">{activity.recentCount}</span> people
            claimed this in the last hour
          </p>
        ) : (
          <p className="text-text-secondary">No recent claims</p>
        )}
        {activity.totalCount > 0 && (
          <p className="text-text-secondary flex items-center gap-1">
            <FiClock />
            {activity.totalCount} total claims
          </p>
        )}
      </div>
    </div>
  )
}
