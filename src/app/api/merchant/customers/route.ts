import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'
import { getMerchantWithKYC } from '@/utilities/checkMerchantKYC'

/**
 * GET /api/merchant/customers
 * Get all customers for merchant with statistics
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

  try {
    const { searchParams } = new URL(request.url)
    const segment = searchParams.get('segment')

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
      where: { venue: { in: venueIds } },
      depth: 1,
      limit: 100,
    })

    const offerIds = offers.docs.map((o) => o.id)

    // Get all claims for these offers
    const claims = await payload.find({
      collection: 'claims',
      where: {
        offer: { in: offerIds },
      },
      depth: 2,
      limit: 10000,
    })

    // Aggregate customer data
    const customerData: Record<string, any> = {}

    claims.docs.forEach((claim: any) => {
      const userId = typeof claim.user === 'string' ? claim.user : claim.user?.id
      if (!userId) return

      if (!customerData[userId]) {
        const userClaim = claim.user
        customerData[userId] = {
          id: userId,
          phone: typeof userClaim === 'object' ? userClaim.phone : '',
          email: typeof userClaim === 'object' ? userClaim.email : '',
          totalClaims: 0,
          redeemedClaims: 0,
          expiredClaims: 0,
          reservedClaims: 0,
          firstClaim: claim.reservedAt,
          lastClaim: claim.reservedAt,
          totalSpent: 0, // Placeholder
        }
      }

      customerData[userId].totalClaims++
      if (claim.status === 'REDEEMED') customerData[userId].redeemedClaims++
      if (claim.status === 'EXPIRED') customerData[userId].expiredClaims++
      if (claim.status === 'RESERVED') customerData[userId].reservedClaims++

      if (
        claim.reservedAt &&
        new Date(claim.reservedAt) > new Date(customerData[userId].lastClaim)
      ) {
        customerData[userId].lastClaim = claim.reservedAt
      }
      if (
        claim.reservedAt &&
        new Date(claim.reservedAt) < new Date(customerData[userId].firstClaim)
      ) {
        customerData[userId].firstClaim = claim.reservedAt
      }
    })

    let customers = Object.values(customerData)

    // Calculate date threshold for segmentation
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Apply segmentation
    if (segment) {
      switch (segment) {
        case 'new':
          customers = customers.filter((c: any) => new Date(c.firstClaim) >= thirtyDaysAgo)
          break
        case 'regular':
          customers = customers.filter(
            (c: any) => c.redeemedClaims >= 5 && new Date(c.lastClaim) >= thirtyDaysAgo,
          )
          break
        case 'vip':
          customers = customers.filter((c: any) => c.redeemedClaims >= 20)
          break
        case 'dormant':
          customers = customers.filter((c: any) => new Date(c.lastClaim) < thirtyDaysAgo)
          break
      }
    }

    // Sort by redeemed claims (most valuable first)
    customers.sort((a: any, b: any) => b.redeemedClaims - a.redeemedClaims)

    // Calculate customer lifetime value (simple calculation)
    customers.forEach((customer: any) => {
      customer.lifetimeValue = customer.redeemedClaims * 15 // Placeholder: $15 average spend per redemption
      customer.avgFrequency = customer.totalClaims > 0 ? Math.round(customer.totalClaims / 10) : 0 // Placeholder
      customer.segment =
        customer.redeemedClaims >= 20
          ? 'vip'
          : customer.redeemedClaims >= 5 && new Date(customer.lastClaim) >= thirtyDaysAgo
            ? 'regular'
            : new Date(customer.firstClaim) >= thirtyDaysAgo
              ? 'new'
              : 'dormant'
    })

    return NextResponse.json({
      customers,
      total: customers.length,
      summary: {
        new: customers.filter((c: any) => c.segment === 'new').length,
        regular: customers.filter((c: any) => c.segment === 'regular').length,
        vip: customers.filter((c: any) => c.segment === 'vip').length,
        dormant: customers.filter((c: any) => c.segment === 'dormant').length,
      },
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
