import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'
import { getMerchantWithKYC } from '@/utilities/checkMerchantKYC'

export async function GET() {
  const config = await configPromise
  const payload = await getPayload({ config })
  // const headers = await getHeaders()
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check KYC approval
  const merchant = await getMerchantWithKYC(payload, user.id)
  if (!merchant || merchant.kycStatus !== 'approved') {
    return NextResponse.json({ error: 'Account not approved' }, { status: 403 })
  }

  try {

    // Get venues for this merchant
    const venues = await payload.find({
      collection: 'venues',
      where: { merchant: { equals: merchant.id } },
      limit: 100,
    })

    const venueIds = venues.docs.map((v) => v.id)

    // Get offers for this merchant
    const offers = await payload.find({
      collection: 'offers',
      where: {
        venue: { in: venueIds },
      },
      limit: 50,
      depth: 2,
      sort: '-updatedAt',
    })

    return NextResponse.json({ offers: offers.docs })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  // const headers = await getHeaders()
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check KYC approval
  const merchant = await getMerchantWithKYC(payload, user.id)
  if (!merchant || merchant.kycStatus !== 'approved') {
    return NextResponse.json({ error: 'Account not approved' }, { status: 403 })
  }

  try {
    const body = await request.json()

    console.log('Received body:', JSON.stringify(body, null, 2))
    console.log('Date fields:', { startsAt: body.startsAt, endsAt: body.endsAt })

    // Create offer
    const offer = await payload.create({
      collection: 'offers',
      data: {
        venue: parseInt(body.venueId),
        title: body.title,
        description: body.description,
        terms: body.terms,
        type: body.type,
        discountValue: parseFloat(body.discountValue),
        perUserLimit: parseInt(body.perUserLimit) || 1,
        cooldownMinutes: parseInt(body.cooldownMinutes) || 0,
        geofenceKm: parseFloat(body.geofenceKm) || 0,
        status: 'active',
      },
      draft: false,
    })

    console.log('Offer created successfully:', offer.id)

    // Convert datetime-local strings to ISO format
    const startsAtISO = body.startsAt ? new Date(body.startsAt).toISOString() : undefined
    const endsAtISO = body.endsAt ? new Date(body.endsAt).toISOString() : undefined

    console.log('Creating slot with dates:', { startsAtISO, endsAtISO })
    console.log('Raw body date values:', { startsAt: body.startsAt, endsAt: body.endsAt })

    // Check if slot should be live (starts in the past or now)
    const now = new Date()
    const slotState = startsAtISO && new Date(startsAtISO) <= now ? 'live' : 'scheduled'

    // Create the first offer slot
    const slotData: any = {
      offer: offer.id,
      startsAt: startsAtISO,
      endsAt: endsAtISO,
      qtyTotal: parseInt(body.qtyTotal),
      qtyRemaining: parseInt(body.qtyTotal),
      mode: body.mode,
      state: slotState,
    }

    // Add drip fields if mode is drip
    if (body.mode === 'drip') {
      slotData.dripEveryMinutes = parseInt(body.dripEveryMinutes) || 15
      slotData.dripQty = parseInt(body.dripQty) || 10
    }

    console.log('Slot data being sent:', slotData)

    const slot = await payload.create({
      collection: 'offer-slots',
      data: slotData,
      draft: false,
    })

    console.log('Offer slot created successfully:', slot.id)

    return NextResponse.json({ offer, slot })
  } catch (error: any) {
    console.error('Error creating offer:', error)
    console.error('Validation details:', error.data)
    return NextResponse.json(
      {
        error: 'Failed to create offer',
        details: error.data || error.message,
      },
      { status: 500 },
    )
  }
}
