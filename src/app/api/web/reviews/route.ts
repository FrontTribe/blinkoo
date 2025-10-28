import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/web/reviews
 * Query: ?offerId=xxx
 * Fetch reviews for an offer
 */
export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })

  try {
    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get('offerId')

    if (!offerId) {
      return NextResponse.json({ error: 'offerId is required' }, { status: 400 })
    }

    const reviews = await payload.find({
      collection: 'reviews',
      where: {
        offer: { equals: offerId },
      },
      depth: 1,
      sort: '-createdAt',
      limit: 50,
    })

    return NextResponse.json({ reviews: reviews.docs })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

/**
 * POST /api/web/reviews
 * Body: { offerId: string, rating: number, comment: string }
 * Submit a review for a redeemed offer
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
    const { offerId, rating, comment } = body

    if (!offerId || !rating) {
      return NextResponse.json({ error: 'offerId and rating are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if user has redeemed this offer
    const redeemedClaims = await payload.find({
      collection: 'claims',
      where: {
        user: { equals: user.id },
        offer: { equals: offerId },
        status: { equals: 'REDEEMED' },
      },
      limit: 1,
    })

    if (redeemedClaims.docs.length === 0) {
      return NextResponse.json(
        { error: 'You must redeem this offer before leaving a review' },
        { status: 403 },
      )
    }

    // Check if user already reviewed this offer
    const existingReviews = await payload.find({
      collection: 'reviews',
      where: {
        user: { equals: user.id },
        offer: { equals: offerId },
      },
      limit: 1,
    })

    if (existingReviews.docs.length > 0) {
      return NextResponse.json({ error: 'You already reviewed this offer' }, { status: 400 })
    }

    // Create review
    const review = await payload.create({
      collection: 'reviews',
      data: {
        user: user.id as any,
        offer: offerId as any,
        rating,
        comment: comment || '',
      },
      draft: false,
    })

    return NextResponse.json({ review })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: error.message || 'Failed to create review' }, { status: 500 })
  }
}
