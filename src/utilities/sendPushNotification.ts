import { getPayload } from 'payload'
import configPromise from '@/payload.config'

type NotificationPayload = {
  title: string
  body: string
  url?: string
  icon?: string
  image?: string
  tag?: string
  data?: any
}

/**
 * Send push notification to users via OneSignal REST API
 */
async function sendOneSignalNotification(
  playerIds: string[],
  payload: NotificationPayload,
): Promise<{ sent: number; failed: number }> {
  if (!process.env.ONESIGNAL_REST_API_KEY || !process.env.ONESIGNAL_APP_ID) {
    console.error('OneSignal API keys not configured')
    return { sent: 0, failed: playerIds.length }
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: playerIds,
        headings: { en: payload.title },
        contents: { en: payload.body },
        url: payload.url || '/',
        chrome_web_image: payload.image || payload.icon,
        data: payload.data || {},
        send_after: undefined, // Send immediately
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OneSignal API error:', error)
      return { sent: 0, failed: playerIds.length }
    }

    const result = await response.json()
    // OneSignal returns recipient count in result
    const sent = result.recipients || playerIds.length
    return { sent, failed: playerIds.length - sent }
  } catch (error) {
    console.error('Error sending OneSignal notification:', error)
    return { sent: 0, failed: playerIds.length }
  }
}

/**
 * Send push notification to a single user
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: NotificationPayload,
): Promise<boolean> {
  try {
    const config = await configPromise
    const pushPayload = await getPayload({ config })

    // Get user with OneSignal player ID
    const user = await pushPayload.findByID({
      collection: 'users',
      id: userId,
    })

    const userData = user as any

    if (!userData.oneSignalPlayerId) {
      console.log(`User ${userId} has no OneSignal player ID`)
      return false
    }

    // Check if push notifications are enabled
    if (userData.notificationPreferences?.push !== true) {
      console.log(`Push notifications disabled for user ${userId}`)
      return false
    }

    // Send via OneSignal
    const result = await sendOneSignalNotification([userData.oneSignalPlayerId], payload)
    return result.sent > 0
  } catch (error: any) {
    console.error(`Error sending push to user ${userId}:`, error.message)
    return false
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToUsers(
  userIds: string[],
  payload: NotificationPayload,
): Promise<{ sent: number; failed: number }> {
  try {
    const config = await configPromise
    const pushPayload = await getPayload({ config })

    // Get all users with their OneSignal player IDs
    const users = await pushPayload.find({
      collection: 'users',
      where: {
        id: { in: userIds },
        notificationPreferences: {
          push: { equals: true },
        },
      },
      limit: 1000,
    })

    // Extract player IDs (OneSignal limits to 2000 per request)
    const playerIds = users.docs
      .map((user: any) => user.oneSignalPlayerId)
      .filter((id: string | null) => id !== null && id !== undefined)

    if (playerIds.length === 0) {
      return { sent: 0, failed: userIds.length }
    }

    // OneSignal allows up to 2000 player IDs per request
    const chunks: string[][] = []
    for (let i = 0; i < playerIds.length; i += 2000) {
      chunks.push(playerIds.slice(i, i + 2000))
    }

    let totalSent = 0
    let totalFailed = 0

    // Send in chunks
    for (const chunk of chunks) {
      const result = await sendOneSignalNotification(chunk, payload)
      totalSent += result.sent
      totalFailed += result.failed
    }

    return { sent: totalSent, failed: totalFailed }
  } catch (error) {
    console.error('Error sending push to users:', error)
    return { sent: 0, failed: userIds.length }
  }
}

/**
 * Send push notification to all users who saved a specific offer
 */
export async function sendPushToSavedOfferUsers(
  offerId: string,
  payload: NotificationPayload,
): Promise<{ sent: number; failed: number }> {
  try {
    const config = await configPromise
    const pushPayload = await getPayload({ config })

    // Find all users who saved this offer
    const savedOffers = await pushPayload.find({
      collection: 'saved-offers',
      where: {
        offer: { equals: offerId },
      },
      limit: 1000,
      depth: 1,
    })

    // Get unique user IDs
    const userIds = [
      ...new Set(
        savedOffers.docs.map((so: any) => {
          const user = so.user
          return typeof user === 'object' ? user.id : user
        }),
      ),
    ]

    if (userIds.length === 0) {
      return { sent: 0, failed: 0 }
    }

    return await sendPushNotificationToUsers(userIds, payload)
  } catch (error) {
    console.error('Error sending push to saved offer users:', error)
    return { sent: 0, failed: 0 }
  }
}

/**
 * Send push notification to users near a venue
 */
export async function sendPushToNearbyUsers(
  venueLat: number,
  venueLng: number,
  radiusKm: number,
  payload: NotificationPayload,
): Promise<{ sent: number; failed: number }> {
  // This would require storing user locations, which we don't currently do
  // For now, return empty
  // TODO: Implement location-based targeting with OneSignal segments or location targeting
  return { sent: 0, failed: 0 }
}
