'use client'

import { useState, useEffect } from 'react'
import { FiAward } from 'react-icons/fi'

type Achievement = {
  id: string
  name: string
  description: string
  icon: string
  tier: string
  unlockedAt?: string
}

type AchievementsBadgeProps = {
  userId?: string
  compact?: boolean
}

export function AchievementsBadge({ userId, compact = false }: AchievementsBadgeProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const response = await fetch('/api/web/users/achievements', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setAchievements(data.achievements || [])
        }
      } catch (error) {
        console.error('Error fetching achievements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [userId])

  function getTierColor(tier: string): string {
    switch (tier) {
      case 'platinum':
        return 'from-gray-400 to-gray-600'
      case 'gold':
        return 'from-yellow-400 to-yellow-600'
      case 'silver':
        return 'from-gray-300 to-gray-500'
      case 'bronze':
        return 'from-orange-400 to-orange-600'
      default:
        return 'from-gray-300 to-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded" />
      </div>
    )
  }

  if (achievements.length === 0) {
    return null
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <FiAward className="text-primary text-lg" />
        <span className="text-sm font-medium text-text-primary">
          {achievements.length} Achievement{achievements.length !== 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white border border-border p-6">
      <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
        <FiAward className="text-primary text-xl" />
        Achievements ({achievements.length})
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="border border-border p-3 hover:border-primary transition-colors"
            title={achievement.description}
          >
            <div
              className={`text-3xl mb-2 bg-gradient-to-br ${getTierColor(achievement.tier)} text-transparent bg-clip-text`}
            >
              {achievement.icon}
            </div>
            <p className="font-medium text-sm text-text-primary line-clamp-1">{achievement.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
