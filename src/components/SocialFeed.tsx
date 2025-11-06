'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiHeart, FiMessageCircle, FiShare2, FiTrendingUp, FiAward, FiCamera } from 'react-icons/fi'
import toast from 'react-hot-toast'

function formatTimeAgo(date: string): string {
  const now = new Date()
  const time = new Date(date)
  const diff = now.getTime() - time.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  return 'just now'
}

type FeedPost = {
  id: number
  type: 'offer_claim' | 'achievement' | 'milestone' | 'streak' | 'tip' | 'photo'
  title: string
  content?: string
  photo?: string | { url: string }
  createdAt: string
  user: {
    id: number
    name?: string
  }
  offer?: {
    id: number
    title?: string
    photo?: string | { url: string }
  }
  achievement?: {
    id: number
    name?: string
    icon?: string
  }
  metadata?: any
  likes: number
  comments: number
  isLikedByMe: boolean
}

export function SocialFeed() {
  const router = useRouter()
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [commentingOn, setCommentingOn] = useState<number | null>(null)
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    fetchFeed()
  }, [])

  async function fetchFeed() {
    try {
      const res = await fetch('/api/web/social-feed?limit=20')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
        setHasMore(data.hasMore || false)
      }
    } catch (error) {
      console.error('Error fetching feed:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLike(postId: number) {
    try {
      const res = await fetch(`/api/web/social-feed/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, likes: data.likesCount, isLikedByMe: data.liked }
              : post
          )
        )
      }
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error('Failed to like post')
    }
  }

  async function handleComment(postId: number) {
    if (!commentText.trim()) return

    try {
      const res = await fetch(`/api/web/social-feed/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment: commentText }),
      })

      if (res.ok) {
        const data = await res.json()
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, comments: data.commentsCount }
              : post
          )
        )
        setCommentText('')
        setCommentingOn(null)
        toast.success('Comment added!')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    }
  }

  async function handleShare(post: FeedPost) {
    const shareData = {
      title: post.title,
      text: post.content || post.title,
      url: post.offer ? `${window.location.origin}/offers/${post.offer.id}` : window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast.success('Shared!')
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Link copied to clipboard!')
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error)
        toast.error('Failed to share')
      }
    }
  }

  function toggleCommentBox(postId: number) {
    if (commentingOn === postId) {
      setCommentingOn(null)
      setCommentText('')
    } else {
      setCommentingOn(postId)
    }
  }

  function getPostIcon(type: string) {
    switch (type) {
      case 'offer_claim':
        return <FiTrendingUp className="w-5 h-5" />
      case 'achievement':
        return <FiAward className="w-5 h-5" />
      case 'milestone':
        return <FiTrendingUp className="w-5 h-5" />
      case 'streak':
        return <FiTrendingUp className="w-5 h-5" />
      case 'tip':
        return <FiTrendingUp className="w-5 h-5" />
      case 'photo':
        return <FiCamera className="w-5 h-5" />
      default:
        return null
    }
  }

  function getPhotoUrl(photo: string | { url: string } | undefined): string | undefined {
    if (!photo) return undefined
    if (typeof photo === 'string') return photo
    return photo.url
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-border rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-20 bg-gray-100 rounded mb-4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white border border-border rounded-lg p-12 text-center">
        <p className="text-text-secondary">No posts yet. Be the first to share!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="bg-white border border-border rounded-lg overflow-hidden">
          {/* Post Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3 mb-3">
              {getPostIcon(post.type)}
              <h3 className="font-semibold text-text-primary">{post.title}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="font-medium">{post.user.name || 'Anonymous'}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>

          {/* Post Content */}
          {post.content && (
            <div className="p-6 border-b border-border">
              <p className="text-text-primary">{post.content}</p>
            </div>
          )}

          {/* Post Media */}
          {post.photo && (
            <div className="relative aspect-video bg-bg-secondary">
              <img
                src={getPhotoUrl(post.photo)}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Offer Card */}
          {post.offer && (
            <div className="p-6 border-b border-border bg-primary/5">
              <div className="flex items-center gap-4">
                {post.offer.photo && (
                  <img
                    src={getPhotoUrl(post.offer.photo)}
                    alt={post.offer.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-text-primary">{post.offer.title}</p>
                  <button
                    onClick={() => router.push(`/offers/${post.offer?.id}`)}
                    className="text-sm text-primary hover:underline mt-1"
                  >
                    View Offer →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Achievement Badge */}
          {post.achievement && (
            <div className="p-6 border-b border-border bg-amber-50">
              <div className="flex items-center gap-3">
                {post.achievement.icon && (
                  <span className="text-2xl">{post.achievement.icon}</span>
                )}
                <div>
                  <p className="font-semibold text-text-primary">{post.achievement.name}</p>
                  <p className="text-sm text-text-secondary">Achievement unlocked!</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          {post.metadata && (
            <div className="p-6 border-b border-border bg-green-50">
              {post.metadata.savings && (
                <p className="text-lg font-bold text-green-700">
                  €{post.metadata.savings.toFixed(2)} saved!
                </p>
              )}
              {post.metadata.streak && (
                <p className="text-lg font-bold text-amber-700">
                  {post.metadata.streak} day streak! 🔥
                </p>
              )}
              {post.metadata.totalSavings && (
                <p className="text-lg font-bold text-primary">
                  {post.metadata.totalSavings} total claims
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="p-4 flex items-center gap-6 text-sm">
            <button
              onClick={() => handleLike(post.id)}
              className={`flex items-center gap-2 transition-colors ${
                post.isLikedByMe ? 'text-red-600' : 'text-text-secondary hover:text-red-600'
              }`}
            >
              <FiHeart className={`w-5 h-5 ${post.isLikedByMe ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.likes}</span>
            </button>
            <button
              onClick={() => toggleCommentBox(post.id)}
              className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
            >
              <FiMessageCircle className="w-5 h-5" />
              <span className="font-medium">{post.comments}</span>
            </button>
            <button
              onClick={() => handleShare(post)}
              className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors ml-auto"
            >
              <FiShare2 className="w-5 h-5" />
            </button>
          </div>

          {/* Comment Box */}
          {commentingOn === post.id && (
            <div className="px-4 pb-4 border-t border-border pt-4 space-y-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setCommentingOn(null)
                    setCommentText('')
                  }}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleComment(post.id)}
                  disabled={!commentText.trim()}
                  className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ color: 'white' }}
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => fetchFeed()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}

