import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  try {
    const { slug } = await params

    // Track share event (optional - store in a Shares collection or analytics)
    // For now, we just log it
    console.log('Share tracked:', { offerId: slug, userId: user?.id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking share:', error)
    return NextResponse.json({ error: 'Failed to track share' }, { status: 500 })
  }
}
