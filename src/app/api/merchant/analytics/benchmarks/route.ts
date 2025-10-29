import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/merchant/analytics/benchmarks
 * Get industry benchmarks for merchant offers by category
 */
export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user || (user.role !== 'merchant_owner' && user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get merchant's offers
    const merchant = await payload.find({
      collection: 'merchants',
      where: {
        owner: { equals: user.id },
      },
      limit: 1,
    })

    if (merchant.docs.length === 0) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    const merchantId = merchant.docs[0].id

    // Get all venues for this merchant
    const venues = await payload.find({
      collection: 'venues',
      where: {
        merchant: { equals: merchantId },
      },
    })

    const venueIds = venues.docs.map((v: any) => v.id)

    if (venueIds.length === 0) {
      return NextResponse.json({
        benchmarks: {},
        merchantPerformance: [],
      })
    }

    // Get all offers for this merchant's venues
    const merchantOffers = await payload.find({
      collection: 'offers',
      where: {
        venue: { in: venueIds },
      },
      depth: 2,
    })

    // Get all claims for merchant's offers
    const allClaims = await payload.find({
      collection: 'claims',
      where: {
        venue: { in: venueIds },
      },
      limit: 1000,
    })

    // Calculate category-wise benchmarks
    const categoryBenchmarks: Record<string, any> = {}

    // Get all categories
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
    })

    for (const category of categories.docs) {
      // Get offers in this category (across all merchants)
      const categoryOffers = await payload.find({
        collection: 'offers',
        where: {
          category: { equals: category.id },
        },
      })

      if (categoryOffers.docs.length === 0) continue

      const categoryOfferIds = categoryOffers.docs.map((o: any) => o.id)

      // Get slots for these offers
      const categorySlots = await payload.find({
        collection: 'offer-slots',
        where: {
          offer: { in: categoryOfferIds },
        },
      })

      // Get claims for these slots
      const categoryClaims = await payload.find({
        collection: 'claims',
        where: {
          offer: { in: categoryOfferIds },
        },
        limit: 1000,
      })

      const totalCapacity = categorySlots.docs.reduce((sum, s) => sum + (s.qtyTotal || 0), 0)
      const totalClaimed = categorySlots.docs.reduce(
        (sum, s) => sum + (s.qtyTotal || 0) - (s.qtyRemaining || 0),
        0,
      )
      const totalRedeemed = categoryClaims.docs.filter((c: any) => c.status === 'REDEEMED').length

      const fillRate = totalCapacity > 0 ? (totalClaimed / totalCapacity) * 100 : 0
      const redemptionRate =
        categoryClaims.docs.length > 0 ? (totalRedeemed / categoryClaims.docs.length) * 100 : 0

      categoryBenchmarks[category.slug] = {
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
        avgFillRate: fillRate,
        avgRedemptionRate: redemptionRate,
        sampleSize: categoryOffers.docs.length,
      }
    }

    // Calculate merchant's performance vs benchmarks
    const merchantPerformance: Array<{
      category: string
      categoryName: string
      merchantRate: number
      benchmarkRate: number
      difference: number
      percentile: string
      badges: string[]
    }> = []

    for (const offer of merchantOffers.docs) {
      const category = (offer as any).category
      const categoryId = typeof category === 'object' ? category?.id : category

      if (!categoryId) continue

      const categoryDoc = categories.docs.find((c) => c.id === categoryId)
      if (!categoryDoc) continue

      // Get merchant's slots for this offer
      const merchantSlots = await payload.find({
        collection: 'offer-slots',
        where: {
          offer: { equals: offer.id },
        },
      })

      // Get merchant's claims for this offer
      const merchantClaims = await payload.find({
        collection: 'claims',
        where: {
          offer: { equals: offer.id },
        },
        limit: 1000,
      })

      const merchantCapacity = merchantSlots.docs.reduce((sum, s) => sum + (s.qtyTotal || 0), 0)
      const merchantClaimed = merchantSlots.docs.reduce(
        (sum, s) => sum + (s.qtyTotal || 0) - (s.qtyRemaining || 0),
        0,
      )
      const merchantRedeemed = merchantClaims.docs.filter(
        (c: any) => c.status === 'REDEEMED',
      ).length

      const merchantFillRate = merchantCapacity > 0 ? (merchantClaimed / merchantCapacity) * 100 : 0
      const merchantRedemptionRate =
        merchantClaims.docs.length > 0 ? (merchantRedeemed / merchantClaims.docs.length) * 100 : 0

      const benchmark = categoryBenchmarks[categoryDoc.slug]
      if (!benchmark) continue

      const fillDiff = merchantFillRate - benchmark.avgFillRate
      const redemptionDiff = merchantRedemptionRate - benchmark.avgRedemptionRate

      // Calculate percentile (rough estimate)
      const percentile =
        fillDiff > 20
          ? 'Top 10%'
          : fillDiff > 10
            ? 'Top 25%'
            : fillDiff > 0
              ? 'Top 50%'
              : 'Below Average'

      const badges: string[] = []
      if (fillDiff > 20) badges.push('Top Performer')
      if (redemptionDiff > 15) badges.push('High Conversion')
      if (fillDiff < -10) badges.push('Needs Improvement')

      merchantPerformance.push({
        category: categoryDoc.slug,
        categoryName: categoryDoc.name,
        merchantRate: merchantFillRate,
        benchmarkRate: benchmark.avgFillRate,
        difference: fillDiff,
        percentile,
        badges,
      })
    }

    return NextResponse.json({
      benchmarks: categoryBenchmarks,
      merchantPerformance,
    })
  } catch (error) {
    console.error('Error fetching benchmarks:', error)
    return NextResponse.json({ error: 'Failed to fetch benchmarks' }, { status: 500 })
  }
}
