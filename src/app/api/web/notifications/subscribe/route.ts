import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
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
    const { playerId } = body

    if (!playerId) {
      return NextResponse.json({ error: 'playerId required' }, { status: 400 })
    }

    // Store OneSignal player ID in user document
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        oneSignalPlayerId: playerId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error saving subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save subscription' },
      { status: 500 },
    )
  }
}
