'use client'

import { useState, useEffect } from 'react'
import { FiHeart } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface FavoriteButtonProps {
  offerId: string
  className?: string
}

export function FavoriteButton({ offerId, className = '' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkFavorite() {
      try {
        const response = await fetch('/api/web/favorites', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          const isFav = data.favorites?.some((f: any) => f.offer?.id === offerId)
          setIsFavorite(isFav)
        }
      } catch (error) {
        console.error('Error checking favorite:', error)
      } finally {
        setChecking(false)
      }
    }

    checkFavorite()
  }, [offerId])

  async function toggleFavorite() {
    if (loading) return

    setLoading(true)

    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch('/api/web/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId }),
          credentials: 'include',
        })

        if (response.ok) {
          setIsFavorite(false)
          toast.success('Removed from favorites')
        } else {
          throw new Error('Failed to remove favorite')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/web/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId }),
          credentials: 'include',
        })

        if (response.ok) {
          setIsFavorite(true)
          toast.success('Added to favorites')
        } else {
          throw new Error('Failed to add favorite')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <button
        disabled
        className={`${className} cursor-not-allowed opacity-50`}
        aria-label="Loading"
      >
        <FiHeart className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`${className} transition-colors ${
        isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
      }`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  )
}
