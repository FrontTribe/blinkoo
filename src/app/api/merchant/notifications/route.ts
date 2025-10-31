import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {
      user: { equals: user.id },
    }

    if (unreadOnly) {
      where.read = { equals: false }
    }

    const notifications = await payload.find({
      collection: 'notifications',
      where,
      limit,
      page,
      sort: '-createdAt',
    })

    // Get unread count
    const unreadResult = await payload.find({
      collection: 'notifications',
      where: {
        user: { equals: user.id },
        read: { equals: false },
      },
      limit: 1000, // Get all unread for accurate count
    })

    return NextResponse.json({
      notifications: notifications.docs,
      total: notifications.totalDocs,
      unreadCount: unreadResult.totalDocs,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { notificationIds, read } = body

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 })
    }

    const updates = await Promise.all(
      notificationIds.map(async (id: string) => {
        return payload.update({
          collection: 'notifications',
          id: parseInt(id),
          data: { read: read === true },
        })
      }),
    )

    return NextResponse.json({
      success: true,
      updated: updates.length,
    })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
    }

    // Verify notification belongs to user
    const notification = await payload.findByID({
      collection: 'notifications',
      id: parseInt(notificationId),
    })

    const notificationUser =
      typeof notification.user === 'object' ? notification.user : notification.user

    if (typeof notificationUser === 'object' ? notificationUser.id !== user.id : notificationUser !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await payload.delete({
      collection: 'notifications',
      id: parseInt(notificationId),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
  }
}

