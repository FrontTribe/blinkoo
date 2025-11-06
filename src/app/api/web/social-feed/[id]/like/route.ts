import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * POST /api/web/social-feed/[id]/like
 * Toggle like on a social feed post
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const post = await payload.findByID({
      collection: 'social-feed',
      id,
      depth: 1,
    })

    const postData = post as any
    const likes = postData.likes || []
    const userLiked = likes.some((like: any) => {
      const likeUserId = typeof like.user === 'object' ? like.user.id : like.user
      return likeUserId === user.id
    })

    let updatedLikes
    if (userLiked) {
      // Unlike: remove user's like
      updatedLikes = likes.filter((like: any) => {
        const likeUserId = typeof like.user === 'object' ? like.user.id : like.user
        return likeUserId !== user.id
      })
    } else {
      // Like: add user's like
      updatedLikes = [
        ...likes,
        {
          user: user.id,
          likedAt: new Date().toISOString(),
        },
      ]
    }

    const updated = await payload.update({
      collection: 'social-feed',
      id,
      data: {
        likes: updatedLikes,
      },
    })

    return NextResponse.json({
      liked: !userLiked,
      likesCount: updatedLikes.length,
    })
  } catch (error: any) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: error.message || 'Failed to toggle like' }, { status: 500 })
  }
}

