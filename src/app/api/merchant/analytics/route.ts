import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'
import { getMerchantWithKYC } from '@/utilities/checkMerchantKYC'

/**
 * GET /api/merchant/analytics
 * Get comprehensive analytics for merchant
 * Query params: startDate, endDate
 */
export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check KYC approval
  const merchant = await getMerchantWithKYC(payload, user.id)
  if (!merchant || merchant.kycStatus !== 'approved') {
    return NextResponse.json({ error: 'Account not approved' }, { status: 403 })
  }

  // Get date range from query params
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  try {
    // Get merchant's venues
    const venues = await payload.find({
      collection: 'venues',
      where: { merchant: { equals: merchant.id } },
      limit: 100,
    })

    const venueIds = venues.docs.map((v) => v.id)

    // Get offers for these venues
    const offers = await payload.find({
      collection: 'offers',
      where: {
        venue: { in: venueIds },
      },
      depth: 1,
      limit: 100,
    })

    const offerIds = offers.docs.map((o) => o.id)

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.greater_than_equal = startDate
    }
    if (endDate) {
      dateFilter.less_than_equal = endDate
    }

    // Get all offer slots for these offers (for fill rate calculation)
    const slots = await payload.find({
      collection: 'offer-slots',
      where: {
        offer: { in: offerIds },
      },
      limit: 1000,
    })

    // Get all claims with date filter
    const whereClause: any = {
      offer: { in: offerIds },
    }

    if (Object.keys(dateFilter).length > 0) {
      whereClause.reservedAt = dateFilter
    }

    const claims = await payload.find({
      collection: 'claims',
      where: whereClause,
      depth: 3, // Increased depth to get more relationship data
      limit: 1000,
    })

    // Calculate metrics
    const totalClaims = claims.docs.length
    const redeemedClaims = claims.docs.filter((c: any) => c.status === 'REDEEMED').length
    const expiredClaims = claims.docs.filter((c: any) => c.status === 'EXPIRED').length
    const reservedClaims = claims.docs.filter((c: any) => c.status === 'RESERVED').length

    // Revenue (estimated from redeemed claims)
    let totalRevenue = 0
    for (const claim of claims.docs) {
      if ((claim as any).status === 'REDEEMED' && (claim as any).offer) {
        const offer = (claim as any).offer
        if (offer.type === 'fixed') {
          totalRevenue += offer.discountValue || 0
        } else if (offer.type === 'percent') {
          // Estimate revenue (would need item price data)
          totalRevenue += 10 // placeholder
        }
      }
    }

    // Popular time slots
    const timeSlotCounts: Record<string, number> = {}
    claims.docs.forEach((claim: any) => {
      if (claim.slot && claim.reservedAt) {
        const date = new Date(claim.reservedAt)
        const hour = date.getHours()
        const slotKey = `${hour}:00`
        timeSlotCounts[slotKey] = (timeSlotCounts[slotKey] || 0) + 1
      }
    })

    const popularSlots = Object.entries(timeSlotCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([time, count]) => ({ time, count }))

    // Top performing offers
    const offerCounts: Record<string, { id: string; title: string; count: number }> = {}
    claims.docs.forEach((claim: any) => {
      if (claim.offer) {
        const offerId = typeof claim.offer === 'string' ? claim.offer : claim.offer.id
        const offerTitle = typeof claim.offer === 'object' ? claim.offer.title : 'Unknown'
        if (!offerCounts[offerId]) {
          offerCounts[offerId] = { id: offerId, title: offerTitle, count: 0 }
        }
        offerCounts[offerId].count++
      }
    })

    const topOffers = Object.values(offerCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Redemption rate
    const redemptionRate = totalClaims > 0 ? ((redeemedClaims / totalClaims) * 100).toFixed(1) : '0'

    // Fill rate calculation (claimed / total capacity)
    let totalCapacity = 0
    let claimedCount = 0
    slots.docs.forEach((slot: any) => {
      totalCapacity += slot.qtyTotal || 0
      claimedCount += (slot.qtyTotal || 0) - (slot.qtyRemaining || 0)
    })
    const fillRate = totalCapacity > 0 ? ((claimedCount / totalCapacity) * 100).toFixed(1) : '0'

    // Average time to redemption (for redeemed claims)
    let totalTimeToRedemption = 0
    let timeToRedemptionCount = 0
    claims.docs.forEach((claim: any) => {
      if (claim.status === 'REDEEMED' && claim.reservedAt && claim.redeemedAt) {
        const reservedAt = new Date(claim.reservedAt)
        const redeemedAt = new Date(claim.redeemedAt)
        const minutes = (redeemedAt.getTime() - reservedAt.getTime()) / 1000 / 60
        totalTimeToRedemption += minutes
        timeToRedemptionCount++
      }
    })
    const avgTimeToRedemption =
      timeToRedemptionCount > 0 ? Math.round(totalTimeToRedemption / timeToRedemptionCount) : 0

    // Repeat customer rate
    const userIdsWithRedemptions = new Set<string>()
    claims.docs.forEach((claim: any) => {
      if (claim.status === 'REDEEMED' && claim.user) {
        const userId = typeof claim.user === 'string' ? claim.user : claim.user.id
        if (userId) userIdsWithRedemptions.add(userId)
      }
    })

    const userIdsWithMultipleRedemptions = new Set<string>()
    const userRedemptionCounts: Record<string, number> = {}
    claims.docs.forEach((claim: any) => {
      if (claim.status === 'REDEEMED' && claim.user) {
        const userId = typeof claim.user === 'string' ? claim.user : claim.user.id
        if (userId) {
          userRedemptionCounts[userId] = (userRedemptionCounts[userId] || 0) + 1
          if (userRedemptionCounts[userId] > 1) {
            userIdsWithMultipleRedemptions.add(userId)
          }
        }
      }
    })

    const repeatCustomerRate =
      userIdsWithRedemptions.size > 0
        ? ((userIdsWithMultipleRedemptions.size / userIdsWithRedemptions.size) * 100).toFixed(1)
        : '0'

    // Category performance
    const categoryStats: Record<
      string,
      { name: string; claims: number; redemptions: number; fillRate: number }
    > = {}

    offers.docs.forEach((offer: any) => {
      if (offer.category) {
        const catId = typeof offer.category === 'string' ? offer.category : offer.category.id
        const catName =
          typeof offer.category === 'object' && offer.category.name
            ? offer.category.name
            : 'Uncategorized'

        if (!categoryStats[catId]) {
          categoryStats[catId] = { name: catName, claims: 0, redemptions: 0, fillRate: 0 }
        }
      }
    })

    claims.docs.forEach((claim: any) => {
      if (claim.offer && typeof claim.offer === 'object' && claim.offer.category) {
        const catId =
          typeof claim.offer.category === 'string' ? claim.offer.category : claim.offer.category.id

        if (categoryStats[catId]) {
          categoryStats[catId].claims++
          if (claim.status === 'REDEEMED') {
            categoryStats[catId].redemptions++
          }
        }
      }
    })

    // Calculate category fill rates from slots
    slots.docs.forEach((slot: any) => {
      if (slot.offer && typeof slot.offer === 'object' && slot.offer.category) {
        const catId =
          typeof slot.offer.category === 'string' ? slot.offer.category : slot.offer.category.id

        if (categoryStats[catId]) {
          const claimed = (slot.qtyTotal || 0) - (slot.qtyRemaining || 0)
          categoryStats[catId].fillRate += claimed
        }
      }
    })

    // Convert category stats to array and calculate percentages
    const categoryPerformance = Object.entries(categoryStats)
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        claims: stats.claims,
        redemptions: stats.redemptions,
        redemptionRate:
          stats.claims > 0 ? ((stats.redemptions / stats.claims) * 100).toFixed(1) : '0',
        fillRate: stats.fillRate,
      }))
      .sort((a, b) => b.claims - a.claims)
      .slice(0, 10)

    // Per-offer fill rate
    const offerFillRates = offers.docs.map((offer: any) => {
      const offerSlots = slots.docs.filter((s: any) => {
        const slotOfferId = typeof s.offer === 'string' ? s.offer : s.offer?.id
        return slotOfferId === offer.id
      })

      let capacity = 0
      let claimed = 0
      offerSlots.forEach((slot: any) => {
        capacity += slot.qtyTotal || 0
        claimed += (slot.qtyTotal || 0) - (slot.qtyRemaining || 0)
      })

      return {
        id: offer.id,
        title: offer.title,
        fillRate: capacity > 0 ? ((claimed / capacity) * 100).toFixed(1) : '0',
        capacity,
        claimed,
      }
    })

    // Uplift calculation (placeholder - would need baseline hour data)
    // For MVP, we'll estimate uplift as redeemed claims divided by avg baseline
    const avgBaselineFootTraffic = 10 // Placeholder - would come from historical data
    const uplift =
      redeemedClaims > 0
        ? (
            ((redeemedClaims / Object.keys(timeSlotCounts).length - avgBaselineFootTraffic) /
              avgBaselineFootTraffic) *
            100
          ).toFixed(1)
        : '0'

    return NextResponse.json({
      totalOffers: offers.docs.length,
      totalClaims,
      redeemedClaims,
      expiredClaims,
      reservedClaims,
      totalRevenue,
      redemptionRate: `${redemptionRate}%`,
      fillRate: `${fillRate}%`,
      avgTimeToRedemption: `${avgTimeToRedemption} min`,
      repeatCustomerRate: `${repeatCustomerRate}%`,
      uplift: `${uplift}%`,
      popularSlots,
      topOffers,
      categoryPerformance,
      offerFillRates: offerFillRates
        .sort((a, b) => parseFloat(b.fillRate) - parseFloat(a.fillRate))
        .slice(0, 10),
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
