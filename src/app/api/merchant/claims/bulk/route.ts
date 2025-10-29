import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * POST /api/merchant/claims/bulk
 * Perform bulk operations on claims
 */
export async function POST(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { claimIds, action } = body

    if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
      return NextResponse.json({ error: 'No claims specified' }, { status: 400 })
    }

    // Get merchant
    const merchants = await payload.find({
      collection: 'merchants',
      where: { owner: { equals: user.id } },
      limit: 1,
    })

    if (merchants.docs.length === 0) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
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

    // Verify all claims belong to this merchant
    const claims = await payload.find({
      collection: 'claims',
      where: {
        id: { in: claimIds.map((id: string) => parseInt(id)) },
      },
      depth: 2,
      limit: 1000,
    })

    let updated = 0
    let failed = 0

    for (const claim of claims.docs) {
      const offer =
        typeof claim.offer === 'object'
          ? claim.offer
          : await payload.findByID({
              collection: 'offers',
              id: typeof claim.offer === 'number' ? claim.offer : parseInt(claim.offer as string),
            })

      const venue =
        typeof (offer as any).venue === 'object'
          ? (offer as any).venue
          : await payload.findByID({
              collection: 'venues',
              id:
                typeof (offer as any).venue === 'number'
                  ? (offer as any).venue
                  : parseInt((offer as any).venue as string),
            })

      if ((venue as any).merchant !== merchant.id) {
        failed++
        continue
      }

      try {
        await payload.update({
          collection: 'claims',
          id: claim.id,
          data: {
            status: action,
            ...(action === 'REDEEMED' ? { redeemedAt: new Date().toISOString() } : {}),
          },
        })
        updated++
      } catch (error) {
        console.error(`Error updating claim ${claim.id}:`, error)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      failed,
      total: claims.docs.length,
    })
  } catch (error: any) {
    console.error('Error performing bulk actions:', error)
    return NextResponse.json(
      {
        error: 'Failed to perform bulk actions',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
