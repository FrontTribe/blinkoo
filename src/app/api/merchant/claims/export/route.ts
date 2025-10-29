import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/merchant/claims/export
 * Export claims data as CSV
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

    // Build where clause from query params
    const whereClause: any = {
      offer: { in: offerIds },
    }

    const status = searchParams.get('status')
    if (status) {
      whereClause.status = { equals: status }
    }

    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    if (startDate && endDate) {
      whereClause.reservedAt = {
        greater_than_equal: startDate,
        less_than_equal: endDate,
      }
    }

    // Fetch all claims
    const claims = await payload.find({
      collection: 'claims',
      where: whereClause,
      depth: 3,
      limit: 10000,
    })

    // Convert to CSV
    const csvRows = [
      [
        'Claim ID',
        'Offer',
        'Venue',
        'Customer Phone',
        'Customer Email',
        'Status',
        'Reserved At',
        'Redeemed At',
        'Expired At',
      ],
    ]

    claims.docs.forEach((claim: any) => {
      const offer = claim.offer
      const venue = offer?.venue
      const userClaim = claim.user

      csvRows.push([
        claim.id.toString(),
        offer?.title || 'Unknown',
        venue?.name || 'Unknown',
        userClaim?.phone || '',
        userClaim?.email || '',
        claim.status,
        claim.reservedAt ? new Date(claim.reservedAt).toISOString() : '',
        claim.redeemedAt ? new Date(claim.redeemedAt).toISOString() : '',
        claim.expiredAt ? new Date(claim.expiredAt).toISOString() : '',
      ])
    })

    const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const csvWithBOM = '\uFEFF' + csvContent

    return new Response(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="claims-${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting claims:', error)
    return NextResponse.json({ error: 'Failed to export claims' }, { status: 500 })
  }
}
