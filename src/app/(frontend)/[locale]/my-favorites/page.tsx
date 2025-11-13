'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FavoriteButton } from '@/components/FavoriteButton'
import { LoadingSpinner } from '@/components/LoadingSpinner'

type Favorite = {
  id: string
  offer: {
    id: string
    title: string
    description: string
    type: string
    discountValue: number
    photo?: string
  }
}

export default function MyFavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch('/api/web/favorites', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setFavorites(data.favorites || [])
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  if (loading) {
    return <LoadingSpinner message="Loading..." />
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-text-primary">My Favorites</h1>
          <p className="mt-2 text-base text-text-secondary">Your saved offers</p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm">
            <p className="text-text-secondary mb-4">You haven&apos;t favorited any offers yet</p>
            <Link
              href="/offers"
              className="inline-block bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-hover transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              Browse Offers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {favorites.map((favorite) => {
              const offer = favorite.offer
              const offerType =
                offer.type === 'percent'
                  ? `${offer.discountValue}% off`
                  : offer.type === 'fixed'
                    ? `€${offer.discountValue} off`
                    : offer.type === 'bogo'
                      ? 'Buy One Get One'
                      : 'Special Offer'

              return (
                <Link
                  key={favorite.id}
                  href={`/offers/${offer.id}`}
                  className="bg-white border border-border rounded-2xl p-6 hover:border-primary hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-heading text-xl font-semibold text-text-primary group-hover:text-primary transition-colors">
                        {offer.title}
                      </h3>
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                        {offer.description || 'No description available'}
                      </p>
                      <span className="inline-block mt-3 bg-primary/10 text-primary px-4 py-1.5 text-sm font-semibold border border-primary/20 rounded-full">
                        {offerType}
                      </span>
                    </div>
                    <div className="ml-4" onClick={(e) => e.preventDefault()}>
                      <FavoriteButton offerId={offer.id} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
