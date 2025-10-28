import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import crypto from 'crypto'
import configPromise from '@/payload.config'
import { OTP_STORAGE } from '../../otpStorage'

/**
 * POST /api/auth/otp/start
 * Body: { phone: string }
 * Initiates OTP flow by generating and sending (in production) a code
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString()
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store code temporarily
    OTP_STORAGE.set(phone, { code, expires })

    // In production, send SMS via Twilio, AWS SNS, etc.
    console.log(`OTP for ${phone}: ${code}`)

    // Clean up old OTPs
    for (const [key, value] of OTP_STORAGE.entries()) {
      if (value.expires < Date.now()) {
        OTP_STORAGE.delete(key)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent (in production, this would send SMS)',
      // In production, don't send the code
      debugCode: process.env.NODE_ENV === 'development' ? code : undefined,
    })
  } catch (error) {
    console.error('Error starting OTP:', error)
    return NextResponse.json({ error: 'Failed to start OTP' }, { status: 500 })
  }
}
