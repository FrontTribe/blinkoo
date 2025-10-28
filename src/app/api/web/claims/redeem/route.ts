import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * POST /api/claims/redeem
 * Body: { code: string } or { qrToken: string }
 * Staff-only endpoint for redeeming claims
 */
export async function POST(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  // const headers = await getHeaders()
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is staff or admin
  if (user.role !== 'admin' && user.role !== 'merchant_owner' && user.role !== 'staff') {
    return NextResponse.json({ error: 'Unauthorized - staff only' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { code, qrToken } = body

    if (!code && !qrToken) {
      return NextResponse.json({ error: 'code or qrToken is required' }, { status: 400 })
    }

    // Find claim by code or QR token
    const claims = await payload.find({
      collection: 'claims',
      where: {
        ...(code ? { sixCode: { equals: code } } : {}),
        ...(qrToken ? { qrToken: { equals: qrToken } } : {}),
        status: { equals: 'RESERVED' },
      },
      limit: 1,
    })

    if (claims.docs.length === 0) {
      return NextResponse.json({ error: 'Claim not found or already redeemed' }, { status: 404 })
    }

    const claim = claims.docs[0] as any

    // Check if claim has expired
    if (new Date(claim.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Claim has expired' }, { status: 400 })
    }

    // Update claim to redeemed
    const redeemedClaim = await payload.update({
      collection: 'claims',
      id: claim.id,
      data: {
        status: 'REDEEMED',
        redeemedAt: new Date().toISOString(),
        staff: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      claim: redeemedClaim,
    })
  } catch (error) {
    console.error('Error redeeming claim:', error)
    return NextResponse.json({ error: 'Failed to redeem claim' }, { status: 500 })
  }
}

