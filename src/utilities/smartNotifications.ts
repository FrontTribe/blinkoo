import type { Payload } from 'payload'

type UserWithPreferences = {
  id: number
  role?: string
  notificationPreferences?: {
    smartNotifications?: boolean
    quietHoursStart?: number
    quietHoursEnd?: number
    notificationFrequency?: 'all' | 'important' | 'occasional'
    inApp?: boolean
    push?: boolean
  }
  oneSignalPlayerId?: string
}

type OfferData = {
  id: number
  title: string
  description?: string
  type?: string
  discountValue?: number
  category?: any
  venue?: any
  photo?: any
}

type SlotData = {
  id: number
  endsAt: string
  startsAt?: string
  qtyRemaining?: number
}

type SmartNotificationContext = {
  user: UserWithPreferences
  offer: OfferData
  slot: SlotData
  userLocation?: { lat: number; lng: number }
  userHistory?: {
    favoriteVenues?: number[]
    savedOffers?: number[]
    claimedOffers?: number[]
    preferredCategories?: number[]
  }
}

type NotificationMessage = {
  title: string
  body: string
  priority: 'high' | 'medium' | 'low'
  contextualInfo?: string
} | null

/**
 * Check if it's currently quiet hours for the user
 */
function isQuietHours(user: UserWithPreferences): boolean {
  const prefs = user.notificationPreferences
  if (!prefs?.quietHoursStart || !prefs?.quietHoursEnd) return false

  const now = new Date()
  const currentHour = now.getHours()
  const startHour = prefs.quietHoursStart
  const endHour = prefs.quietHoursEnd

  // Handle overnight quiet hours (e.g., 22:00 - 8:00)
  if (startHour > endHour) {
    return currentHour >= startHour || currentHour < endHour
  }
  
  // Handle normal quiet hours (e.g., 22:00 - 8:00 but stored as 8 - 22)
  return currentHour >= startHour && currentHour < endHour
}

/**
 * Generate smart notification message based on context
 */
function generateSmartMessage(context: SmartNotificationContext): NotificationMessage {
  const { user, offer, slot, userHistory } = context
  const prefs = user.notificationPreferences
  
  // Check if smart notifications are disabled
  if (prefs?.smartNotifications === false) {
    return {
      title: offer.title,
      body: offer.description || 'New offer available',
      priority: 'medium',
    }
  }

  // Check frequency settings
  const frequency = prefs?.notificationFrequency || 'important'
  
  const now = new Date()
  const endsAt = new Date(slot.endsAt)
  const minutesRemaining = Math.floor((endsAt.getTime() - now.getTime()) / 1000 / 60)
  const hoursRemaining = Math.floor(minutesRemaining / 60)

  // Detect contextual information
  let contextualInfo: string | undefined
  let priority: 'high' | 'medium' | 'low' = 'medium'

  // Check if it's a favorite venue
  const isFavoriteVenue = userHistory?.favoriteVenues?.includes(
    typeof offer.venue === 'object' ? offer.venue.id : offer.venue
  )
  if (isFavoriteVenue) {
    contextualInfo = 'Favorite venue'
    priority = 'high'
  }

  // Check if offer was saved
  const isSavedOffer = userHistory?.savedOffers?.includes(offer.id)
  if (isSavedOffer) {
    contextualInfo = 'Saved offer'
    priority = 'high'
  }

  // Check if ending soon
  const isEndingSoon = minutesRemaining <= 15
  if (isEndingSoon) {
    contextualInfo = 'Ending soon'
    priority = 'high'
  }

  // Check if low stock
  const isLowStock = (slot.qtyRemaining || 0) <= 5 && (slot.qtyRemaining || 0) > 0
  if (isLowStock) {
    contextualInfo = `Only ${slot.qtyRemaining} left`
    if (priority !== 'high') priority = 'high'
  }

  // Check if just started (flash deal)
  if (slot.startsAt) {
    const startedAt = new Date(slot.startsAt)
    const minutesSinceStart = Math.floor((now.getTime() - startedAt.getTime()) / 1000 / 60)
    if (minutesSinceStart < 5) {
      contextualInfo = 'Just started'
      if (priority !== 'high') priority = 'high'
    }
  }

  // Build personalized message
  let title = offer.title
  let body = ''

  // Add time context
  if (hoursRemaining > 0) {
    body = `${hoursRemaining}h ${minutesRemaining % 60}m left`
  } else if (minutesRemaining > 0) {
    body = `${minutesRemaining} minutes left`
  } else {
    body = 'Ending soon!'
  }

  // Add contextual info
  if (contextualInfo) {
    body = `${contextualInfo} • ${body}`
  }

  // Apply frequency filter
  if (frequency === 'occasional' && priority !== 'high') {
    // Only send high priority for occasional frequency
    return null
  }

  if (frequency === 'important' && priority !== 'high' && priority !== 'medium') {
    // Skip low priority for important-only frequency
    return null
  }

  return {
    title,
    body,
    priority,
    contextualInfo,
  }
}

