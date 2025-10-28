import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

/**
 * GET /api/merchant/analytics/daily-summary
 * Get daily summary report for merchant
 * Query params: date (optional, defaults to today)
 */
export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })

  // Get user from request cookies (same as dashboard API)
  const cookieHeader = request.headers.get('cookie') || ''
  const headers = new Headers()
  headers.set('cookie', cookieHeader)

  const { user } = await payload.auth({ headers: headers as any })

  console.log('Daily summary - user from auth:', user?.id, user?.email, user?.role)

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

  console.log('Daily summary - merchants found:', merchants.docs.length)
  if (merchants.docs.length > 0) {
    console.log('Daily summary - merchant:', merchants.docs[0].id, merchants.docs[0].name)
  }

  if (merchants.docs.length === 0) {
    return NextResponse.json({ error: 'Merchant account not found' }, { status: 404 })
  }

  const merchant = merchants.docs[0]

  // Get date from query params (default to today)
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get('date')
  const targetDate = dateParam ? new Date(dateParam) : new Date()

  // Set to start and end of target date
  const startDate = new Date(targetDate)
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(targetDate)
  endDate.setHours(23, 59, 59, 999)

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

    // Get slots active on this date
    const slots = await payload.find({
      collection: 'offer-slots',
      where: {
        offer: { in: offerIds },
        or: [
          // Slots that start on this date
          {
            and: [
              { startsAt: { greater_than_equal: startDate.toISOString() } },
              { startsAt: { less_than_equal: endDate.toISOString() } },
            ],
          },
          // Slots that end on this date
          {
            and: [
              { endsAt: { greater_than_equal: startDate.toISOString() } },
              { endsAt: { less_than_equal: endDate.toISOString() } },
            ],
          },
          // Slots that span this date
          {
            and: [
              { startsAt: { less_than: startDate.toISOString() } },
              { endsAt: { greater_than: endDate.toISOString() } },
            ],
          },
        ],
      },
      limit: 1000,
    })

    // Get claims for this date
    const claims = await payload.find({
      collection: 'claims',
      where: {
        offer: { in: offerIds },
        reservedAt: {
          greater_than_equal: startDate.toISOString(),
          less_than_equal: endDate.toISOString(),
        },
      },
      depth: 2,
      limit: 1000,
    })

    // Calculate summary metrics
    const totalSlots = slots.docs.length
    const activeSlots = slots.docs.filter((s: any) => s.state === 'live').length
    const totalCapacity = slots.docs.reduce((sum: number, s: any) => sum + (s.qtyTotal || 0), 0)
    const totalClaimed = slots.docs.reduce(
      (sum: number, s: any) => sum + (s.qtyTotal || 0) - (s.qtyRemaining || 0),
      0,
    )
    const fillRate = totalCapacity > 0 ? ((totalClaimed / totalCapacity) * 100).toFixed(1) : '0'

    const totalClaims = claims.docs.length
    const redeemedClaims = claims.docs.filter((c: any) => c.status === 'REDEEMED').length
    const expiredClaims = claims.docs.filter((c: any) => c.status === 'EXPIRED').length
    const activeClaims = claims.docs.filter((c: any) => c.status === 'RESERVED').length

    // Hourly breakdown
    const hourlyClaims: Record<number, number> = {}
    const hourlyRedemptions: Record<number, number> = {}

    for (let hour = 0; hour < 24; hour++) {
      hourlyClaims[hour] = 0
      hourlyRedemptions[hour] = 0
    }

    claims.docs.forEach((claim: any) => {
      if (claim.reservedAt) {
        const hour = new Date(claim.reservedAt).getHours()
        hourlyClaims[hour] = (hourlyClaims[hour] || 0) + 1
      }
      if (claim.status === 'REDEEMED' && claim.redeemedAt) {
        const hour = new Date(claim.redeemedAt).getHours()
        hourlyRedemptions[hour] = (hourlyRedemptions[hour] || 0) + 1
      }
    })

    return NextResponse.json({
      date: targetDate.toISOString().split('T')[0],
      summary: {
        totalSlots,
        activeSlots,
        totalCapacity,
        totalClaimed,
        fillRate: `${fillRate}%`,
        totalClaims,
        redeemedClaims,
        expiredClaims,
        activeClaims,
        redemptionRate: totalClaims > 0 ? ((redeemedClaims / totalClaims) * 100).toFixed(1) : '0',
      },
      hourlyBreakdown: {
        claims: Object.entries(hourlyClaims).map(([hour, count]) => ({
          hour: parseInt(hour),
          claims: count,
        })),
        redemptions: Object.entries(hourlyRedemptions).map(([hour, count]) => ({
          hour: parseInt(hour),
          redemptions: count,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching daily summary:', error)
    return NextResponse.json({ error: 'Failed to fetch daily summary' }, { status: 500 })
  }
}
