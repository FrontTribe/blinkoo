import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/merchant/venues/[id]/analytics
 * Get analytics for a specific venue
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get venue and verify ownership
    const venue = await payload.findByID({
      collection: 'venues',
      id: parseInt(id),
      depth: 1,
    })

    // Get merchant
    const merchants = await payload.find({
      collection: 'merchants',
      where: { owner: { equals: user.id } },
      limit: 1,
    })

    if (merchants.docs.length === 0 || (venue as any).merchant !== merchants.docs[0].id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get offers for this venue
    const offers = await payload.find({
      collection: 'offers',
      where: { venue: { equals: venue.id } },
      depth: 1,
      limit: 100,
    })

    const offerIds = offers.docs.map((o) => o.id)

    // Get claims for these offers
    const claims = await payload.find({
      collection: 'claims',
      where: {
        offer: { in: offerIds },
      },
      depth: 2,
      sort: '-reservedAt',
      limit: 1000,
    })

    // Get slots for these offers
    const slots = await payload.find({
      collection: 'offer-slots',
      where: {
        offer: { in: offerIds },
      },
      limit: 1000,
    })

    // Calculate statistics
    const stats = {
      totalOffers: offers.docs.length,
      totalClaims: claims.docs.length,
      redeemedClaims: claims.docs.filter((c: any) => c.status === 'REDEEMED').length,
      expiredClaims: claims.docs.filter((c: any) => c.status === 'EXPIRED').length,
      reservedClaims: claims.docs.filter((c: any) => c.status === 'RESERVED').length,
      redemptionRate:
        claims.docs.length > 0
          ? (
              (claims.docs.filter((c: any) => c.status === 'REDEEMED').length /
                claims.docs.length) *
              100
            ).toFixed(1)
          : '0',
      totalSlots: slots.docs.length,
      totalCapacity: slots.docs.reduce((sum: number, s: any) => sum + (s.qtyTotal || 0), 0),
      totalClaimed: slots.docs.reduce(
        (sum: number, s: any) => sum + (s.qtyTotal || 0) - (s.qtyRemaining || 0),
        0,
      ),
      fillRate:
        slots.docs.length > 0
          ? (
              (slots.docs.reduce(
                (sum: number, s: any) => sum + (s.qtyTotal || 0) - (s.qtyRemaining || 0),
                0,
              ) /
                slots.docs.reduce((sum: number, s: any) => sum + (s.qtyTotal || 0), 0)) *
              100
            ).toFixed(1)
          : '0',
    }

    // Top offers for this venue
    const offerStats: Record<string, any> = {}
    claims.docs.forEach((claim: any) => {
      const offerId = typeof claim.offer === 'string' ? claim.offer : claim.offer?.id
      if (!offerStats[offerId]) {
        offerStats[offerId] = {
          id: offerId,
          title: typeof claim.offer === 'object' ? claim.offer.title : 'Unknown',
          claims: 0,
          redeemed: 0,
        }
      }
      offerStats[offerId].claims++
      if (claim.status === 'REDEEMED') {
        offerStats[offerId].redeemed++
      }
    })

    const topOffers = Object.values(offerStats)
      .sort((a: any, b: any) => b.claims - a.claims)
      .slice(0, 5)

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
      venue: {
        id: venue.id,
        name: venue.name,
        address: venue.address,
        city: venue.city,
      },
      stats,
      topOffers,
      hourlyBreakdown: {
        claims: Object.entries(hourlyClaims).map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
        })),
        redemptions: Object.entries(hourlyRedemptions).map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching venue analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch venue analytics' }, { status: 500 })
  }
}
