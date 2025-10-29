import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/merchant/analytics/comparison
 * Get comparison between two date ranges
 */
export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week' // week, month

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

    // Calculate date ranges based on period
    const now = new Date()
    const currentEnd = new Date(now)
    currentEnd.setHours(23, 59, 59, 999)

    const currentStart = new Date()
    currentStart.setHours(0, 0, 0, 0)
    if (period === 'week') {
      currentStart.setDate(currentStart.getDate() - 7)
    } else {
      currentStart.setMonth(currentStart.getMonth() - 1)
    }

    const previousEnd = new Date(currentStart)
    previousEnd.setSeconds(previousEnd.getSeconds() - 1)

    const previousStart = new Date(previousEnd)
    if (period === 'week') {
      previousStart.setDate(previousStart.getDate() - 7)
    } else {
      previousStart.setMonth(previousStart.getMonth() - 1)
    }

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

    // Get claims for current period
    const currentClaims = await payload.find({
      collection: 'claims',
      where: {
        offer: { in: offerIds },
        reservedAt: {
          greater_than_equal: currentStart.toISOString(),
          less_than_equal: currentEnd.toISOString(),
        },
      },
      limit: 10000,
    })

    // Get claims for previous period
    const previousClaims = await payload.find({
      collection: 'claims',
      where: {
        offer: { in: offerIds },
        reservedAt: {
          greater_than_equal: previousStart.toISOString(),
          less_than_equal: previousEnd.toISOString(),
        },
      },
      limit: 10000,
    })

    // Calculate metrics for current period
    const currentStats = {
      totalClaims: currentClaims.docs.length,
      redeemed: currentClaims.docs.filter((c: any) => c.status === 'REDEEMED').length,
      expired: currentClaims.docs.filter((c: any) => c.status === 'EXPIRED').length,
      reserved: currentClaims.docs.filter((c: any) => c.status === 'RESERVED').length,
    }

    // Calculate metrics for previous period
    const previousStats = {
      totalClaims: previousClaims.docs.length,
      redeemed: previousClaims.docs.filter((c: any) => c.status === 'REDEEMED').length,
      expired: previousClaims.docs.filter((c: any) => c.status === 'EXPIRED').length,
      reserved: previousClaims.docs.filter((c: any) => c.status === 'RESERVED').length,
    }

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return (((current - previous) / previous) * 100).toFixed(1)
    }

    const comparison = {
      currentPeriod: {
        start: currentStart.toISOString().split('T')[0],
        end: currentEnd.toISOString().split('T')[0],
        stats: currentStats,
      },
      previousPeriod: {
        start: previousStart.toISOString().split('T')[0],
        end: previousEnd.toISOString().split('T')[0],
        stats: previousStats,
      },
      changes: {
        totalClaims: calculateChange(currentStats.totalClaims, previousStats.totalClaims),
        redeemed: calculateChange(currentStats.redeemed, previousStats.redeemed),
        expired: calculateChange(currentStats.expired, previousStats.expired),
        reserved: calculateChange(currentStats.reserved, previousStats.reserved),
      },
    }

    return NextResponse.json(comparison)
  } catch (error) {
    console.error('Error fetching comparison:', error)
    return NextResponse.json({ error: 'Failed to fetch comparison data' }, { status: 500 })
  }
}
