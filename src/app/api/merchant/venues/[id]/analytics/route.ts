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
    // Parse venue ID - handle both string and number IDs
    const venueId = isNaN(Number(id)) ? id : parseInt(id)

    // Get venue and verify ownership
    let venue
    try {
      venue = await payload.findByID({
        collection: 'venues',
        id: venueId,
        depth: 1,
      })
    } catch (error: any) {
      if (error.status === 404 || error.message?.includes('not found')) {
        return NextResponse.json({ error: 'Lokacija nije pronađena' }, { status: 404 })
      }
      throw error
    }

    // Get merchant
    const merchants = await payload.find({
      collection: 'merchants',
      where: { owner: { equals: user.id } },
      limit: 1,
    })

    if (merchants.docs.length === 0) {
      return NextResponse.json({ error: 'Trgovački račun nije pronađen' }, { status: 403 })
    }

    const venueMerchantId = typeof (venue as any).merchant === 'object' 
      ? (venue as any).merchant?.id 
      : (venue as any).merchant

    if (venueMerchantId !== merchants.docs[0].id) {
      return NextResponse.json({ error: 'Nemate pristup ovoj lokaciji' }, { status: 403 })
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
  } catch (error: any) {
    console.error('Error fetching venue analytics:', error)
    const errorMessage = error.message || 'Greška pri učitavanju analitike lokacije'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
