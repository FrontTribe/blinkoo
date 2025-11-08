'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiHeart, FiTrash2, FiMapPin } from 'react-icons/fi'
import toast from 'react-hot-toast'

const FAVORITE_TYPE_LABELS: Record<string, string> = {
  venue: 'Lokacija',
  offer: 'Ponuda',
}

function formatCategory(category: any): string {
  if (!category) return 'Nekategorizirano'
  if (typeof category === 'string') return category
  return category.name || 'Nekategorizirano'
}

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
    const response = await fetch('/api/web/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId }),
      credentials: 'include',
    })

    if (response.ok) {
      toast.success('Uklonjeno iz favorita')
      fetchFavorites()
    } else {
      toast.error('Uklanjanje nije uspjelo')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <div className="text-text-primary text-sm">Učitavanje favorita...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary pb-20 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-text-primary mb-2">
            Moji favoriti
          </h1>
          <p className="text-sm md:text-base text-text-secondary">
            Spremljene lokacije i ponude koje želite posjetiti kasnije.
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Još nema favorita
            </h2>
            <p className="text-text-secondary mb-6 text-sm">
              Spremite ponude i lokacije koje volite kako bi im se lako vratili.
            </p>
            <Link
              href="/offers"
              className="inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors font-semibold text-sm"
              style={{ color: 'white' }}
            >
              Pregledaj ponude
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => {
              const venue = favorite.venue

              if (!venue) return null

              return (
                <div
                  key={favorite.id}
                  className="bg-white border border-border rounded-xl shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <FiHeart className="text-primary" />
                          <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                            {FAVORITE_TYPE_LABELS[favorite.type] || 'Favorit'}
                          </span>
                        </div>
                        <h3 className="font-heading text-xl font-bold text-text-primary">
                          {venue.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <FiMapPin className="text-text-tertiary" />
                          <span>{venue.address || 'Adresa nije navedena'}</span>
                        </div>
                        <p className="text-xs text-text-tertiary uppercase tracking-wide">
                          {formatCategory(venue.category)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-start">
                        <Link
                          href={`/venues/${venue.id}`}
                          className="px-4 py-2 text-sm font-semibold border border-border rounded-lg text-text-primary hover:border-primary transition-colors"
                        >
                          Detalji lokacije
                        </Link>
                        <button
                          onClick={() => handleRemove(venue.id)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Ukloni iz favorita"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {favorite.notes && (
                      <div className="mt-4 bg-bg-secondary border border-border rounded-lg p-3 text-xs text-text-secondary">
                        Napomena: {favorite.notes}
                      </div>
                    )}
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
