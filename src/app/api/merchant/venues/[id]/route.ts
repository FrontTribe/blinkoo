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

    // Check if venue belongs to merchant
    const venue = await payload.findByID({
      collection: 'venues',
      id,
    })

    const venueMerchantId = typeof venue.merchant === 'object' ? venue.merchant.id : venue.merchant

    if (venueMerchantId !== merchant.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ venue })
  } catch (error) {
    console.error('Error fetching venue:', error)
    return NextResponse.json({ error: 'Failed to fetch venue' }, { status: 500 })
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

    // Check if venue belongs to merchant
    const venue = await payload.findByID({
      collection: 'venues',
      id,
    })

    const venueMerchantId = typeof venue.merchant === 'object' ? venue.merchant.id : venue.merchant

    if (venueMerchantId !== merchant.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update venue
    const updatedVenue = await payload.update({
      collection: 'venues',
      id,
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        country: body.country || 'Croatia',
        lat: body.lat,
        lng: body.lng,
        phone: body.phone,
        email: body.email,
        openHours: body.openHours || {},
        status: body.status || 'active',
      },
    })

    return NextResponse.json({ venue: updatedVenue })
  } catch (error) {
    console.error('Error updating venue:', error)
    return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 })
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

    // Check if venue belongs to merchant
    const venue = await payload.findByID({
      collection: 'venues',
      id,
    })

    const venueMerchantId = typeof venue.merchant === 'object' ? venue.merchant.id : venue.merchant

    if (venueMerchantId !== merchant.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Find and delete all offers for this venue
    const offers = await payload.find({
      collection: 'offers',
      where: {
        venue: { equals: id },
      },
      limit: 1000,
    })

    for (const offer of offers.docs) {
      // Find and delete all offer slots for this offer
      const offerSlots = await payload.find({
        collection: 'offer-slots',
        where: {
          offer: { equals: offer.id },
        },
        limit: 1000,
      })

      for (const slot of offerSlots.docs) {
        await payload.delete({
          collection: 'offer-slots',
          id: slot.id,
        })
      }

      // Delete the offer
      await payload.delete({
        collection: 'offers',
        id: offer.id,
      })
    }

    // Delete venue
    await payload.delete({
      collection: 'venues',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting venue:', error)
    return NextResponse.json({ error: 'Failed to delete venue' }, { status: 500 })
  }
}
