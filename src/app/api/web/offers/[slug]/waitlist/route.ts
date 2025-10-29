import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find offer by slug
    const offers = await payload.find({
      collection: 'offers',
      where: {
        slug: { equals: slug },
      },
      limit: 1,
    })

    if (offers.docs.length === 0) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    const offer = offers.docs[0]
    const body = await request.json()
    const { autoClaim = true } = body

    // Check if already on waitlist
    const existing = await payload.find({
      collection: 'waitlists',
      where: {
        user: { equals: user.id },
        offer: { equals: offer.id },
        status: { equals: 'waiting' },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json({ error: 'Already on waitlist' }, { status: 400 })
    }

    // Get all waitlist entries for this offer to calculate position
    const allWaitlist = await payload.find({
      collection: 'waitlists',
      where: {
        offer: { equals: offer.id },
        status: { equals: 'waiting' },
      },
      limit: 1000,
      sort: 'createdAt',
    })

    const position = allWaitlist.docs.length + 1

    // Create waitlist entry
    const waitlist = await payload.create({
      collection: 'waitlists',
      data: {
        user: user.id,
        offer: offer.id,
        position,
        autoClaim,
        status: 'waiting',
      },
    })

    return NextResponse.json({ waitlist, position })
  } catch (error: any) {
    console.error('Error joining waitlist:', error)
    return NextResponse.json({ error: error.message || 'Failed to join waitlist' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find offer by slug
    const offers = await payload.find({
      collection: 'offers',
      where: {
        slug: { equals: slug },
      },
      limit: 1,
    })

    if (offers.docs.length === 0) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    const offer = offers.docs[0]

    // Find user's waitlist entry for this offer
    const waitlistEntry = await payload.find({
      collection: 'waitlists',
      where: {
        user: { equals: user.id },
        offer: { equals: offer.id },
      },
      limit: 1,
    })

    if (waitlistEntry.docs.length === 0) {
      return NextResponse.json({ error: 'Not on waitlist' }, { status: 404 })
    }

    await payload.delete({
      collection: 'waitlists',
      id: waitlistEntry.docs[0].id,
    })

    // Update positions of remaining entries
    const remaining = await payload.find({
      collection: 'waitlists',
      where: {
        offer: { equals: offer.id },
        status: { equals: 'waiting' },
      },
      limit: 1000,
      sort: 'createdAt',
    })

    for (let i = 0; i < remaining.docs.length; i++) {
      await payload.update({
        collection: 'waitlists',
        id: remaining.docs[i].id,
        data: {
          position: i + 1,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error leaving waitlist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to leave waitlist' },
      { status: 500 },
    )
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find offer by slug
    const offers = await payload.find({
      collection: 'offers',
      where: {
        slug: { equals: slug },
      },
      limit: 1,
    })

    if (offers.docs.length === 0) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    const offer = offers.docs[0]

    const waitlistEntry = await payload.find({
      collection: 'waitlists',
      where: {
        user: { equals: user.id },
        offer: { equals: offer.id },
      },
      limit: 1,
    })

    if (waitlistEntry.docs.length === 0) {
      return NextResponse.json({ onWaitlist: false })
    }

    return NextResponse.json({
      onWaitlist: true,
      position: waitlistEntry.docs[0].position,
      autoClaim: waitlistEntry.docs[0].autoClaim,
      status: waitlistEntry.docs[0].status,
    })
  } catch (error: any) {
    console.error('Error checking waitlist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check waitlist' },
      { status: 500 },
    )
  }
}
