import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user is staff
  if (user.role !== 'staff') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    // Get staff's assigned venues
    const staffMember = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 2,
    })

    const assignedVenues = staffMember.venues || []
    const venueIds = assignedVenues.map((v: any) =>
      typeof v.venue === 'object' ? v.venue.id : v.venue
    )

    if (venueIds.length === 0) {
      return NextResponse.json({
        todayRedeemed: 0,
        weekRedeemed: 0,
        pendingRedemptions: 0,
      })
    }

    // Get offers for assigned venues
    const offers = await payload.find({
      collection: 'offers',
      where: {
        venue: { in: venueIds },
      },
      limit: 100,
    })

    const offerIds = offers.docs.map((o) => o.id)

    if (offerIds.length === 0) {
      return NextResponse.json({
        todayRedeemed: 0,
        weekRedeemed: 0,
        pendingRedemptions: 0,
      })
    }

    // Calculate date ranges
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(now)
    startOfWeek.setDate(startOfWeek.getDate() - 7)

    // Get today's redemptions
    const todayClaims = await payload.find({
      collection: 'claims',
      where: {
        offer: { in: offerIds },
        status: { equals: 'REDEEMED' },
        redeemedAt: { greater_than_equal: startOfToday.toISOString() },
      },
      limit: 100,
    })

    // Get week's redemptions
    const weekClaims = await payload.find({
      collection: 'claims',
      where: {
        offer: { in: offerIds },
        status: { equals: 'REDEEMED' },
        redeemedAt: { greater_than_equal: startOfWeek.toISOString() },
      },
      limit: 100,
    })

    // Get pending redemptions (RESERVED status)
    const pendingClaims = await payload.find({
      collection: 'claims',
      where: {
        offer: { in: offerIds },
        status: { equals: 'RESERVED' },
      },
      limit: 100,
    })

    return NextResponse.json({
      todayRedeemed: todayClaims.totalDocs,
      weekRedeemed: weekClaims.totalDocs,
      pendingRedemptions: pendingClaims.totalDocs,
    })
  } catch (error) {
    console.error('Error fetching staff dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

