'use client'

import { FiTrendingUp, FiClock, FiUsers, FiAlertCircle } from 'react-icons/fi'

type BadgeType = 'trending' | 'almost-gone' | 'recently-claimed' | 'popular'

interface SocialProofBadgesProps {
  badges?: Array<{
    type: BadgeType
    label: string
    count?: number
    showIcon?: boolean
  }>
  qtyRemaining?: number
  qtyTotal?: number
  recentlyClaimed?: number
  showTrending?: boolean
}

export function SocialProofBadges({
  badges,
  qtyRemaining,
  qtyTotal,
  recentlyClaimed,
  showTrending = false,
}: SocialProofBadgesProps) {
  const computedBadges: Array<{ type: BadgeType; label: string; count?: number }> = []

  // Automatically compute badges if not provided
  if (!badges) {
    // Almost Gone badge
    if (qtyRemaining !== undefined && qtyTotal !== undefined && qtyTotal > 0) {
      const percentageRemaining = (qtyRemaining / qtyTotal) * 100
      if (percentageRemaining < 20 && percentageRemaining > 0) {
        computedBadges.push({
          type: 'almost-gone',
          label: `Only ${qtyRemaining} left!`,
        })
      }
    }

    // Recently Claimed badge
    if (recentlyClaimed !== undefined && recentlyClaimed > 0) {
      if (recentlyClaimed === 1) {
        computedBadges.push({
          type: 'recently-claimed',
          label: 'Claimed in last hour',
        })
      } else {
        computedBadges.push({
          type: 'recently-claimed',
          label: `${recentlyClaimed} claimed in last hour`,
          count: recentlyClaimed,
        })
      }
    }

    // Trending badge
    if (showTrending && recentlyClaimed !== undefined && recentlyClaimed >= 5) {
      computedBadges.push({
        type: 'trending',
        label: 'Trending',
      })
    }
  } else {
    // Use provided badges
    badges.forEach((badge) => {
      computedBadges.push({
        type: badge.type,
        label: badge.label,
        count: badge.count,
      })
    })
  }

  if (computedBadges.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {computedBadges.map((badge, index) => (
        <Badge key={`${badge.type}-${index}`} type={badge.type} label={badge.label} />
      ))}
    </div>
  )
}

function Badge({ type, label }: { type: BadgeType; label: string }) {
  const baseClasses =
    'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-full whitespace-nowrap'

  const variants = {
    trending: {
      className: `${baseClasses} bg-orange-50 text-orange-700 border-orange-200`,
      icon: <FiTrendingUp className="w-3 h-3" />,
    },
    'almost-gone': {
      className: `${baseClasses} bg-red-50 text-red-700 border-red-200 animate-pulse`,
      icon: <FiAlertCircle className="w-3 h-3" />,
    },
    'recently-claimed': {
      className: `${baseClasses} bg-blue-50 text-blue-700 border-blue-200`,
      icon: <FiUsers className="w-3 h-3" />,
    },
    popular: {
      className: `${baseClasses} bg-green-50 text-green-700 border-green-200`,
      icon: <FiClock className="w-3 h-3" />,
    },
  }

  const variant = variants[type] || variants.trending

  return (
    <div className={variant.className}>
      {variant.icon}
      <span>{label}</span>
    </div>
  )
}
