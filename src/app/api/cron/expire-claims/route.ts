import { NextResponse } from 'next/server'
import { expireClaims } from '@/hooks/claims/expireClaims'

/**
 * GET /api/cron/expire-claims (Vercel Cron uses GET)
 * Cron endpoint to expire old claims
 * Protected by Vercel Cron or CRON_SECRET for manual triggers
 */
export async function GET(request: Request) {
  // Vercel Cron adds this header automatically
  const cronHeader = request.headers.get('x-vercel-cron')
  const authHeader = request.headers.get('authorization')

  // Allow if it's from Vercel Cron, or if it has the correct Bearer token
  const isVercelCron = cronHeader === '1'
  const hasValidToken = authHeader === `Bearer ${process.env.CRON_SECRET}`

  if (!isVercelCron && !hasValidToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await expireClaims()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in expire-claims cron:', error)
    return NextResponse.json({ error: 'Failed to expire claims' }, { status: 500 })
  }
}

// Keep POST for backward compatibility and manual triggers
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await expireClaims()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in expire-claims cron:', error)
    return NextResponse.json({ error: 'Failed to expire claims' }, { status: 500 })
  }
}
