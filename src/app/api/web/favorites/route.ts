import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/web/favorites
 * Get all favorites for the authenticated user
 */
export async function GET() {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const favorites = await payload.find({
      collection: 'favorites',
      where: {
        user: { equals: user.id },
      },
      depth: 2,
      sort: '-createdAt',
    })

    return NextResponse.json({ favorites: favorites.docs })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

/**
 * POST /api/web/favorites
 * Body: { offerId: string }
 * Add an offer to favorites
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
    const { offerId } = body

    if (!offerId) {
      return NextResponse.json({ error: 'offerId is required' }, { status: 400 })
    }

    // Get the offer to find its venue
    const offer = await payload.findByID({
      collection: 'offers',
      id: offerId,
    })

    // Extract venue ID
    let venueId: string | number | undefined
    if (typeof offer.venue === 'string' || typeof offer.venue === 'number') {
      venueId = offer.venue
    } else if (offer.venue && typeof offer.venue === 'object' && 'id' in offer.venue) {
      venueId = offer.venue.id
    }
    console.log('Extracted venue ID:', venueId, 'from offer:', offer.id)

    if (!venueId) {
      return NextResponse.json({ error: 'Offer has no venue' }, { status: 400 })
    }

    // Check if already favorited
    const existing = await payload.find({
      collection: 'favorites',
      where: {
        user: { equals: user.id },
        venue: { equals: venueId },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json({ favorite: existing.docs[0] })
    }

    // Create favorite
    const favorite = await payload.create({
      collection: 'favorites',
      data: {
        user: user.id as any,
        venue: venueId as any,
      },
      draft: false,
    })

    return NextResponse.json({ favorite })
  } catch (error) {
    console.error('Error creating favorite:', error)
    return NextResponse.json({ error: 'Failed to create favorite' }, { status: 500 })
  }
}

/**
 * DELETE /api/web/favorites
 * Body: { offerId: string }
 * Remove an offer from favorites
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

    // Get the offer to find its venue
    const offer = await payload.findByID({
      collection: 'offers',
      id: offerId,
    })

    // Extract venue ID
    let venueId: string | number | undefined
    if (typeof offer.venue === 'string' || typeof offer.venue === 'number') {
      venueId = offer.venue
    } else if (offer.venue && typeof offer.venue === 'object' && 'id' in offer.venue) {
      venueId = offer.venue.id
    }

    if (!venueId) {
      return NextResponse.json({ error: 'Offer has no venue' }, { status: 400 })
    }

    // Find the favorite
    const favorites = await payload.find({
      collection: 'favorites',
      where: {
        user: { equals: user.id },
        venue: { equals: venueId },
      },
      limit: 1,
    })

    if (favorites.docs.length === 0) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
    }

    // Delete the favorite
    await payload.delete({
      collection: 'favorites',
      id: favorites.docs[0].id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting favorite:', error)
    return NextResponse.json({ error: 'Failed to delete favorite' }, { status: 500 })
  }
}
