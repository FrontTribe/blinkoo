import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'
import { getMerchantWithKYC } from '@/utilities/checkMerchantKYC'

/**
 * GET /api/merchant/claims
 * Get all claims for merchant with filtering
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
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const offerId = searchParams.get('offerId')

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

    // Build where clause
    const whereClause: any = {
      offer: { in: offerIds },
    }

    if (status) {
      whereClause.status = { equals: status }
    }

    if (offerId) {
      whereClause.offer = { equals: parseInt(offerId) }
    }

    if (startDate && endDate) {
      whereClause.reservedAt = {
        greater_than_equal: startDate,
        less_than_equal: endDate,
      }
    }

    const claims = await payload.find({
      collection: 'claims',
      where: whereClause,
      depth: 3,
      sort: '-reservedAt',
      limit: 500,
    })

    // Filter by search term if provided
    let filteredClaims = claims.docs

    if (search) {
      const searchLower = search.toLowerCase()
      filteredClaims = claims.docs.filter((claim: any) => {
        const offer = claim.offer
        const userClaim = claim.user
        const offerTitle = typeof offer === 'object' ? offer.title : ''
        const userName = typeof userClaim === 'object' ? userClaim.phone || userClaim.email : ''
        const claimId = claim.id.toString()

        return (
          offerTitle.toLowerCase().includes(searchLower) ||
          userName.toLowerCase().includes(searchLower) ||
          claimId.includes(searchLower)
        )
      })
    }

    // Calculate summary stats
    const summary = {
      total: filteredClaims.length,
      reserved: filteredClaims.filter((c: any) => c.status === 'RESERVED').length,
      redeemed: filteredClaims.filter((c: any) => c.status === 'REDEEMED').length,
      expired: filteredClaims.filter((c: any) => c.status === 'EXPIRED').length,
    }

    return NextResponse.json({
      claims: filteredClaims,
      summary,
      totalOffers: offers.docs.length,
    })
  } catch (error) {
    console.error('Error fetching claims:', error)
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}

/**
 * PATCH /api/merchant/claims
 * Update claim status
 */
export async function PATCH(request: Request) {
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
    const body = await request.json()
    const { claimId, status } = body

    // Verify claim belongs to merchant
    const claim = await payload.findByID({
      collection: 'claims',
      id: parseInt(claimId),
      depth: 3,
    })

    const offer =
      typeof claim.offer === 'object'
        ? claim.offer
        : await payload.findByID({
            collection: 'offers',
            id: typeof claim.offer === 'number' ? claim.offer : parseInt(claim.offer as string),
          })

    const venue =
      typeof (offer as any).venue === 'object'
        ? (offer as any).venue
        : await payload.findByID({
            collection: 'venues',
            id:
              typeof (offer as any).venue === 'number'
                ? (offer as any).venue
                : parseInt((offer as any).venue as string),
          })

    if ((venue as any).merchant !== merchant.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update claim
    const updatedClaim = await payload.update({
      collection: 'claims',
      id: parseInt(claimId),
      data: {
        status,
        ...(status === 'REDEEMED' ? { redeemedAt: new Date().toISOString() } : {}),
      },
    })

    return NextResponse.json({ claim: updatedClaim })
  } catch (error: any) {
    console.error('Error updating claim:', error)
    return NextResponse.json(
      {
        error: 'Failed to update claim',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
