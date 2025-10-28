import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/merchant/analytics/weekly-digest
 * Get weekly digest report for merchant
 * Query params: startDate (optional, defaults to 7 days ago)
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

  // Get date range from query params (default to last 7 days)
  const { searchParams } = new URL(request.url)
  const startDateParam = searchParams.get('startDate')

  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)

  const startDate = startDateParam ? new Date(startDateParam) : new Date()
  startDate.setDate(startDate.getDate() - 7)
  startDate.setHours(0, 0, 0, 0)

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

    // Get all claims in date range
    const claims = await payload.find({
      collection: 'claims',
      where: {
        offer: { in: offerIds },
        reservedAt: {
          greater_than_or_equal: startDate.toISOString(),
          less_than_or_equal: endDate.toISOString(),
        },
      },
      depth: 2,
      limit: 1000,
    })

    // Get all slots in date range
    const slots = await payload.find({
      collection: 'offer-slots',
      where: {
        offer: { in: offerIds },
        or: [
          {
            startsAt: {
              greater_than_or_equal: startDate.toISOString(),
            },
          },
          {
            endsAt: {
              less_than_or_equal: endDate.toISOString(),
            },
          },
        ],
      },
      limit: 1000,
    })

    // Calculate weekly metrics
    const totalSlots = slots.docs.length
    const totalClaims = claims.docs.length
    const redeemedClaims = claims.docs.filter((c: any) => c.status === 'REDEEMED').length
    const expiredClaims = claims.docs.filter((c: any) => c.status === 'EXPIRED').length

    // Calculate total capacity and fill rate
    let totalCapacity = 0
    let totalClaimed = 0
    slots.docs.forEach((slot: any) => {
      totalCapacity += slot.qtyTotal || 0
      totalClaimed += (slot.qtyTotal || 0) - (slot.qtyRemaining || 0)
    })

    const fillRate = totalCapacity > 0 ? ((totalClaimed / totalCapacity) * 100).toFixed(1) : '0'
    const redemptionRate = totalClaims > 0 ? ((redeemedClaims / totalClaims) * 100).toFixed(1) : '0'

    // Daily breakdown
    const dailyBreakdown: Record<string, { claims: number; redemptions: number; expired: number }> =
      {}

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      dailyBreakdown[dateKey] = { claims: 0, redemptions: 0, expired: 0 }
    }

    claims.docs.forEach((claim: any) => {
      if (claim.reservedAt) {
        const date = new Date(claim.reservedAt).toISOString().split('T')[0]
        if (dailyBreakdown[date]) {
          dailyBreakdown[date].claims++
          if (claim.status === 'REDEEMED') {
            dailyBreakdown[date].redemptions++
          }
          if (claim.status === 'EXPIRED') {
            dailyBreakdown[date].expired++
          }
        }
      }
    })

    // Top performing offers
    const offerCounts: Record<string, { id: string; title: string; claims: number }> = {}
    claims.docs.forEach((claim: any) => {
      if (claim.offer) {
        const offerId = typeof claim.offer === 'string' ? claim.offer : claim.offer.id
        const offerTitle = typeof claim.offer === 'object' ? claim.offer.title : 'Unknown'
        if (!offerCounts[offerId]) {
          offerCounts[offerId] = { id: offerId, title: offerTitle, claims: 0 }
        }
        offerCounts[offerId].claims++
      }
    })

    const topOffers = Object.values(offerCounts)
      .sort((a, b) => b.claims - a.claims)
      .slice(0, 5)

    // Trend (comparing first half vs second half of week)
    const midpoint = new Date(startDate)
    midpoint.setDate(midpoint.getDate() + 3.5)

    const firstHalf = claims.docs.filter((c: any) => {
      const date = new Date(c.reservedAt)
      return date < midpoint
    }).length

    const secondHalf = claims.docs.filter((c: any) => {
      const date = new Date(c.reservedAt)
      return date >= midpoint
    }).length

    const trend = firstHalf > 0 ? (((secondHalf - firstHalf) / firstHalf) * 100).toFixed(1) : '0'

    return NextResponse.json({
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      summary: {
        totalSlots,
        totalClaims,
        redeemedClaims,
        expiredClaims,
        fillRate: `${fillRate}%`,
        redemptionRate: `${redemptionRate}%`,
        trend: `${trend > 0 ? '+' : ''}${trend}%`,
      },
      dailyBreakdown: Object.entries(dailyBreakdown).map(([date, data]) => ({
        date,
        ...data,
      })),
      topOffers,
    })
  } catch (error) {
    console.error('Error fetching weekly digest:', error)
    return NextResponse.json({ error: 'Failed to fetch weekly digest' }, { status: 500 })
  }
}