/**
 * Send smart notification to user
 */
export async function sendSmartNotification(
  payload: Payload,
  context: SmartNotificationContext
): Promise<boolean> {
  const { user } = context
  
  // Check quiet hours
  if (isQuietHours(user)) {
    console.log(`Skipping notification for user ${user.id} - quiet hours`)
    return false
  }

  // Generate smart message
  const message = generateSmartMessage(context)
  if (!message) {
    console.log(`Skipping notification for user ${user.id} - frequency filter`)
    return false
  }

  // Create in-app notification
  if (user.notificationPreferences?.inApp !== false) {
    try {
      await payload.create({
        collection: 'notifications',
        data: {
          user: user.id,
          type: 'offer_available',
          title: message.title,
          message: message.body,
          read: false,
          link: `/offers/${context.offer.id}`,
        },
      })
    } catch (error) {
      console.error('Error creating in-app notification:', error)
    }
  }

  // Send push notification if enabled
  if (user.notificationPreferences?.push && user.oneSignalPlayerId) {
    try {
      const { sendPushNotificationToUser } = await import('./sendPushNotification')
      await sendPushNotificationToUser(String(user.id), {
        title: message.title,
        body: message.body,
        url: `/offers/${context.offer.id}`,
        tag: `offer-${context.offer.id}`,
        data: {
          offerId: context.offer.id,
          priority: message.priority,
        },
      })
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }

  return true
}

/**
 * Find users who should receive smart notifications for a new/live offer
 */
export async function findSmartNotificationTargets(
  payload: Payload,
  offer: OfferData,
  slot: SlotData,
  venueLocation?: { lat: number; lng: number }
): Promise<Array<{ user: UserWithPreferences; reason: string }>> {
  const targets: Array<{ user: UserWithPreferences; reason: string }> = []

  // 1. Users who saved this offer
  const savedOffers = await payload.find({
    collection: 'saved-offers',
    where: {
      offer: { equals: offer.id },
    },
    depth: 1,
    limit: 1000,
  })

  for (const saved of savedOffers.docs) {
    const savedData = saved as any
    const userId = typeof savedData.user === 'object' ? savedData.user.id : savedData.user
    if (userId) {
      const user = await payload.findByID({
        collection: 'users',
        id: userId,
      })
      targets.push({
        user: user as any,
        reason: 'Saved this offer',
      })
    }
  }

  // 2. Users who favorited this venue
  const venueId = typeof offer.venue === 'object' ? offer.venue.id : offer.venue
  if (venueId) {
    const favorites = await payload.find({
      collection: 'favorites',
      where: {
        venue: { equals: venueId },
      },
      depth: 1,
      limit: 1000,
    })

    for (const favorite of favorites.docs) {
      const favData = favorite as any
      const userId = typeof favData.user === 'object' ? favData.user.id : favData.user
      if (userId) {
        // Check if we already added this user
        if (!targets.find((t) => t.user.id === userId)) {
          const user = await payload.findByID({
            collection: 'users',
            id: userId,
          })
          targets.push({
            user: user as any,
            reason: 'Favorite venue',
          })
        }
      }
    }
  }

  // 3. Users who claimed similar offers (same category)
  const categoryId = typeof offer.category === 'object' ? offer.category?.id : offer.category
  if (categoryId) {
    const claims = await payload.find({
      collection: 'claims',
      where: {
        status: { in: ['RESERVED', 'REDEEMED'] },
      },
      depth: 2,
      limit: 500,
    })

    const recentUsers = new Set<number>()
    for (const claim of claims.docs) {
      const claimData = claim as any
      const claimOffer = claimData.offer
      if (claimOffer) {
        const claimCategoryId =
          typeof claimOffer.category === 'object' ? claimOffer.category?.id : claimOffer.category
        if (claimCategoryId === categoryId) {
          const userId = typeof claimData.user === 'object' ? claimData.user.id : claimData.user
          if (userId && !targets.find((t) => t.user.id === userId)) {
            recentUsers.add(Number(userId))
          }
        }
      }
    }

    // Add users from same category (limit to avoid too many)
    let count = 0
    for (const userId of recentUsers) {
      if (count >= 50) break // Limit for performance
      const user = await payload.findByID({
        collection: 'users',
        id: userId,
      })
      targets.push({
        user: user as any,
        reason: 'Similar interests',
      })
      count++
    }
  }

  // 4. Nearby users (if location is provided)
  // This would require additional setup with location tracking
  // For now, we'll skip this as it needs additional infrastructure

  // Filter out duplicates and only active users
  const uniqueTargets = new Map<number, { user: UserWithPreferences; reason: string }>()
  for (const target of targets) {
    if (target.user.role === 'customer') {
      uniqueTargets.set(target.user.id, target)
    }
  }

  return Array.from(uniqueTargets.values())
}

