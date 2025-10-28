import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/web/claims/[id]/can-review
 * Check if user can review this claim
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const claim = await payload.findByID({
      collection: 'claims',
      id: params.id,
      depth: 2,
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    const claimData = claim as any

    // Check if claim belongs to user
    const userId = typeof claimData.user === 'object' ? claimData.user.id : claimData.user
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if claim is REDEEMED
    if (claimData.status !== 'REDEEMED') {
      return NextResponse.json({ canReview: false, reason: 'Claim not redeemed' })
    }

    // Check if already reviewed
    if (claimData.reviewed) {
      return NextResponse.json({ canReview: false, reason: 'Already reviewed' })
    }

    // Check if user already reviewed this offer
    const existingReviews = await payload.find({
      collection: 'reviews',
      where: {
        user: { equals: user.id },
        offer: {
          equals: typeof claimData.offer === 'object' ? claimData.offer.id : claimData.offer,
        },
      },
      limit: 1,
    })

    if (existingReviews.docs.length > 0) {
      return NextResponse.json({ canReview: false, reason: 'Already reviewed this offer' })
    }

    return NextResponse.json({ canReview: true })
  } catch (error) {
    console.error('Error checking review eligibility:', error)
    return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 })
  }
}
