import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/staff/history
 * Get redemption history for staff user
 * Query params: filter (all | today | week)
 */
export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is staff, merchant_owner, or admin
  if (user.role !== 'staff' && user.role !== 'merchant_owner' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized - staff only' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'today'

    // Calculate date range based on filter
    const now = new Date()
    let startDate: Date | undefined

    if (filter === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (filter === 'week') {
      const daysSinceMonday = (now.getDay() + 6) % 7 // Monday = 0
      startDate = new Date(now)
      startDate.setDate(now.getDate() - daysSinceMonday)
      startDate.setHours(0, 0, 0, 0)
    }

    // Build where clause
    const where: any = {
      status: { equals: 'REDEEMED' },
    }

    // For staff users, filter by staff member
    // For merchant_owner/admin, show all redemptions for their venues
    if (user.role === 'staff') {
      where.staff = { equals: user.id }
    } else if (user.role === 'merchant_owner' || user.role === 'admin') {
      // Get merchant's venues
      const merchants = await payload.find({
        collection: 'merchants',
        where: { owner: { equals: user.id } },
        limit: 1,
      })

      if (merchants.docs.length > 0) {
        const merchant = merchants.docs[0]
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
          limit: 1000,
        })

        const offerIds = offers.docs.map((o) => o.id)
        where.offer = { in: offerIds }
      }
    }

    // Filter by date range
    if (startDate) {
      where.redeemedAt = { greater_than: startDate.toISOString() }
    }

    // Get redemptions
    const redemptions = await payload.find({
      collection: 'claims',
      where,
      sort: '-redeemedAt',
      limit: 100,
      depth: 2, // Include related offer and user data
    })

    // Format response
    const formatted = redemptions.docs.map((claim: any) => {
      const offer = typeof claim.offer === 'object' ? claim.offer : null
      const customer = typeof claim.user === 'object' ? claim.user : null

      return {
        id: claim.id,
        code: claim.sixCode || 'N/A',
        offerTitle: offer?.title || 'Unknown Offer',
        customerName: customer?.name || customer?.email || 'Unknown Customer',
        redeemedAt: claim.redeemedAt,
        status: claim.status === 'REDEEMED' ? 'redeemed' : 'failed',
        offerId: typeof claim.offer === 'object' ? claim.offer.id : claim.offer,
        customerId: typeof claim.user === 'object' ? claim.user.id : claim.user,
      }
    })

    return NextResponse.json({
      redemptions: formatted,
      total: redemptions.totalDocs,
      filter,
    })
  } catch (error: any) {
    console.error('Error fetching redemption history:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch history' }, { status: 500 })
  }
}
