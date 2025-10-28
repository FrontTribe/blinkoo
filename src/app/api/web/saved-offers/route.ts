import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/web/saved-offers
 * Get all saved offers for the authenticated user
 */
export async function GET() {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const savedOffers = await payload.find({
      collection: 'saved-offers',
      where: {
        user: { equals: user.id },
      },
      depth: 2,
      sort: '-createdAt',
    })

    return NextResponse.json({ savedOffers: savedOffers.docs })
  } catch (error) {
    console.error('Error fetching saved offers:', error)
    return NextResponse.json({ error: 'Failed to fetch saved offers' }, { status: 500 })
  }
}

/**
 * POST /api/web/saved-offers
 * Body: { offerId: string, notifyOnSlotStart?: boolean, notify30MinBefore?: boolean }
 * Add an offer to saved offers
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
    const { offerId, notifyOnSlotStart = true, notify30MinBefore = false } = body

    if (!offerId) {
      return NextResponse.json({ error: 'offerId is required' }, { status: 400 })
    }

    // Check if already saved
    const existing = await payload.find({
      collection: 'saved-offers',
      where: {
        user: { equals: user.id },
        offer: { equals: offerId },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json({ savedOffer: existing.docs[0] })
    }

    // Create saved offer
    const savedOffer = await payload.create({
      collection: 'saved-offers',
      data: {
        user: user.id as any,
        offer: offerId as any,
        notifyOnSlotStart,
        notify30MinBefore,
      },
      draft: false,
    })

    return NextResponse.json({ savedOffer })
  } catch (error) {
    console.error('Error creating saved offer:', error)
    return NextResponse.json({ error: 'Failed to create saved offer' }, { status: 500 })
  }
}

/**
 * DELETE /api/web/saved-offers
 * Body: { offerId: string }
 * Remove an offer from saved offers
 */
export async function DELETE(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { offerId } = body

    if (!offerId) {
      return NextResponse.json({ error: 'offerId is required' }, { status: 400 })
    }

    // Find the saved offer
    const savedOffers = await payload.find({
      collection: 'saved-offers',
      where: {
        user: { equals: user.id },
        offer: { equals: offerId },
      },
      limit: 1,
    })

    if (savedOffers.docs.length === 0) {
      return NextResponse.json({ error: 'Saved offer not found' }, { status: 404 })
    }

    // Delete the saved offer
    await payload.delete({
      collection: 'saved-offers',
      id: savedOffers.docs[0].id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting saved offer:', error)
    return NextResponse.json({ error: 'Failed to delete saved offer' }, { status: 500 })
  }
}
