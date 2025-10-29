'use client'

import { useRealTimeActivity } from '@/hooks/useRealTimeActivity'
import { FiUsers, FiActivity } from 'react-icons/fi'

type ClaimingNowIndicatorProps = {
  offerId: string
  qtyRemaining?: number
}

export function ClaimingNowIndicator({ offerId, qtyRemaining }: ClaimingNowIndicatorProps) {
  const { activity } = useRealTimeActivity(offerId, 15000) // Poll every 15 seconds

  if (!activity || activity.viewers === 0) {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center gap-3 animate-pulse">
      <FiActivity className="text-blue-600 animate-pulse" />
      <div>
        <p className="text-sm font-semibold text-blue-900">
          {activity.viewers} {activity.viewers === 1 ? 'person is' : 'people are'} viewing this
        </p>
        {activity.recentClaims > 0 && (
          <p className="text-xs text-blue-700">
            {activity.recentClaims} {activity.recentClaims === 1 ? 'claim' : 'claims'} in last hour
          </p>
        )}
        {qtyRemaining !== undefined && qtyRemaining < 10 && (
          <p className="text-xs text-red-600 font-medium mt-1">Only {qtyRemaining} left!</p>
        )}
      </div>
    </div>
  )
}
