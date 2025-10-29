import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

/**
 * POST /api/users/forgot-password
 * Body: { email: string }
 * Sends a password reset email to the user
 */
export async function POST(request: Request) {
  try {
    const config = await configPromise
    const payload = await getPayload({ config })

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    // Always return success (security best practice - don't reveal if email exists)
    const response = {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    }

    if (users.docs.length > 0) {
      const user = users.docs[0]

      // Generate a reset token
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token in user document
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpiration: expiresAt.toISOString(),
        },
      })

      // In production, send email with reset link
      const resetUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

      console.log('════════════════════════════════════════')
      console.log(`📧 Password Reset for ${email}`)
      console.log(`🔗 Reset URL: ${resetUrl}`)
      console.log(`⏰ Expires: ${expiresAt.toISOString()}`)
      console.log('════════════════════════════════════════')

      // In production, send actual email via SendGrid, AWS SES, etc.
      // await sendPasswordResetEmail(email, resetUrl)
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error in forgot password:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

