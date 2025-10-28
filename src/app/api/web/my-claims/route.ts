import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { headers as getHeaders } from 'next/headers'

export async function GET() {
  try {
    const config = await configPromise
    const payload = await getPayload({ config })

    // Get user from request cookies
    const cookieHeader = (await getHeaders()).get('cookie') || ''
    const headers = new Headers()
    if (cookieHeader) {
      headers.set('cookie', cookieHeader)
    }

    const { user } = await payload.auth({ headers: headers as any })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const claims = await payload.find({
      collection: 'claims',
      where: {
        user: { equals: user.id },
      },
      depth: 3,
      limit: 50,
      sort: '-reservedAt',
    })

    return NextResponse.json({ claims: claims.docs })
  } catch (error) {
    console.error('Error fetching claims:', error)
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}
