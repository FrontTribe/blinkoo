import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })

  try {
    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since')

    if (!since) {
      return NextResponse.json({ error: 'since parameter required' }, { status: 400 })
    }

    const sinceDate = new Date(since)
    const now = new Date()

    // Find slots that have changed since the given date
    // This is a simplified version - in production, you'd want more sophisticated change tracking
    const recentSlots = await payload.find({
      collection: 'offer-slots',
      where: {
        or: [
          {
            updatedAt: {
              greater_than: sinceDate.toISOString(),
            },
          },
          {
            createdAt: {
              greater_than: sinceDate.toISOString(),
            },
          },
        ],
        state: {
          in: ['live', 'scheduled'],
        },
      },
      limit: 100,
    })

    const updates = recentSlots.docs.map((slot: any) => {
      const endsAt = new Date(slot.endsAt)
      const minutesUntilEnd = Math.floor((endsAt.getTime() - now.getTime()) / 1000 / 60)

      return {
        slotId: slot.id,
        qtyRemaining: slot.qtyRemaining,
        state: slot.state,
        isEndingSoon: minutesUntilEnd <= 15 && minutesUntilEnd > 0,
      }
    })

    return NextResponse.json({ updates })
  } catch (error: any) {
    console.error('Error fetching offer updates:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch updates' }, { status: 500 })
  }
}
