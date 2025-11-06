import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

/**
 * POST /api/cron/check-ending-offers
 * Send smart notifications for offers ending soon
 * This should be called periodically (e.g., every 15 minutes) by a cron job
 */
export async function POST(request: Request) {
  // Verify the request is from the cron system
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const config = await configPromise
  const payload = await getPayload({ config })

  try {
    const now = new Date()
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000)

    // Find all live slots ending in the next 15 minutes
    const endingSlots = await payload.find({
      collection: 'offer-slots',
      where: {
        and: [
          { state: { equals: 'live' } },
          { qtyRemaining: { greater_than: 0 } },
          { endsAt: { greater_than: now.toISOString() } },
          { endsAt: { less_than: fifteenMinutesFromNow.toISOString() } },
        ],
      },
      depth: 2,
      limit: 100,
    })

    console.log(`Found ${endingSlots.docs.length} offers ending soon`)

    // Import smart notifications
    const { findSmartNotificationTargets, sendSmartNotification } = await import(
      '@/utilities/smartNotifications'
    )

    let notificationsSent = 0

    for (const slot of endingSlots.docs) {
      const slotData = slot as any
      const offer = slotData.offer

      if (!offer) continue

      try {
        // Find users who should be notified
        const targets = await findSmartNotificationTargets(
          payload,
          offer,
          slotData,
          undefined // TODO: Add location when available
        )

        // Send notifications
        for (const target of targets) {
          const sent = await sendSmartNotification(payload, {
            user: target.user,
            offer,
            slot: slotData,
            userHistory: {
              favoriteVenues: [],
              savedOffers: [],
              claimedOffers: [],
              preferredCategories: [],
            },
          })

          if (sent) notificationsSent++
        }

        console.log(`Sent ${notificationsSent} notifications for offer ending soon: ${offer.title}`)
      } catch (error) {
        console.error(`Error sending notifications for slot ${slot.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      slotsChecked: endingSlots.docs.length,
      notificationsSent,
    })
  } catch (error) {
    console.error('Error checking ending offers:', error)
    return NextResponse.json({ error: 'Failed to check ending offers' }, { status: 500 })
  }
}

// Keep GET for Vercel Cron compatibility
export async function GET(request: Request) {
  const cronHeader = request.headers.get('x-vercel-cron')
  const authHeader = request.headers.get('authorization')

  const isVercelCron = cronHeader === '1'
  const hasValidToken = authHeader === `Bearer ${process.env.CRON_SECRET}`

  if (!isVercelCron && !hasValidToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return POST(request)
}

