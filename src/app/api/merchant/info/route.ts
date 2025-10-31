import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'
import { getMerchantWithKYC } from '@/utilities/checkMerchantKYC'

/**
 * GET /api/merchant/info
 * Get merchant information for the logged-in user
 * This endpoint does NOT require KYC approval (used for rejected/pending pages)
 */
export async function GET() {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get merchant without KYC requirement
    const merchant = await getMerchantWithKYC(payload, user.id)
    
    if (!merchant) {
      return NextResponse.json({ error: 'Merchant account not found' }, { status: 404 })
    }

    return NextResponse.json({ merchant })
  } catch (error) {
    console.error('Error fetching merchant info:', error)
    return NextResponse.json({ error: 'Failed to fetch merchant info' }, { status: 500 })
  }
}

