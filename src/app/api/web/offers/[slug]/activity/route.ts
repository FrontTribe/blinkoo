import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

/**
 * GET /api/web/offers/[slug]/activity
 * Get recent claim activity for an offer
 */
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const config = await configPromise
  const payload = await getPayload({ config })

  try {
    const offerId = params.slug

    // Get recent claims for this offer (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const recentClaims = await payload.find({
      collection: 'claims',
      where: {
        offer: { equals: offerId },
        status: { equals: 'REDEEMED' },
        redeemedAt: { greater_than: oneHourAgo },
      },
      limit: 10,
      sort: '-redeemedAt',
    })

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
      recentCount: recentClaims.docs.length,
      totalCount: allClaims.totalDocs,
      recentActivity: recentClaims.docs.map((claim: any) => ({
        redeemedAt: claim.redeemedAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}
