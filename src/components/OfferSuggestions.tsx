'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiClock, FiMapPin, FiTag } from 'react-icons/fi'

type Suggestion = {
  slot: {
    id: string
    endsAt: string
    qtyRemaining: number
  }
  offer: {
    id: string
    title: string
    description: string
    type: string
    discountValue: number
    photo: any
  }
  venue: {
    id: string
    name: string
    address: string
    lat?: number
    lng?: number
  } | null
  score: number
  reasons: string[]
}

type OfferSuggestionsProps = {
  offerId: string
  userId?: string
  lat?: number
  lng?: number
  limit?: number
}

export function OfferSuggestions({ offerId, userId, lat, lng, limit = 4 }: OfferSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const params = new URLSearchParams({ offerId, limit: limit.toString() })
        if (userId) params.append('userId', userId)
        if (lat) params.append('lat', lat.toString())
        if (lng) params.append('lng', lng.toString())

        const response = await fetch(`/api/web/offers/suggestions?${params}`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [offerId, userId, lat, lng, limit])

  function getMinutesRemaining(endsAt: string): string {
    const now = new Date()
    const end = new Date(endsAt)
    const diff = end.getTime() - now.getTime()
    const mins = Math.floor(diff / 1000 / 60)

    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h`
  }

  function formatDiscount(type: string, value: number): string {
    switch (type) {
      case 'percent':
        return `${value}% OFF`
      case 'fixed':
        return `$${value} OFF`
      case 'bogo':
        return 'BOGO'
      case 'addon':
        return 'FREE ADD-ON'
      default:
        return 'Special Offer'
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-border p-6">
        <h3 className="font-semibold text-text-primary mb-4">You Might Like</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiTag className="text-primary text-xl" />
        <h3 className="font-semibold text-text-primary">You Might Like</h3>
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <Link
            key={suggestion.slot.id}
            href={`/offers/${suggestion.offer.id}`}
            className="block border border-border hover:border-primary transition-colors p-4"
          >
            <div className="flex gap-3">
              {/* Photo */}
              {suggestion.offer.photo && typeof suggestion.offer.photo === 'object' && (
                <div className="w-20 h-20 bg-gray-100 flex-shrink-0 relative overflow-hidden">
                  <Image
                    src={
                      suggestion.offer.photo.url ||
                      suggestion.offer.photo.filename ||
                      '/placeholder.jpg'
                    }
                    alt={suggestion.offer.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-text-primary text-sm line-clamp-1">
                    {suggestion.offer.title}
                  </h4>
                  <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 flex-shrink-0">
                    {formatDiscount(suggestion.offer.type, suggestion.offer.discountValue || 0)}
                  </span>
                </div>

                {suggestion.venue && (
                  <p className="text-xs text-text-secondary mb-2 line-clamp-1">
                    {suggestion.venue.name}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <FiClock />
                    {getMinutesRemaining(suggestion.slot.endsAt)} left
                  </span>
                  <span className="flex items-center gap-1">
                    <FiMapPin />
                    {suggestion.slot.qtyRemaining} available
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
