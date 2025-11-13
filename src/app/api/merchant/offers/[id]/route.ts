import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const config = await configPromise
  const payload = await getPayload({ config })
  // const headers = await getHeaders()
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get locale from query params, default to 'hr'
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') || 'hr') as 'hr' | 'en'

    // Get merchant for this user
    const merchants = await payload.find({
      collection: 'merchants',
      where: {
        owner: { equals: user.id },
      },
      limit: 1,
    })

    if (merchants.docs.length === 0) {
      return NextResponse.json({ error: 'Merchant account not found' }, { status: 404 })
    }

    const merchant = merchants.docs[0]

    // Get venues for this merchant
    const venues = await payload.find({
      collection: 'venues',
      where: { merchant: { equals: merchant.id } },
      limit: 100,
    })

    const venueIds = venues.docs.map((v) => v.id)

    // Get the specific offer with locale context
    const offer = await payload.findByID({
      collection: 'offers',
      id,
      locale, // Fetch with locale context to get localized fields
      depth: 2,
    })

    const offerVenueId = typeof offer.venue === 'object' ? offer.venue.id : offer.venue

    // Check if offer belongs to merchant's venues
    if (!venueIds.includes(offerVenueId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ offer })
  } catch (error) {
    console.error('Error fetching offer:', error)
    return NextResponse.json({ error: 'Failed to fetch offer' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const config = await configPromise
  const payload = await getPayload({ config })
  // const headers = await getHeaders()
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Get locale from request body or query params, default to 'hr'
    const { searchParams } = new URL(request.url)
    const locale = (body.locale || searchParams.get('locale') || 'hr') as 'hr' | 'en'

    // Get merchant for this user
    const merchants = await payload.find({
      collection: 'merchants',
      where: {
        owner: { equals: user.id },
      },
      limit: 1,
    })

    if (merchants.docs.length === 0) {
      return NextResponse.json({ error: 'Merchant account not found' }, { status: 404 })
    }

    const merchant = merchants.docs[0]

    // Get venues for this merchant
    const venues = await payload.find({
      collection: 'venues',
      where: { merchant: { equals: merchant.id } },
      limit: 100,
    })

    const venueIds = venues.docs.map((v) => v.id)

    // Get the specific offer
    const offer = await payload.findByID({
      collection: 'offers',
      id,
    })

    const offerVenueId = typeof offer.venue === 'object' ? offer.venue.id : offer.venue

    // Check if offer belongs to merchant's venues
    if (!venueIds.includes(offerVenueId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update offer with locale context
    const updatedOffer = await payload.update({
      collection: 'offers',
      id,
      locale, // Pass locale to update the correct localized fields
      data: {
        title: body.title,
        description: body.description,
        terms: body.terms,
        type: body.type,
        discountValue: parseFloat(body.discountValue),
        perUserLimit: parseInt(body.perUserLimit) || 1,
        cooldownMinutes: parseInt(body.cooldownMinutes) || 0,
        geofenceKm: parseFloat(body.geofenceKm) || 0,
        status: body.status || 'active',
      },
    })

    return NextResponse.json({ offer: updatedOffer })
  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const config = await configPromise
  const payload = await getPayload({ config })
  // const headers = await getHeaders()
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get merchant for this user
    const merchants = await payload.find({
      collection: 'merchants',
      where: {
        owner: { equals: user.id },
      },
      limit: 1,
    })

    if (merchants.docs.length === 0) {
      return NextResponse.json({ error: 'Merchant account not found' }, { status: 404 })
    }

    const merchant = merchants.docs[0]

    // Get venues for this merchant
    const venues = await payload.find({
      collection: 'venues',
      where: { merchant: { equals: merchant.id } },
      limit: 100,
    })

    const venueIds = venues.docs.map((v) => v.id)

    // Get the specific offer
    const offer = await payload.findByID({
      collection: 'offers',
      id,
    })

    const offerVenueId = typeof offer.venue === 'object' ? offer.venue.id : offer.venue

    // Check if offer belongs to merchant's venues
    if (!venueIds.includes(offerVenueId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Find and delete all offer slots for this offer
    const slots = await payload.find({
      collection: 'offer-slots',
      where: {
        offer: { equals: id },
      },
      limit: 1000,
    })

    // Delete all claims associated with these slots
    for (const slot of slots.docs) {
      const claims = await payload.find({
        collection: 'claims',
        where: {
          slot: { equals: slot.id },
        },
        limit: 1000,
      })

      for (const claim of claims.docs) {
        await payload.delete({
          collection: 'claims',
          id: claim.id,
        })
      }

      // Now delete the slot
      await payload.delete({
        collection: 'offer-slots',
        id: slot.id,
      })
    }

    // Delete the offer
    await payload.delete({
      collection: 'offers',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting offer:', error)
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 })
  }
}
