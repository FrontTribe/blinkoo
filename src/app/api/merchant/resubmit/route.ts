import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'
import { getMerchantWithKYC } from '@/utilities/checkMerchantKYC'

export async function POST(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, notes } = body

    if (!name) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    // Get merchant
    const merchant = await getMerchantWithKYC(payload, user.id)
    if (!merchant) {
      return NextResponse.json({ error: 'Merchant account not found' }, { status: 404 })
    }

    // Only allow resubmission if current status is rejected
    if (merchant.kycStatus !== 'rejected') {
      return NextResponse.json(
        { error: 'Account is not in rejected status' },
        { status: 400 },
      )
    }

    // Update merchant information
    const updatedMerchant = await payload.update({
      collection: 'merchants',
      id: merchant.id,
      data: {
        name,
        description: description || '',
        resubmissionNotes: notes || '',
        kycStatus: 'pending',
        // Clear rejection fields
        rejectionReason: null,
        rejectionDate: null,
      },
    })

    return NextResponse.json({
      success: true,
      merchant: updatedMerchant,
    })
  } catch (error: any) {
    console.error('Error resubmitting merchant:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to resubmit merchant account' },
      { status: 500 },
    )
  }
}

