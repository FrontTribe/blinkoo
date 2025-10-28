import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const config = await configPromise
    const payload = await getPayload({ config })
    const body = await req.json()

    const { businessName, ownerName, email, password, phone } = body

    if (!businessName || !ownerName || !email || !password || !phone) {
      return NextResponse.json(
        { errors: [{ message: 'All fields are required' }] },
        { status: 400 },
      )
    }

    // Create the user first
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name: ownerName,
        phone,
        role: 'merchant_owner',
      },
    })

    // Create the merchant record
    const merchant = await payload.create({
      collection: 'merchants',
      data: {
        owner: user.id,
        name: businessName,
        kycStatus: 'pending',
      },
    })

    // Return user and merchant info
    return NextResponse.json(
      {
        user,
        merchant,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Merchant signup error:', error)
    return NextResponse.json(
      { errors: [{ message: error.message || 'Failed to create merchant account' }] },
      { status: 400 },
    )
  }
}
