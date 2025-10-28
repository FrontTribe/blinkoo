import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import twilio from 'twilio'
import configPromise from '@/payload.config'
import { OTP_STORAGE } from '../otpStorage'

export async function POST(request: Request) {
  try {
    const config = await configPromise
    const payload = await getPayload({ config })

    console.log('Verify phone - attempting to get user from auth')

    // Try to get user, but don't fail if not authenticated
    let user = null
    try {
      const authResult = await payload.auth({ headers: await getHeaders() })
      user = authResult.user
      console.log('User found:', user?.email, user?.phone)
    } catch (error: any) {
      console.error('Auth error:', error.message)
    }

    if (!user) {
      console.log('No user found in auth')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.phone) {
      return NextResponse.json(
        { error: 'No phone number associated with account' },
        { status: 400 },
      )
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Normalize phone number (remove spaces, dashes, handle leading zeros)
    const normalizedPhone = user.phone
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .replace(/^0/, '+385') // Convert Croatian leading 0 to country code
      .replace(/^(\d{9})$/, '+385$1') // Add country code if missing (9 digits without +)

    // Store OTP
    console.log(`Storing OTP for ${normalizedPhone} (original: ${user.phone}): ${code}`)
    OTP_STORAGE.set(normalizedPhone, { code, expires })
    console.log(`OTP_STORAGE now has ${OTP_STORAGE.size} entries`)
    console.log('Current keys:', Array.from(OTP_STORAGE.keys()))

    // Send SMS via Twilio if configured
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER

      // Only send SMS if To and From numbers are different
      if (user.phone !== twilioPhone) {
        try {
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

          await client.messages.create({
            body: `Your Off-Peak verification code is: ${code}. Valid for 10 minutes.`,
            to: user.phone,
            from: twilioPhone,
          })

          console.log(`SMS sent to ${user.phone} via Twilio`)
        } catch (smsError: any) {
          console.error('Twilio SMS error:', smsError.message)
          // Continue to development mode fallback
        }
      } else {
        console.log(`Cannot send SMS - To and From numbers are the same (${user.phone})`)
      }
    }

    // Development mode: always log the code
    console.log('════════════════════════════════════════')
    console.log(`📱 OTP for ${user.phone}`)
    console.log(`🔐 Verification Code: ${code}`)
    console.log(`⏰ Valid for 10 minutes`)
    console.log('════════════════════════════════════════')

    // Clean up old OTPs
    for (const [key, value] of OTP_STORAGE.entries()) {
      if (value.expires < Date.now()) {
        OTP_STORAGE.delete(key)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error sending OTP:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      {
        error: error.message || 'Failed to send OTP',
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
