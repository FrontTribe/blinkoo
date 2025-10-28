import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/merchant/offers/[id]/slots
 * Fetch all slots for an offer
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const config = await configPromise
  const payload = await getPayload({ config })
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

    // Get all slots for this offer
    const slots = await payload.find({
      collection: 'offer-slots',
      where: {
        offer: { equals: id },
      },
      sort: '-startsAt',
      limit: 100,
    })

    return NextResponse.json({ slots: slots.docs })
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}

/**
 * POST /api/merchant/offers/[id]/slots
 * Create a new slot for an offer
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Get the specific offer to verify ownership
    const offer = await payload.findByID({
      collection: 'offers',
      id,
    })

    // Get venues for this merchant
    const venues = await payload.find({
      collection: 'venues',
      where: { merchant: { equals: merchant.id } },
      limit: 100,
    })

    const venueIds = venues.docs.map((v) => v.id)
    const offerVenueId = typeof offer.venue === 'object' ? offer.venue.id : offer.venue

    // Check if offer belongs to merchant's venues
    if (!venueIds.includes(offerVenueId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Prepare slot data
    const slotData: any = {
      offer: id,
      startsAt: body.startsAt ? new Date(body.startsAt).toISOString() : undefined,
      endsAt: body.endsAt ? new Date(body.endsAt).toISOString() : undefined,
      qtyTotal: parseInt(body.qtyTotal),
      qtyRemaining: parseInt(body.qtyTotal),
      mode: body.mode,
      state: 'scheduled',
    }

    // Add drip fields if mode is drip
    if (body.mode === 'drip') {
      slotData.dripEveryMinutes = parseInt(body.dripEveryMinutes) || 15
      slotData.dripQty = parseInt(body.dripQty) || 10
    }

    // Check if slot should be live (starts in the past or now)
    const now = new Date()
    if (slotData.startsAt && new Date(slotData.startsAt) <= now) {
      slotData.state = 'live'
    }

    // Create the slot
    const slot = await payload.create({
      collection: 'offer-slots',
      data: slotData,
      draft: false,
    })

    return NextResponse.json({ slot })
  } catch (error) {
    console.error('Error creating slot:', error)
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 })
  }
}
