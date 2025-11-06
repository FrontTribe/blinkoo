import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * POST /api/web/social-feed/[id]/comment
 * Add a comment to a social feed post
 * Body: { comment: string }
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
    const body = await request.json()
    const { comment } = body

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json({ error: 'Comment required' }, { status: 400 })
    }

    const post = await payload.findByID({
      collection: 'social-feed',
      id,
      depth: 1,
    })

    const postData = post as any
    const comments = postData.comments || []

    const updatedComments = [
      ...comments,
      {
        user: user.id,
        comment: comment.trim(),
        commentedAt: new Date().toISOString(),
      },
    ]

    const updated = await payload.update({
      collection: 'social-feed',
      id,
      data: {
        comments: updatedComments,
      },
    })

    return NextResponse.json({
      comment: updatedComments[updatedComments.length - 1],
      commentsCount: updatedComments.length,
    })
  } catch (error: any) {
    console.error('Error adding comment:', error)
    return NextResponse.json({ error: error.message || 'Failed to add comment' }, { status: 500 })
  }
}

