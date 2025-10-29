import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { checkRole } from '@/access/checkRole'
import configPromise from '@/payload.config'

/**
 * GET /api/web/offers
 * Public endpoint for fetching live offers for the web app
 * Query parameters:
 * - lat: latitude
 * - lng: longitude
 * - radius: radius in km (default: 10)
 * - filter: 'live' | 'soon'
 * - category: category slug filter
 * - venueId: filter by specific venue
 * - distance: max distance in km (alternative to radius)
 * - timeFilter: 'ending-soon' (< 1hr) | 'all-day'
 * - discountTypes: comma-separated string of discount types (percent,fixed,bogo,addon)
 * - sortBy: 'nearest' | 'ending-soon' | 'newest' | 'best-discount' | 'popular'
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const radius = parseFloat(searchParams.get('radius') || searchParams.get('distance') || '10')
  const filter = searchParams.get('filter') || 'live'
  const category = searchParams.get('category')
  const venueId = searchParams.get('venueId')
  const timeFilter = searchParams.get('timeFilter') as 'ending-soon' | 'all-day' | null
  const discountTypes = searchParams.get('discountTypes')?.split(',') || []
  const sortBy =
    (searchParams.get('sortBy') as
      | 'nearest'
      | 'ending-soon'
      | 'newest'
      | 'best-discount'
      | 'popular') || 'nearest'

  console.log('API filters received:', {
    lat,
    lng,
    radius,
    category,
    timeFilter,
    discountTypes,
    sortBy,
  })

  const config = await configPromise
  const payload = await getPayload({ config })
  // const headers = await getHeaders()
  const { user } = await payload.auth({ headers: await getHeaders() })

  try {
    const now = new Date()

    // Build the query for live slots
    const slotsQuery = {
      state: { equals: 'live' },
      qtyRemaining: { greater_than: 0 },
      startsAt: { less_than_equal: now.toISOString() },
      endsAt: { greater_than: now.toISOString() },
    }

    if (filter === 'soon') {
      slotsQuery.startsAt = {
        greater_than: now.toISOString(),
        less_than_equal: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), // Next hour
      } as any
      slotsQuery.state = { equals: 'scheduled' } as any
    }

    const slots = await payload.find({
      collection: 'offer-slots',
      where: slotsQuery,
      depth: 3, // Increase depth to get offer -> category
      overrideAccess: true, // Ensure we get all fields including category
    })

    // Filter offers by category if specified
    if (category) {
      // First find category by slug
      const categoryResult = await payload.find({
        collection: 'categories',
        where: {
          slug: { equals: category },
        },
        limit: 1,
      })

      if (categoryResult.docs.length > 0) {
        const foundCategory = categoryResult.docs[0]
        const categoryId = foundCategory.id
        console.log(
          `Found category: ${foundCategory.name} (slug: ${foundCategory.slug}) ID: ${categoryId}`,
        )

        // Filter slots by offer category
        slots.docs = slots.docs.filter((slot) => {
          if (typeof slot.offer === 'object' && slot.offer !== null && 'category' in slot.offer) {
            const offerCategory = slot.offer.category
            let offerCategoryId: string | number | undefined
            if (typeof offerCategory === 'string' || typeof offerCategory === 'number') {
              offerCategoryId = offerCategory
            } else if (
              offerCategory &&
              typeof offerCategory === 'object' &&
              'id' in offerCategory
            ) {
              offerCategoryId = offerCategory.id
            }
            return offerCategoryId === categoryId
          }
          return false
        })

        console.log(`Filtered to ${slots.docs.length} slots matching category "${category}"`)
      } else {
        console.log(`Category with slug '${category}' not found in database`)
        slots.docs = []
      }
    }

    // Get associated offers and venues
    const venueIds = new Set<string>()
    const offers = new Map()

    for (const slot of slots.docs) {
      if (typeof slot.offer === 'object' && slot.offer !== null) {
        offers.set(slot.offer.id, slot.offer)

        if (typeof slot.offer.venue === 'object' && slot.offer.venue !== null) {
          const venueId = slot.offer.venue.id
          venueIds.add(String(venueId))
        }
      }
    }

    // Fetch venues with location
    const venues = await payload.find({
      collection: 'venues',
      where: {
        ...(venueId ? { id: { equals: venueId } } : {}),
        ...(venueIds.size > 0 ? { id: { in: Array.from(venueIds) } } : {}),
        status: { equals: 'active' },
      },
      depth: 1,
    })

    console.log(
      `Found ${venues.docs.length} venues after filtering (category: ${category || 'none'})`,
    )

    // Filter venues by distance if location provided
    let filteredVenues = venues.docs

    if (lat !== 0 && lng !== 0) {
      filteredVenues = venues.docs.filter((venue) => {
        const venueLat = venue.lat
        const venueLng = venue.lng

        if (!venueLat || !venueLng) return false

        // Calculate distance using Haversine formula
        const R = 6371 // Earth's radius in km
        const dLat = ((venueLat - lat) * Math.PI) / 180
        const dLng = ((venueLng - lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((venueLat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        return distance <= radius
      })
    }

    // Helper function to calculate distance
    const calculateDistance = (venueLat: number, venueLng: number): number => {
      const R = 6371
      const dLat = ((venueLat - lat) * Math.PI) / 180
      const dLng = ((venueLng - lng) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((venueLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    // Helper function to calculate minutes remaining
    const getMinutesRemaining = (endsAt: string): number => {
      const now = new Date()
      const end = new Date(endsAt)
      const diff = end.getTime() - now.getTime()
      return Math.floor(diff / 1000 / 60)
    }

    // Combine data with remaining quantity
    let results = slots.docs
      .map((slot) => {
        if (typeof slot.offer === 'object' && slot.offer !== null) {
          const offer = slot.offer as any
          const venue = offer.venue

          if (!venue || typeof venue !== 'object') return null

          // Check if venue is in filtered results
          const venueInRadius = filteredVenues.some((v) => v.id === venue.id)

          if (!venueInRadius) return null

          // Calculate distance
          let distance = null
          if (lat !== 0 && lng !== 0 && venue.lat && venue.lng) {
            distance = calculateDistance(venue.lat, venue.lng)
          }

          // Filter by discount type
          if (discountTypes.length > 0 && !discountTypes.includes(offer.type)) {
            return null
          }

          // Filter by time remaining
          const minutesRemaining = getMinutesRemaining(slot.endsAt)
          if (timeFilter === 'ending-soon' && minutesRemaining >= 60) {
            return null
          } else if (timeFilter === 'all-day' && minutesRemaining < 60) {
            return null
          }

          return {
            slot: {
              id: slot.id,
              startsAt: slot.startsAt,
              endsAt: slot.endsAt,
              qtyTotal: slot.qtyTotal,
              qtyRemaining: slot.qtyRemaining,
              mode: slot.mode,
              state: slot.state,
            },
            offer: {
              id: offer.id,
              title: offer.title,
              description: offer.description,
              type: offer.type,
              discountValue: offer.discountValue,
              photo: offer.photo,
              terms: offer.terms,
            },
            venue: {
              id: venue.id,
              name: venue.name,
              address: venue.address,
              lat: venue.lat,
              lng: venue.lng,
              distance,
              category:
                typeof venue.category === 'object' && venue.category !== null
                  ? {
                      id: venue.category.id,
                      name: venue.category.name,
                      slug: venue.category.slug,
                      icon: venue.category.icon,
                    }
                  : undefined,
            },
            _popularityScore: 0, // Will be calculated below
          }
        }
        return null
      })
      .filter((item) => item !== null) as any[]

    // Calculate popularity scores
    for (const result of results) {
      const claimCount = await payload.count({
        collection: 'claims',
        where: {
          offer: { equals: result.offer.id },
          status: { in: ['REDEEMED', 'RESERVED'] },
        },
      })

      // Popularity = claims per hour (normalized)
      const hoursActive =
        (new Date(result.slot.endsAt).getTime() - new Date(result.slot.startsAt).getTime()) /
        (1000 * 60 * 60)
      result._popularityScore =
        hoursActive > 0 ? claimCount.totalDocs / Math.max(hoursActive, 1) : 0
    }

    // Sort results
    results = results.sort((a, b) => {
      switch (sortBy) {
        case 'nearest':
          const distA = a.venue.distance ?? Infinity
          const distB = b.venue.distance ?? Infinity
          return distA - distB
        case 'ending-soon':
          return getMinutesRemaining(a.slot.endsAt) - getMinutesRemaining(b.slot.endsAt)
        case 'newest':
          return new Date(b.slot.startsAt).getTime() - new Date(a.slot.startsAt).getTime()
        case 'best-discount':
          const valueA = a.offer.type === 'percent' ? a.offer.discountValue : 0
          const valueB = b.offer.type === 'percent' ? b.offer.discountValue : 0
          return valueB - valueA
        case 'popular':
          return (b._popularityScore || 0) - (a._popularityScore || 0)
        default:
          return 0
      }
    })

    // Remove temporary popularity score before returning
    const cleanedResults = results.map(({ _popularityScore, ...rest }) => rest)

    return NextResponse.json({
      results: cleanedResults,
      total: cleanedResults.length,
    })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 })
  }
}
