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
    const body = await request.json().catch(() => ({}))

    // Track share event in Shares collection
    if (user) {
      try {
        // Convert slug to number (slug is actually the offer ID)
        const offerId = parseInt(slug, 10)
        
        await payload.create({
          collection: 'shares',
          data: {
            user: user.id,
            shareType: 'offer',
            offer: offerId,
            platform: body.platform || 'other',
            data: {
              offerId: slug,
              timestamp: new Date().toISOString(),
            },
          },
        })
      } catch (error) {
        console.error('Error creating share record:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking share:', error)
    return NextResponse.json({ error: 'Failed to track share' }, { status: 500 })
  }
}
