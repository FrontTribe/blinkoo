import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { randomInt } from 'crypto'
import crypto from 'crypto'
import configPromise from '@/payload.config'

/**
 * POST /api/claims
 * Body: { slotId: string, lat?: number, lng?: number }
 */
export async function POST(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if phone is verified
  if (!user.phoneVerified) {
    return NextResponse.json({ error: 'Phone verification required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { slotId, lat, lng } = body

    if (!slotId) {
      return NextResponse.json({ error: 'slotId is required' }, { status: 400 })
    }

    // First try to fetch as slot ID
    let slotResult = null
    try {
      slotResult = await payload.findByID({
        collection: 'offer-slots',
        id: slotId,
        depth: 2,
      })
    } catch (error) {
      // If slot not found, try to fetch as offer ID and get the first live slot
      try {
        const offer = await payload.findByID({
          collection: 'offers',
          id: slotId,
          depth: 1,
        })

        if (offer) {
          const now = new Date()
          const slots = await payload.find({
            collection: 'offer-slots',
            where: {
              offer: { equals: offer.id },
              state: { equals: 'live' },
              qtyRemaining: { greater_than: 0 },
            },
            limit: 1,
            depth: 2,
          })

          if (slots.docs.length > 0) {
            slotResult = slots.docs[0]
          }
        }
      } catch (offerError) {
        console.error('Error fetching offer/slot:', offerError)
        return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
      }
    }

    if (!slotResult) {
      return NextResponse.json({ error: 'No available slot found for this offer' }, { status: 404 })
    }

    const slot = slotResult as any

    // Check if slot is live and has capacity
    const now = new Date()

    if (slot.state !== 'live') {
      return NextResponse.json({ error: 'Slot is not live' }, { status: 400 })
    }

    if (slot.qtyRemaining <= 0) {
      return NextResponse.json({ error: 'Slot is fully claimed' }, { status: 400 })
    }

    if (new Date(slot.endsAt) < now) {
      return NextResponse.json({ error: 'Slot has ended' }, { status: 400 })
    }

    if (new Date(slot.startsAt) > now) {
      return NextResponse.json({ error: 'Slot has not started yet' }, { status: 400 })
    }

    const offer = slot.offer

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Geofence enforcement
    const venue = offer.venue
    if (venue && typeof venue === 'object' && venue.lat && venue.lng && lat && lng) {
      const geofenceKm = offer.geofenceKm || 5 // Default 5km

      // Calculate distance using Haversine formula
      const R = 6371 // Earth's radius in km
      const dLat = ((venue.lat - lat) * Math.PI) / 180
      const dLng = ((venue.lng - lng) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((venue.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      if (distance > geofenceKm) {
        return NextResponse.json(
          {
            error: `You are outside the offer geofence (${distance.toFixed(2)}km away, limit: ${geofenceKm}km)`,
            distance: distance.toFixed(2),
            geofenceKm,
          },
          { status: 400 },
        )
      }
    }

    // Cooldown period enforcement
    if (offer.cooldownMinutes && offer.cooldownMinutes > 0) {
      const lastRedeemedClaim = await payload.find({
        collection: 'claims',
        where: {
          user: { equals: user.id },
          offer: { equals: offer.id },
          status: { equals: 'REDEEMED' },
        },
        sort: '-redeemedAt',
        limit: 1,
      })

      if (lastRedeemedClaim.docs.length > 0) {
        const lastRedeemed = lastRedeemedClaim.docs[0] as any
        if (lastRedeemed.redeemedAt) {
          const redeemedAt = new Date(lastRedeemed.redeemedAt)
          const timeSinceRedeemed = (now.getTime() - redeemedAt.getTime()) / 1000 / 60 // minutes

          if (timeSinceRedeemed < offer.cooldownMinutes) {
            const timeRemaining = Math.ceil(offer.cooldownMinutes - timeSinceRedeemed)
            return NextResponse.json(
              {
                error: `Cooldown period active. Please wait ${timeRemaining} more minute(s) before claiming again.`,
                timeRemaining,
              },
              { status: 400 },
            )
          }
        }
      }
    }

    // Check user limits
    const userClaims = await payload.find({
      collection: 'claims',
      where: {
        user: { equals: user.id },
        offer: { equals: offer.id },
        status: { in: ['RESERVED', 'REDEEMED'] },
      },
    })

    if (userClaims.docs.length >= (offer.perUserLimit || 1)) {
      return NextResponse.json({ error: 'User limit reached for this offer' }, { status: 400 })
    }

    // Atomic claim - decrement quantity and create claim
    const CLAIM_TTL_MINUTES = 7
    const expiresAt = new Date(now.getTime() + CLAIM_TTL_MINUTES * 60 * 1000)

    // Get the actual slot ID from the slot result
    const actualSlotId = slotResult.id

    // Update slot remaining quantity using the actual slot ID
    const updatedSlot = await payload.update({
      collection: 'offer-slots',
      id: actualSlotId,
      data: {
        qtyRemaining: (slot.qtyRemaining || 0) - 1,
      },
    })

    if ((updatedSlot as any).qtyRemaining < 0) {
      return NextResponse.json({ error: 'Slot is fully claimed' }, { status: 400 })
    }

    // Generate QR token and 6-digit code
    const qrToken = crypto.randomBytes(32).toString('hex')
    const sixCode = String(randomInt(100000, 999999))

    // Create the claim
    const claim = await payload.create({
      collection: 'claims',
      data: {
        user: user.id as any,
        offer: offer.id as any,
        slot: actualSlotId as any,
        status: 'RESERVED',
        reservedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        qrToken,
        sixCode,
      },
    })

    // Fetch full offer data with venue for return
    const fullOffer = await payload.findByID({
      collection: 'offers',
      id: offer.id,
      depth: 2,
    })

    return NextResponse.json({
      claim: {
        id: claim.id,
        qrToken: claim.qrToken,
        sixCode: claim.sixCode,
        expiresAt: claim.expiresAt,
        status: claim.status,
      },
      slot: {
        id: updatedSlot.id,
        qtyRemaining: (updatedSlot as any).qtyRemaining,
      },
      offer: fullOffer,
      venue: fullOffer?.venue,
    })
  } catch (error) {
    console.error('Error creating claim:', error)
    return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 })
  }
}
