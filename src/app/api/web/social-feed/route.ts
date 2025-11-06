import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/web/social-feed
 * Get social feed posts
 * Query params: ?limit=20&offset=0
 */
export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    // Get feed posts with user data
    const feed = await payload.find({
      collection: 'social-feed',
      sort: '-createdAt',
      limit,
      page,
      depth: 2,
    })

    // Format posts for frontend
    const posts = feed.docs.map((post: any) => ({
      id: post.id,
      type: post.type,
      title: post.title,
      content: post.content,
      photo: post.photo,
      createdAt: post.createdAt,
      user: {
        id: typeof post.user === 'object' ? post.user.id : post.user,
        name: typeof post.user === 'object' ? post.user.name : null,
      },
      offer: post.offer
        ? {
            id: typeof post.offer === 'object' ? post.offer.id : post.offer,
            title: typeof post.offer === 'object' ? post.offer.title : null,
            photo: typeof post.offer === 'object' ? post.offer.photo : null,
          }
        : null,
      achievement: post.achievement
        ? {
            id: typeof post.achievement === 'object' ? post.achievement.id : post.achievement,
            name: typeof post.achievement === 'object' ? post.achievement.name : null,
            icon: typeof post.achievement === 'object' ? post.achievement.icon : null,
          }
        : null,
      metadata: post.metadata,
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
      isLikedByMe: user
        ? post.likes?.some((like: any) => {
            const likeUserId = typeof like.user === 'object' ? like.user.id : like.user
            return likeUserId === user.id
          })
        : false,
    }))

    return NextResponse.json({
      posts,
      hasMore: feed.hasNextPage,
      total: feed.totalDocs,
    })
  } catch (error) {
    console.error('Error fetching social feed:', error)
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 })
  }
}

/**
 * POST /api/web/social-feed
 * Create a new social feed post
 * Body: { type, title, content?, photo?, offer?, achievement?, metadata? }
 */
export async function POST(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, title, content, photo, offer, achievement, metadata } = body

    if (!type || !title) {
      return NextResponse.json({ error: 'Type and title required' }, { status: 400 })
    }

    const post = await payload.create({
      collection: 'social-feed',
      data: {
        user: user.id,
        type,
        title,
        content,
        photo,
        offer,
        achievement,
        metadata,
      },
    })

    return NextResponse.json({ post })
  } catch (error: any) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 })
  }
}

