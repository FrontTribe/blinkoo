import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import configPromise from '@/payload.config'
import { OTP_STORAGE } from '../../otpStorage'

/**
 * POST /api/auth/otp/verify
 * Body: { phone: string, code: string }
 * Verifies OTP and creates/logs in user
 */
export async function POST(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })

  try {
    const body = await request.json()
    const { phone, code } = body

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 })
    }

    // Verify code
    const stored = OTP_STORAGE.get(phone)
    if (!stored || stored.code !== code || stored.expires < Date.now()) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    // Find or create user
    let user
    try {
      user = await payload.find({
        collection: 'users',
        where: { phone: { equals: phone } },
        limit: 1,
      })

      if (user.docs.length > 0) {
        user = user.docs[0]
      } else {
        // Create new user
        user = await payload.create({
          collection: 'users',
          data: {
            phone,
            phoneVerified: true,
            role: 'customer',
          },
        })
      }
    } catch (error) {
      console.error('Error finding/creating user:', error)
      return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 500 })
    }

    // Generate JWT token
    // In production, use proper JWT signing
    const token = `${user.id}:${Date.now()}`

    // Set secure cookie
    const cookieStore = await cookies()
    cookieStore.set('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    // Clean up OTP
    OTP_STORAGE.delete(phone)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
