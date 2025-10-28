'use client'

import { useState, useEffect } from 'react'
import { FiStar } from 'react-icons/fi'
import toast from 'react-hot-toast'

type Review = {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    name?: string
    email: string
  }
}

interface ReviewsProps {
  offerId: string
}

export function Reviews({ offerId }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [offerId])

  async function fetchReviews() {
    try {
      const response = await fetch(`/api/web/reviews?offerId=${offerId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!rating) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/web/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, rating, comment }),
        credentials: 'include',
      })

      if (response.ok) {
        toast.success('Review submitted!')
        setRating(5)
        setComment('')
        setShowForm(false)
        fetchReviews()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function renderStars(rating: number) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <p className="text-text-secondary text-sm">Loading reviews...</p>
      </div>
    )
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-2">Reviews</h2>
          <div className="flex items-center gap-2">
            {averageRating > 0 ? (
              <>
                <div className="flex items-center gap-0.5">
                  {renderStars(Math.round(averageRating))}
                </div>
                <span className="text-text-secondary text-xs">
                  {averageRating.toFixed(1)} · {reviews.length}{' '}
                  {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </>
            ) : (
              <span className="text-text-secondary text-xs">No reviews yet</span>
            )}
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-text-primary border border-border px-4 py-2 hover:bg-bg-secondary transition-colors text-xs font-medium"
          >
            Write Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 bg-bg-secondary border border-border p-4">
          <h3 className="font-heading text-base font-semibold text-text-primary mb-4">
            Write a Review
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-medium text-text-secondary mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`${
                      star <= rating ? 'text-primary fill-primary' : 'text-text-tertiary'
                    } hover:text-primary transition-colors`}
                  >
                    <FiStar className={`w-5 h-5 ${star <= rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="comment"
                className="block text-xs font-medium text-text-secondary mb-2"
              >
                Comment (optional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm placeholder-text-tertiary focus:border-text-primary focus:outline-none resize-none"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-text-primary text-white px-4 py-2 hover:bg-text-secondary transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'white' }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setRating(5)
                  setComment('')
                }}
                className="bg-white text-text-primary border border-border px-4 py-2 hover:bg-bg-secondary transition-colors text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-text-tertiary text-sm text-center py-8">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-bg-secondary border border-border p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-text-primary text-sm font-medium">
                    {review.user.name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-text-tertiary">{formatDate(review.createdAt)}</p>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.comment && (
                <p className="text-text-secondary text-xs !my-0 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
