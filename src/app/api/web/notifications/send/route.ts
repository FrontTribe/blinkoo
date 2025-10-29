import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'
import {
  sendPushNotificationToUser,
  sendPushNotificationToUsers,
  sendPushToSavedOfferUsers,
} from '@/utilities/sendPushNotification'

export async function POST(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { userIds, offerId, message } = body

    if (!message?.title || !message?.body) {
      return NextResponse.json({ error: 'Message title and body required' }, { status: 400 })
    }

    const notificationPayload = {
      title: message.title,
      body: message.body,
      url: message.url,
      icon: message.icon,
      image: message.image,
      tag: message.tag || 'merchant-broadcast',
    }

    let result

    // If offerId is provided, send to users who saved that offer
    if (offerId) {
      result = await sendPushToSavedOfferUsers(offerId, notificationPayload)
    }
    // If specific userIds provided, send to those users
    else if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      result = await sendPushNotificationToUsers(userIds, notificationPayload)
    } else {
      return NextResponse.json({ error: 'userIds or offerId required' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
    })
  } catch (error: any) {
    console.error('Error sending notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send notifications' },
      { status: 500 },
    )
  }
}
