'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiHeart, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  async function fetchFavorites() {
    try {
      const response = await fetch('/api/web/favorites', {
        credentials: 'include',
      })

      const res = await response
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(venueId: number) {
    // Find offers for this venue
    const response = await fetch('/api/web/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId }),
      credentials: 'include',
    })

    if (response.ok) {
      toast.success('Removed from favorites')
      fetchFavorites()
    } else {
      toast.error('Failed to remove favorite')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-text-primary">My Favorites</h1>
          <p className="mt-2 text-sm text-text-secondary">Your saved venues and offers</p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white border border-border p-12 text-center">
            <FiHeart className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary mb-4 text-sm">
              You haven&apos;t favorited any venues yet
            </p>
            <Link
              href="/offers"
              className="inline-block bg-text-primary text-white px-6 py-3 hover:bg-text-secondary transition-colors font-semibold text-sm"
              style={{ color: 'white' }}
            >
              Browse Offers
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((favorite) => {
              const venue = favorite.venue

              if (!venue) return null

              return (
                <div key={favorite.id} className="bg-white border border-border">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-heading text-base font-semibold text-text-primary">
                          {venue.name}
                        </h3>
                        <p className="text-xs text-text-secondary mt-1">{venue.address}</p>
                        {venue.category && (
                          <p className="text-xs text-text-tertiary mt-1 capitalize">
                            {typeof venue.category === 'object' && venue.category.name
                              ? venue.category.name
                              : 'Uncategorized'}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(venue.id)}
                        className="text-error hover:text-error/80 transition-colors p-2"
                        title="Remove from favorites"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
