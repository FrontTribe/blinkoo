'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiClock, FiUsers, FiMapPin, FiBookmark } from 'react-icons/fi'
import { DynamicIcon } from '@/components/DynamicIcon'
import { SavedButton } from '@/components/SavedButton'

type SavedOffer = {
  id: string
  offer: {
    id: string
    title: string
    description: string
    type: string
    discountValue: number
    photo?: string
    venue?: {
      id: string
      name: string
      address: string
      category?: {
        id: string
        name: string
        slug: string
        icon: string
      }
    }
  }
  notifyOnSlotStart: boolean
  notify30MinBefore: boolean
  createdAt: string
}

function getOfferLabel(type: string, value: number): string {
  switch (type) {
    case 'percent':
      return `${value}% off`
    case 'fixed':
      return `€${value} off`
    case 'bogo':
      return 'BOGO'
    case 'addon':
      return 'Free Add-on'
    default:
      return 'Special'
  }
}

export default function SavedOffersPage() {
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSavedOffers() {
      try {
        const response = await fetch('/api/web/saved-offers', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setSavedOffers(data.savedOffers || [])
        }
      } catch (error) {
        console.error('Error fetching saved offers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedOffers()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <p className="text-text-primary">Loading saved offers...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="border-b border-border bg-white sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 text-text-primary hover:text-text-secondary transition-colors text-sm font-medium"
            >
              <FiArrowLeft className="text-base" />
              <span>Back to offers</span>
            </Link>

            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-text-primary">Saved for Later</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {savedOffers.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-4 bg-white border border-border rounded-full mb-4">
              <FiBookmark className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-text-primary mb-2">
              No saved offers yet
            </h2>
            <p className="text-text-secondary mb-6">
              Start saving offers you're interested in and we'll notify you when slots become
              available
            </p>
            <Link
              href="/offers"
              className="inline-block bg-text-primary text-white px-6 py-3 font-semibold hover:bg-text-secondary transition-colors"
            >
              Browse Offers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOffers.map((saved) => (
              <Link
                key={saved.id}
                href={`/offers/${saved.offer.id}`}
                className="group relative overflow-hidden border border-border hover:border-text-primary transition-all bg-white"
              >
                {/* Saved Button */}
                <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
                  <SavedButton offerId={saved.offer.id} />
                </div>

                {/* Image */}
                <div className="aspect-[4/3] bg-bg-secondary relative overflow-hidden">
                  {saved.offer.photo ? (
                    <img
                      src={saved.offer.photo}
                      alt={saved.offer.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-bg-secondary text-text-tertiary text-xs">
                      No Image
                    </div>
                  )}

                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 bg-text-primary text-white px-2 py-1 text-xs font-semibold uppercase tracking-wider">
                    {getOfferLabel(saved.offer.type, saved.offer.discountValue || 0)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Offer Title */}
                  <h3 className="text-sm font-semibold text-text-primary line-clamp-2 mb-2">
                    {saved.offer.title}
                  </h3>

                  {/* Venue Info */}
                  {saved.offer.venue && (
                    <div className="space-y-2 mb-3">
                      {/* Venue Name */}
                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-text-secondary text-xs" />
                        <p className="text-xs text-text-secondary line-clamp-1">
                          {saved.offer.venue.name}
                        </p>
                      </div>

                      {/* Category */}
                      {saved.offer.venue.category && (
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <DynamicIcon
                            iconName={saved.offer.venue.category.icon}
                            className="text-xs"
                          />
                          <span className="capitalize">{saved.offer.venue.category.name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notification Status */}
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <FiClock className="text-xs" />
                      {saved.notifyOnSlotStart && <span>Notify on slot start</span>}
                      {saved.notify30MinBefore && saved.notifyOnSlotStart && <span>•</span>}
                      {saved.notify30MinBefore && <span>30min before</span>}
                      {!saved.notifyOnSlotStart && !saved.notify30MinBefore && (
                        <span>No notifications</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
