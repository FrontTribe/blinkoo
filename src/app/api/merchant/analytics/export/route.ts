import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/merchant/analytics/export
 * Export analytics data as CSV
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
    const format = searchParams.get('format') || 'csv'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

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

    // Get all claims
    const whereClause: any = {
      offer: { in: offerIds },
    }

    if (startDate && endDate) {
      whereClause.reservedAt = {
        greater_than_equal: startDate,
        less_than_equal: endDate,
      }
    }

    const claims = await payload.find({
      collection: 'claims',
      where: whereClause,
      depth: 3,
      limit: 10000,
    })

    // Calculate metrics per offer
    const offerMetrics: Record<string, any> = {}

    offers.docs.forEach((offer: any) => {
      offerMetrics[offer.id] = {
        title: offer.title,
        claims: 0,
        redeemed: 0,
        expired: 0,
        reserved: 0,
      }
    })

    claims.docs.forEach((claim: any) => {
      const offerId = typeof claim.offer === 'string' ? claim.offer : claim.offer?.id
      if (offerMetrics[offerId]) {
        offerMetrics[offerId].claims++
        if (claim.status === 'REDEEMED') offerMetrics[offerId].redeemed++
        if (claim.status === 'EXPIRED') offerMetrics[offerId].expired++
        if (claim.status === 'RESERVED') offerMetrics[offerId].reserved++
      }
    })

    // Create CSV content
    if (format === 'csv') {
      const csvRows = [
        ['Offer Title', 'Total Claims', 'Redeemed', 'Expired', 'Reserved', 'Redemption Rate'],
      ]

      Object.values(offerMetrics).forEach((metric) => {
        const redemptionRate =
          metric.claims > 0 ? ((metric.redeemed / metric.claims) * 100).toFixed(1) : '0'
        csvRows.push([
          metric.title,
          metric.claims.toString(),
          metric.redeemed.toString(),
          metric.expired.toString(),
          metric.reserved.toString(),
          `${redemptionRate}%`,
        ])
      })

      const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
      const csvWithBOM = '\uFEFF' + csvContent

      return new Response(csvWithBOM, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="analytics-${Date.now()}.csv"`,
        },
      })
    }

    // JSON format (fallback)
    return NextResponse.json({
      period: { startDate, endDate },
      metrics: Object.values(offerMetrics),
      totalOffers: offers.docs.length,
      totalClaims: claims.docs.length,
    })
  } catch (error: any) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json({ error: 'Failed to export analytics' }, { status: 500 })
  }
}
