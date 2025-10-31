import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { getMerchantWithKYC } from '@/utilities/checkMerchantKYC'

export async function GET(request: Request) {
  try {
    const config = await configPromise
    const payload = await getPayload({ config })

    // Get user from request cookies
    const cookieHeader = request.headers.get('cookie') || ''
    const headers = new Headers()
    headers.set('cookie', cookieHeader)

    const { user } = await payload.auth({ headers: headers as any })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check KYC approval
    const merchant = await getMerchantWithKYC(payload, user.id)
    if (!merchant || merchant.kycStatus !== 'approved') {
      return NextResponse.json({ error: 'Account not approved' }, { status: 403 })
    }

    // Get venues for this merchant
    const venues = await payload.find({
      collection: 'venues',
      where: { merchant: { equals: merchant.id } },
      limit: 100,
    })

    const venueIds = venues.docs.map((v) => v.id)

    // Get merchant's offers
    const offers = await payload.find({
      collection: 'offers',
      where: {
        venue: { in: venueIds },
      },
      limit: 10,
    })

    // Get live slots for this merchant's offers
    const offerIds = offers.docs.map((o) => o.id)
    const now = new Date()
    const liveSlots = await payload.find({
      collection: 'offer-slots',
      where: {
        offer: { in: offerIds },
        state: { equals: 'live' },
        startsAt: { less_than_equal: now.toISOString() },
        endsAt: { greater_than: now.toISOString() },
      },
      depth: 2,
      limit: 20,
    })

    // Get recent claims
    const recentClaims = await payload.find({
      collection: 'claims',
      where: {
        offer: {
          in: offerIds,
        },
      },
      limit: 10,
      sort: '-reservedAt',
      depth: 2,
    })

    return NextResponse.json({
      success: true,
      offers: offers.docs,
      liveSlots: liveSlots.docs,
      recentClaims: recentClaims.docs,
    })
  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 },
    )
  }
}
