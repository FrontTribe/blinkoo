import type { Payload } from 'payload'

/**
 * Check if user has unlocked any new achievements based on their stats
 */
export async function checkAchievements(payload: Payload, userId: string | number) {
  try {
    // Get user stats
    const userStats = await payload.find({
      collection: 'user-stats',
      where: {
        user: { equals: userId },
      },
      limit: 1,
    })

    if (userStats.docs.length === 0) {
      return []
    }

    const stats = userStats.docs[0] as any
    const alreadyUnlocked = (stats.unlockedAchievements || []).map((ua: any) =>
      typeof ua.achievement === 'object' ? ua.achievement.id : ua.achievement,
    )

    // Get all achievements
    const achievements = await payload.find({
      collection: 'achievements',
      limit: 100,
    })

    const newlyUnlocked: any[] = []

    // Check each achievement
    for (const achievement of achievements.docs) {
      const achievementId = achievement.id

      // Skip if already unlocked
      if (alreadyUnlocked.includes(achievementId)) {
        continue
      }

      // Check criteria
      const criteria = achievement.criteria as any
      if (!criteria) continue

      let unlocked = false

      // Check based on criteria type
      switch (criteria.type) {
        case 'totalClaims':
          if ((stats.totalClaims || 0) >= criteria.value) {
            unlocked = true
          }
          break

        case 'totalReviews':
          if ((stats.totalReviews || 0) >= criteria.value) {
            unlocked = true
          }
          break

        case 'streak':
          if ((stats.currentStreak || 0) >= criteria.value) {
            unlocked = true
          }
          break

        case 'firstClaim':
          if (stats.totalClaims === 1) {
            unlocked = true
          }
          break

        case 'categories':
          const categoriesClaimed = stats.categoriesClaimed || []
          if (categoriesClaimed.length >= criteria.value) {
            unlocked = true
          }
          break

        case 'sameVenue':
          const venuesClaimed = stats.venuesClaimed || []
          const venueCounts: Record<string, number> = {}
          venuesClaimed.forEach((v: any) => {
            const venueId = typeof v.venue === 'object' ? v.venue.id : v.venue
            venueCounts[venueId] = (venueCounts[venueId] || 0) + 1
          })
          const maxClaims = Math.max(...Object.values(venueCounts), 0)
          if (maxClaims >= criteria.value) {
            unlocked = true
          }
          break
      }

      if (unlocked) {
        // Mark as unlocked
        await payload.update({
          collection: 'user-stats',
          id: stats.id,
          data: {
            unlockedAchievements: [
              ...(stats.unlockedAchievements || []),
              {
                achievement: achievementId,
                unlockedAt: new Date().toISOString(),
              },
            ],
          },
        })

        newlyUnlocked.push(achievement)
      }
    }

    return newlyUnlocked
  } catch (error) {
    console.error('Error checking achievements:', error)
    return []
  }
}
