import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/web/users/achievements
 * Get user achievements and stats
 */
export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get or create user stats
    let userStats = await payload.find({
      collection: 'user-stats',
      where: {
        user: { equals: user.id },
      },
      limit: 1,
    })

    if (userStats.docs.length === 0) {
      // Create initial stats
      const newStats = await payload.create({
        collection: 'user-stats',
        data: {
          user: user.id as any,
          totalClaims: 0,
          totalReviews: 0,
          longestStreak: 0,
          currentStreak: 0,
        },
      })
      userStats = { docs: [newStats] }
    }

    const stats = userStats.docs[0] as any

    return NextResponse.json({
      stats: {
        totalClaims: stats.totalClaims || 0,
        totalReviews: stats.totalReviews || 0,
        longestStreak: stats.longestStreak || 0,
        currentStreak: stats.currentStreak || 0,
      },
      achievements: stats.unlockedAchievements || [],
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
  }
}
