'use client'

import { useState, useEffect } from 'react'
import { FiBookmark } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface SavedButtonProps {
  offerId: string
  className?: string
}

export function SavedButton({ offerId, className = '' }: SavedButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkSaved() {
      try {
        const response = await fetch('/api/web/saved-offers', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          const isOff = data.savedOffers?.some((s: any) => {
            const savedOfferId = typeof s.offer === 'string' ? s.offer : s.offer?.id
            return savedOfferId === offerId
          })
          setIsSaved(isOff)
        }
      } catch (error) {
        console.error('Error checking saved:', error)
      } finally {
        setChecking(false)
      }
    }

    checkSaved()
  }, [offerId])

  async function toggleSaved() {
    if (loading) return

    setLoading(true)

    try {
      if (isSaved) {
        // Remove from saved
        const response = await fetch('/api/web/saved-offers', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId }),
          credentials: 'include',
        })

        if (response.ok) {
          setIsSaved(false)
          toast.success('Removed from saved for later')
        } else {
          throw new Error('Failed to remove saved')
        }
      } else {
        // Add to saved
        const response = await fetch('/api/web/saved-offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId }),
          credentials: 'include',
        })

        if (response.ok) {
          setIsSaved(true)
          toast.success('Saved for later')
        } else {
          throw new Error('Failed to save')
        }
      }
    } catch (error) {
      console.error('Error toggling saved:', error)
      toast.error('Failed to update saved')
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
        <FiBookmark className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleSaved}
      disabled={loading}
      className={`${className} transition-colors ${
        isSaved ? 'text-primary hover:text-primary/80' : 'text-gray-400 hover:text-primary'
      }`}
      aria-label={isSaved ? 'Remove from saved' : 'Save for later'}
    >
      <FiBookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
    </button>
  )
}
