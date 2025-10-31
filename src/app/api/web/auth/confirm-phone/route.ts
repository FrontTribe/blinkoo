import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { OTP_STORAGE } from '../otpStorage'
import configPromise from '@/payload.config'

export async function POST(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { code } = body

    console.log('Confirm phone - received code:', code)
    console.log('User phone:', user.phone)
    console.log('OTP_STORAGE keys:', Array.from(OTP_STORAGE.keys()))

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    // Normalize phone number (same as verify-phone)
    const normalizedPhone = user.phone
      ? user.phone
          .replace(/\s+/g, '')
          .replace(/-/g, '')
          .replace(/^0/, '+385') // Convert Croatian leading 0 to country code
          .replace(/^(\d{9})$/, '+385$1') // Add country code if missing (9 digits without +)
      : ''

    // Verify OTP
    console.log('OTP_STORAGE size:', OTP_STORAGE.size)
    console.log('Looking for OTP with key:', normalizedPhone, '(original:', user.phone, ')')

    const stored = OTP_STORAGE.get(normalizedPhone)
    console.log('Stored OTP:', stored)

    // Try checking all keys
    console.log('All OTP_STORAGE entries:')
    for (const [key, value] of OTP_STORAGE.entries()) {
      console.log(`  ${key}: ${value.code} (expires at ${value.expires})`)
    }

    if (!stored) {
      console.log('No OTP found in storage')
      return NextResponse.json({ error: 'Invalid or expired code - not found' }, { status: 400 })
    }

    if (stored.code !== code) {
      console.log(`Code mismatch - expected: ${stored.code}, received: ${code}`)
      return NextResponse.json({ error: 'Invalid or expired code - mismatch' }, { status: 400 })
    }

    if (stored.expires < Date.now()) {
      console.log(`Code expired - expires: ${stored.expires}, now: ${Date.now()}`)
      return NextResponse.json({ error: 'Invalid or expired code - expired' }, { status: 400 })
    }

    // Update user to mark phone as verified
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        phoneVerified: true,
      },
    })

    // Clean up OTP
    OTP_STORAGE.delete(user.phone || '')

    // Return user data for redirect
    return NextResponse.json({ 
      success: true,
      user: {
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Error verifying phone:', error)
    return NextResponse.json({ error: 'Failed to verify phone' }, { status: 500 })
  }
}
