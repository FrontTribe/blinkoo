import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * POST /api/merchant/offers/[id]/bulk-slots
 * Create multiple slots at once based on patterns
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { offerId, patterns } = body

    // Verify offer belongs to merchant
    const offer = await payload.findByID({
      collection: 'offers',
      id: parseInt(id),
      depth: 2,
    })

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
    const venue =
      typeof offer.venue === 'object'
        ? offer.venue
        : await payload.findByID({
            collection: 'venues',
            id: typeof offer.venue === 'number' ? offer.venue : parseInt(offer.venue as string),
          })

    if ((venue as any).merchant !== merchant.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const createdSlots = []

    for (const pattern of patterns) {
      const {
        startDate,
        endDate,
        startTime,
        endTime,
        qtyTotal,
        mode,
        dripEveryMinutes,
        dripQty,
        daysOfWeek,
      } = pattern

      const currentDate = new Date(startDate)
      const end = new Date(endDate)

      while (currentDate <= end) {
        const dayOfWeek = [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ][currentDate.getDay()]

        if (!daysOfWeek || daysOfWeek.length === 0 || daysOfWeek.includes(dayOfWeek)) {
          const [startHour, startMin] = startTime.split(':').map(Number)
          const [endHour, endMin] = endTime.split(':').map(Number)

          const slotStart = new Date(currentDate)
          slotStart.setHours(startHour, startMin, 0, 0)

          const slotEnd = new Date(currentDate)
          slotEnd.setHours(endHour, endMin, 0, 0)

          const now = new Date()
          const state = slotStart <= now && slotEnd >= now ? 'live' : 'scheduled'

          const slotData: any = {
            offer: parseInt(id),
            startsAt: slotStart.toISOString(),
            endsAt: slotEnd.toISOString(),
            qtyTotal: parseInt(qtyTotal),
            qtyRemaining: parseInt(qtyTotal),
            mode: mode || 'flash',
            state,
          }

          if (mode === 'drip') {
            slotData.dripEveryMinutes = parseInt(dripEveryMinutes) || 15
            slotData.dripQty = parseInt(dripQty) || 10
          }

          const slot = await payload.create({
            collection: 'offer-slots',
            data: slotData,
            draft: false,
          })

          createdSlots.push(slot)
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    return NextResponse.json({
      success: true,
      created: createdSlots.length,
      slots: createdSlots,
    })
  } catch (error: any) {
    console.error('Error creating bulk slots:', error)
    return NextResponse.json(
      {
        error: 'Failed to create bulk slots',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
