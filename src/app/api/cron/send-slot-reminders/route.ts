import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

/**
 * POST /api/cron/send-slot-reminders
 * Send notifications to users who have saved offers when new slots become available
 * This should be called periodically (e.g., every minute) by a cron job
 */
export async function POST(request: Request) {
  // Verify the request is from the cron system (add your auth logic here)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const config = await configPromise
  const payload = await getPayload({ config })

  try {
    const now = new Date()
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)

    // Find all saved offers with notifications enabled
    const savedOffers = await payload.find({
      collection: 'saved-offers',
      where: {
        or: [
          {
            and: [
              { notifyOnSlotStart: { equals: true } },
              { 'offer.status': { equals: 'active' } },
            ],
          },
          {
            and: [
              { notify30MinBefore: { equals: true } },
              { 'offer.status': { equals: 'active' } },
            ],
          },
        ],
      },
      depth: 2,
      limit: 1000,
    })

    const notifications = []

    for (const savedOffer of savedOffers.docs) {
      const offer = savedOffer.offer as any

      if (!offer || !offer.id) continue

      // Find recent slots for this offer
      const recentSlots = await payload.find({
        collection: 'offer-slots',
        where: {
          and: [
            { offer: { equals: offer.id } },
            { state: { equals: 'live' } },
            { qtyRemaining: { greater_than: 0 } },
            {
              startsAt: {
                greater_than: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), // Within last hour
              },
            },
          ],
        },
        limit: 1,
      })

      const user = savedOffer.user as any

      // Check if we should notify for slot start
      if (
        savedOffer.notifyOnSlotStart &&
        recentSlots.docs.length > 0 &&
        recentSlots.docs[0].createdAt
      ) {
        const slotCreatedAt = new Date(recentSlots.docs[0].createdAt)
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

        // Only notify if slot was created in the last hour
        if (slotCreatedAt > oneHourAgo) {
          notifications.push({
            userId: user.id,
            offerId: offer.id,
            offerTitle: offer.title,
            type: 'slot_start',
            slotId: recentSlots.docs[0].id,
          })
        }
      }

      // Check if we should notify 30 minutes before slot starts
      if (savedOffer.notify30MinBefore) {
        const upcomingSlots = await payload.find({
          collection: 'offer-slots',
          where: {
            and: [
              { offer: { equals: offer.id } },
              { state: { equals: 'scheduled' } },
              {
                startsAt: {
                  greater_than: now.toISOString(),
                  less_than: thirtyMinutesFromNow.toISOString(),
                },
              },
            ],
          },
          limit: 1,
        })

        if (upcomingSlots.docs.length > 0) {
          notifications.push({
            userId: user.id,
            offerId: offer.id,
            offerTitle: offer.title,
            type: 'slot_30min_before',
            slotId: upcomingSlots.docs[0].id,
            startsAt: upcomingSlots.docs[0].startsAt,
          })
        }
      }
    }

    // Send push notifications
    let sentCount = 0
    for (const notification of notifications) {
      try {
        const { sendPushNotificationToUser } = await import('@/utilities/sendPushNotification')
        const offer = await payload.findByID({
          collection: 'offers',
          id: notification.offerId,
        })

        const offerData = offer as any
        const slot = await payload.findByID({
          collection: 'offer-slots',
          id: notification.slotId,
        })

        const slotData = slot as any

        const success = await sendPushNotificationToUser(notification.userId, {
          title: offerData.title,
          body:
            notification.type === 'slot_30min_before'
              ? `Starts in 30 minutes! ${slotData.qtyRemaining || 0} spots available.`
              : `${offerData.title} is now live! ${slotData.qtyRemaining || 0} spots available.`,
          url: `/offers/${offerData.slug || offerData.id}`,
          tag: notification.type,
        })

        if (success) {
          sentCount++
        }
      } catch (error) {
        console.error(`Error sending notification to user ${notification.userId}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      notificationsCount: notifications.length,
      sentCount,
      notifications,
    })
  } catch (error) {
    console.error('Error sending slot reminders:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}
