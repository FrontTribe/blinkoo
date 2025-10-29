'use client'

import { useState, useEffect } from 'react'
import { FiStar, FiImage } from 'react-icons/fi'
import Image from 'next/image'
import toast from 'react-hot-toast'

type Review = {
  id: string
  rating: number
  comment: string
  createdAt: string
  photos?: Array<{ photo: string | { url: string } }>
  user: {
    name?: string
    email: string
  }
}

interface ReviewsProps {
  offerId: string
  autoOpenForm?: boolean
}

export function Reviews({ offerId, autoOpenForm = false }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])

  useEffect(() => {
    fetchReviews()
  }, [offerId])

  useEffect(() => {
    if (autoOpenForm) {
      setShowForm(true)
      // Scroll to reviews section
      setTimeout(() => {
        document.querySelector('#reviews-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [autoOpenForm])

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
      // If photos are uploaded, upload them first
      let photoIds: string[] = []
      if (photos.length > 0) {
        const formData = new FormData()
        photos.forEach((photo) => {
          formData.append('files', photo)
        })

        const uploadResponse = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          photoIds = uploadData.docs.map((doc: any) => doc.id)
        }
      }

      const response = await fetch('/api/web/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId,
          rating,
          comment,
          photos: photoIds.map((id) => ({ photo: id })),
        }),
        credentials: 'include',
      })

      if (response.ok) {
        toast.success('Review submitted!')
        setRating(5)
        setComment('')
        setPhotos([])
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

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files).slice(0, 5) // Max 5 photos
      setPhotos((prev) => [...prev, ...fileArray])
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-3 flex items-center gap-2">
            <span className="h-1 w-1 bg-primary" />
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3">
            {averageRating > 0 ? (
              <>
                <div className="flex items-center gap-0.5">
                  {renderStars(Math.round(averageRating))}
                </div>
                <span className="text-text-secondary text-sm font-medium">
                  {averageRating.toFixed(1)} out of 5
                </span>
                <span className="text-text-tertiary text-sm">
                  · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </>
            ) : (
              <span className="text-text-secondary text-sm">No reviews yet - be the first!</span>
            )}
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 hover:bg-primary-hover transition-colors text-sm font-semibold"
            style={{ color: 'white' }}
          >
            Write Review
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 p-6">
          <h3 className="font-heading text-lg font-bold text-text-primary mb-4">
            Share Your Experience
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

            {/* Photo Upload */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-text-secondary mb-2">
                Add Photos (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="w-full text-sm text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover"
              />
              {photos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                  setPhotos([])
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
              {review.photos && review.photos.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {review.photos.map((photo, idx) => {
                    const photoUrl =
                      typeof photo.photo === 'string' ? photo.photo : photo.photo?.url
                    if (!photoUrl) return null
                    return (
                      <div key={idx} className="relative w-20 h-20">
                        <Image
                          src={photoUrl}
                          alt="Review photo"
                          fill
                          className="object-cover rounded border border-border"
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
