import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/web/offers/suggestions
 * Get personalized offer suggestions based on user history
 * Query params: ?offerId=xxx&userId=xxx&lat=xxx&lng=xxx&limit=4
 */
export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  const { searchParams } = new URL(request.url)
  const offerId = searchParams.get('offerId')
  const userId = searchParams.get('userId') || (user ? user.id : null)
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const limit = parseInt(searchParams.get('limit') || '4')

  try {
    if (!offerId) {
      return NextResponse.json({ error: 'offerId is required' }, { status: 400 })
    }

    const now = new Date()

    // Get the target offer to base suggestions on
    const targetOffer = await payload.findByID({
      collection: 'offers',
      id: offerId,
      depth: 2,
    })

    if (!targetOffer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    const offerData = targetOffer as any
    const categoryId =
      typeof offerData.category === 'object' ? offerData.category?.id : offerData.category
    const venueId = typeof offerData.venue === 'object' ? offerData.venue?.id : offerData.venue
    const venue = typeof offerData.venue === 'object' ? offerData.venue : null

    // Get user's past claims to personalize suggestions
    const userClaimedCategories: Set<string> = new Set()
    const userClaimedVenues: Set<string> = new Set()

    if (userId) {
      const userClaims = await payload.find({
        collection: 'claims',
        where: {
          user: { equals: userId },
          status: { equals: 'REDEEMED' },
        },
        depth: 2,
        limit: 50,
      })

      userClaims.docs.forEach((claim: any) => {
        const claimOffer = claim.offer
        if (claimOffer && typeof claimOffer === 'object') {
          if (claimOffer.category) {
            const catId =
              typeof claimOffer.category === 'object' ? claimOffer.category.id : claimOffer.category
            if (catId) userClaimedCategories.add(String(catId))
          }
          if (claimOffer.venue) {
            const venId =
              typeof claimOffer.venue === 'object' ? claimOffer.venue.id : claimOffer.venue
            if (venId) userClaimedVenues.add(String(venId))
          }
        }
      })
    }

    // Build query for live slots
    const slots = await payload.find({
      collection: 'offer-slots',
      where: {
        state: { equals: 'live' },
        qtyRemaining: { greater_than: 0 },
        startsAt: { less_than_equal: now.toISOString() },
        endsAt: { greater_than: now.toISOString() },
      },
      depth: 3,
      limit: 100,
    })

    // Filter and score suggestions
    const suggestions = slots.docs
      .map((slot) => {
        const offer = slot.offer as any
        if (!offer || offer.id === offerId) return null

        const offerCategory =
          typeof offer.category === 'object' ? offer.category?.id : offer.category
        const offerVenue = typeof offer.venue === 'object' ? offer.venue : null

        let score = 0
        const reasons: string[] = []

        // Same category - highest priority
        if (offerCategory && categoryId && String(offerCategory) === String(categoryId)) {
          score += 100
          reasons.push('Same category')
        }

        // Same venue - high priority
        if (offerVenue && venueId && offerVenue.id === venueId) {
          score += 80
          reasons.push('Same venue')
        }

        // User's favorite categories
        if (offerCategory && userClaimedCategories.has(String(offerCategory))) {
          score += 50
          reasons.push('You like this')
        }

        // Nearby venues (within 5km)
        if (venue?.lat && venue?.lng && offerVenue?.lat && offerVenue?.lng) {
          const distance = calculateDistance(venue.lat, venue.lng, offerVenue.lat, offerVenue.lng)
          if (distance <= 5) {
            score += 30
            reasons.push('Nearby')
          }
        }

        // Ending soon - boost
        const minutesRemaining = getMinutesRemaining(slot.endsAt)
        if (minutesRemaining < 60) {
          score += 20
          reasons.push('Ending soon')
        }

        // High discount - boost
        if (offer.type === 'percent' && offer.discountValue && offer.discountValue >= 30) {
          score += 15
        }

        return {
          slot: {
            id: slot.id,
            startsAt: slot.startsAt,
            endsAt: slot.endsAt,
            qtyRemaining: slot.qtyRemaining,
          },
          offer: {
            id: offer.id,
            title: offer.title,
            description: offer.description,
            type: offer.type,
            discountValue: offer.discountValue,
            photo: offer.photo,
          },
          venue: offerVenue
            ? {
                id: offerVenue.id,
                name: offerVenue.name,
                address: offerVenue.address,
                lat: offerVenue.lat,
                lng: offerVenue.lng,
              }
            : null,
          score,
          reasons,
        }
      })
      .filter((s: any) => s !== null && s.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit) as any[]

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function getMinutesRemaining(endsAt: string): number {
  const now = new Date()
  const end = new Date(endsAt)
  const diff = end.getTime() - now.getTime()
  return Math.floor(diff / 1000 / 60)
}
