import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

/**
 * GET /api/web/offers/[slug]/activity
 * Get recent claim activity for an offer
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const config = await configPromise
  const payload = await getPayload({ config })

  try {
    const { slug } = await params
    const offerId = slug

    // Get recent claims for this offer (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const recentClaims = await payload.find({
      collection: 'claims',
      where: {
        offer: { equals: offerId },
        status: { in: ['RESERVED', 'REDEEMED'] },
        createdAt: { greater_than: oneHourAgo },
      },
      limit: 100,
      sort: '-createdAt',
    })

    // Get recent redemptions (last hour)
    const recentRedemptions = await payload.find({
      collection: 'claims',
      where: {
        offer: { equals: offerId },
        status: { equals: 'REDEEMED' },
        redeemedAt: { greater_than: oneHourAgo },
      },
      limit: 100,
      sort: '-redeemedAt',
    })

    // Calculate velocity (claims per hour)
    const claimsPerHour = recentClaims.docs.length

    // Check if trending (high velocity: 5+ claims in last hour)
    const isTrending = claimsPerHour >= 5

    // Get total claim count for this offer
    const allClaims = await payload.find({
      collection: 'claims',
      where: {
        offer: { equals: offerId },
        status: { in: ['REDEEMED'] },
      },
      limit: 1,
    })

    return NextResponse.json({
      recentClaims: recentClaims.docs.length,
      recentRedemptions: recentRedemptions.docs.length,
      totalRedemptions: allClaims.totalDocs,
      claimsPerHour,
      isTrending,
      recentActivity: recentClaims.docs.map((claim: any) => ({
        createdAt: claim.createdAt,
        status: claim.status,
      })),
    })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}
