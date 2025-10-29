'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import { LiveOfferPreview } from './LiveOfferPreview'

type RecommendedOffer = {
  slot: {
    id: string
    startsAt: string
    endsAt: string
    qtyRemaining: number
    qtyTotal: number
  }
  offer: {
    id: string
    slug: string
    title: string
    description: string
    type: string
    discountValue: number
    venue: {
      name: string
      category?: {
        icon: string
      }
    }
    photo?: any
  }
  venue?: {
    id: string
    name: string
    address: string
    lat?: number
    lng?: number
  }
  score: number
  reasons: string[]
}

interface RecommendedOffersProps {
  currentOfferId: string
  userId?: string
  lat?: number
  lng?: number
}

export function RecommendedOffers({
  currentOfferId,
  userId,
  lat = 0,
  lng = 0,
}: RecommendedOffersProps) {
  const [recommendations, setRecommendations] = useState<RecommendedOffer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const params = new URLSearchParams({
          offerId: currentOfferId,
          limit: '4',
        })
        if (userId) params.set('userId', userId)
        if (lat && lng) {
          params.set('lat', lat.toString())
          params.set('lng', lng.toString())
        }

        const response = await fetch(`/api/web/offers/suggestions?${params.toString()}`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setRecommendations(data.suggestions || [])
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [currentOfferId, userId, lat, lng])

  if (loading) {
    return (
      <div className="bg-white border border-border p-6">
        <h3 className="font-heading text-lg font-semibold text-text-primary mb-4">
          Recommendations for You
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse h-64 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary text-lg">✨</span>
        <h3 className="font-heading text-lg font-semibold text-text-primary">
          Recommended for You
        </h3>
      </div>

      {recommendations[0]?.reasons && recommendations[0].reasons.length > 0 && (
        <p className="text-sm text-text-secondary mb-4">
          Based on your interest in <strong>{recommendations[0].reasons[0]}</strong>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((item) => (
          <div key={item.slot.id} className="relative">
            <LiveOfferPreview offer={item.offer} slot={item.slot} venue={item.venue} />
            {item.reasons && item.reasons.length > 0 && (
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-primary border border-primary/20">
                {item.reasons[0]}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/offers"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold text-sm transition-colors"
        >
          View All Offers
          <FiArrowRight />
        </Link>
      </div>
    </div>
  )
}
