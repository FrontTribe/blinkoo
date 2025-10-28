import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/merchant/analytics/peak-hours
 * Analyze peak hours for claims and redemptions
 */
export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get merchant for this user
  const merchants = await payload.find({
    collection: 'merchants',
    where: {
      owner: { equals: user.id },
    },
    limit: 1,
  })

  if (merchants.docs.length === 0) {
    return NextResponse.json({ error: 'Merchant account not found' }, { status: 404 })
  }

  const merchant = merchants.docs[0]

  try {
    // Get merchant's venues
    const venues = await payload.find({
      collection: 'venues',
      where: { merchant: { equals: merchant.id } },
      limit: 100,
    })

    const venueIds = venues.docs.map((v) => v.id)

    // Get offers for these venues
    const offers = await payload.find({
      collection: 'offers',
      where: {
        venue: { in: venueIds },
      },
      depth: 1,
      limit: 100,
    })

    const offerIds = offers.docs.map((o) => o.id)

    // Get all claims
    const claims = await payload.find({
      collection: 'claims',
      where: {
        offer: { in: offerIds },
      },
      limit: 1000,
    })

    // Analyze by hour and day of week
    const hourCounts: Record<number, number> = {}
    const dayCounts: Record<number, number> = {}

    for (let hour = 0; hour < 24; hour++) {
      hourCounts[hour] = 0
    }

    for (let day = 0; day < 7; day++) {
      dayCounts[day] = 0
    }

    claims.docs.forEach((claim: any) => {
      if (claim.reservedAt) {
        const date = new Date(claim.reservedAt)
        const hour = date.getHours()
        const day = date.getDay()

        hourCounts[hour] = (hourCounts[hour] || 0) + 1
        dayCounts[day] = (dayCounts[day] || 0) + 1
      }
    })

    // Find peak hours
    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Find peak days
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const peakDays = Object.entries(dayCounts)
      .map(([day, count]) => ({
        day: parseInt(day),
        dayName: dayNames[parseInt(day)],
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate average per hour
    const totalClaims = claims.docs.length
    const avgPerHour = (totalClaims / 24).toFixed(1)

    return NextResponse.json({
      peakHours,
      peakDays,
      avgPerHour,
      totalClaims,
      hourBreakdown: Object.entries(hourCounts).map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
      })),
    })
  } catch (error) {
    console.error('Error analyzing peak hours:', error)
    return NextResponse.json({ error: 'Failed to analyze peak hours' }, { status: 500 })
  }
}
