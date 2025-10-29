import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/merchant/customers/[id]
 * Get detailed customer information with claim history
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
    // Get merchant for this user
    const merchants = await payload.find({
      collection: 'merchants',
      where: { owner: { equals: user.id } },
      limit: 1,
    })

    if (merchants.docs.length === 0) {
      return NextResponse.json({ error: 'Merchant account not found' }, { status: 404 })
    }

    const merchant = merchants.docs[0]

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
      where: { venue: { in: venueIds } },
      depth: 1,
      limit: 100,
    })

    const offerIds = offers.docs.map((o) => o.id)

    // Get all claims for this customer
    const claims = await payload.find({
      collection: 'claims',
      where: {
        offer: { in: offerIds },
        user: { equals: id },
      },
      depth: 3,
      sort: '-reservedAt',
      limit: 1000,
    })

    // Get user info
    let userInfo = null
    try {
      userInfo = await payload.findByID({
        collection: 'users',
        id: id,
        depth: 0,
      })
    } catch (error) {
      // User not found, skip
    }

    // Calculate statistics
    const stats = {
      totalClaims: claims.docs.length,
      redeemed: claims.docs.filter((c: any) => c.status === 'REDEEMED').length,
      expired: claims.docs.filter((c: any) => c.status === 'EXPIRED').length,
      reserved: claims.docs.filter((c: any) => c.status === 'RESERVED').length,
      lifetimeValue: claims.docs.filter((c: any) => c.status === 'REDEEMED').length * 15, // placeholder
    }

    // Group by offer
    const offerStats: Record<string, any> = {}
    claims.docs.forEach((claim: any) => {
      const offer = claim.offer
      const offerId = typeof offer === 'string' ? offer : offer?.id

      if (!offerStats[offerId]) {
        offerStats[offerId] = {
          offerId,
          title: typeof offer === 'object' ? offer.title : 'Unknown',
          count: 0,
          redeemed: 0,
        }
      }

      offerStats[offerId].count++
      if (claim.status === 'REDEEMED') {
        offerStats[offerId].redeemed++
      }
    })

    // Monthly breakdown
    const monthlyStats: Record<string, number> = {}
    claims.docs.forEach((claim: any) => {
      if (claim.reservedAt) {
        const date = new Date(claim.reservedAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1
      }
    })

    return NextResponse.json({
      customer: userInfo,
      claims: claims.docs,
      stats,
      offerStats: Object.values(offerStats),
      monthlyStats: Object.entries(monthlyStats).map(([month, count]) => ({ month, count })),
    })
  } catch (error) {
    console.error('Error fetching customer details:', error)
    return NextResponse.json({ error: 'Failed to fetch customer details' }, { status: 500 })
  }
}
