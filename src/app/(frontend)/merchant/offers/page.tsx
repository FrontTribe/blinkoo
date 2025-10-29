'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MdAdd, MdLocalOffer, MdCheckCircle } from 'react-icons/md'
import { MobileOfferCard } from '@/components/merchant/MobileOfferCard'
import { SkeletonLoader } from '@/components/SkeletonLoader'
import { SearchBar } from '@/components/SearchBar'

export default function ManageOffersPage() {
  const [offers, setOffers] = useState<any[]>([])
  const [filteredOffers, setFilteredOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchOffers() {
      try {
        const response = await fetch('/api/merchant/offers', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setOffers(data.offers || [])
          setFilteredOffers(data.offers || [])
        }
      } catch (error) {
        console.error('Error fetching offers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  // Filter offers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOffers(offers)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = offers.filter((offer: any) => {
      const title = offer.title?.toLowerCase() || ''
      const description = offer.description?.toLowerCase() || ''
      const venueName = offer.venue?.name?.toLowerCase() || ''

      return title.includes(query) || description.includes(query) || venueName.includes(query)
    })
    setFilteredOffers(filtered)
  }, [searchQuery, offers])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-border p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4" />
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="flex gap-2">
                  <SkeletonLoader className="h-10 flex-1" />
                  <SkeletonLoader className="h-10 w-10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
                Manage Offers
              </h1>
              <p className="mt-2 text-sm text-text-secondary">Create and manage your offers</p>
            </div>
            <Link
              href="/merchant/offers/create"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors"
              style={{ color: 'white' }}
            >
              <MdAdd style={{ color: 'white' }} />
              Create Offer
            </Link>
          </div>

          {/* Search Bar */}
          <SearchBar
            placeholder="Search offers by title, description, or venue..."
            onSearch={setSearchQuery}
            className="max-w-md"
          />
        </div>

        {filteredOffers.length === 0 && !loading ? (
          <div className="bg-white border border-border p-12 text-center">
            {offers.length === 0 ? (
              <>
                <MdLocalOffer className="text-6xl text-text-tertiary mx-auto mb-4" />
                <p className="text-text-secondary mb-6">You haven't created any offers yet</p>
                <Link
                  href="/merchant/offers/create"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors"
                  style={{ color: 'white' }}
                >
                  <MdAdd style={{ color: 'white' }} />
                  Create Your First Offer
                </Link>
              </>
            ) : (
              <>
                <MdLocalOffer className="text-6xl text-text-tertiary mx-auto mb-4" />
                <p className="text-text-secondary mb-6">No offers found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors"
                  style={{ color: 'white' }}
                >
                  Clear Search
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Mobile: Card View */}
            <div className="md:hidden space-y-4">
              {filteredOffers.map((offer) => (
                <MobileOfferCard
                  key={offer.id}
                  offer={offer}
                  onEdit={(id) => {
                    window.location.href = `/merchant/offers/${id}`
                  }}
                  onDuplicate={(id) => {
                    // Duplicate logic would go here
                    console.log('Duplicate offer:', id)
                  }}
                  onTogglePause={(id) => {
                    // Toggle pause logic would go here
                    console.log('Toggle pause offer:', id)
                  }}
                />
              ))}
            </div>

            {/* Desktop: Grid View */}
            <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOffers.map((offer) => {
                const offerData = offer as any
                const venue = offerData.venue

                return (
                  <div
                    key={offer.id}
                    className="bg-white border border-border p-6 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-primary/10 p-3 border border-primary/20 flex-shrink-0">
                        <MdLocalOffer className="text-primary text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-lg font-semibold text-text-primary mb-1 line-clamp-1">
                          {offerData.title}
                        </h3>
                        <p className="text-xs text-text-secondary truncate">
                          {venue?.name || 'Unknown Venue'}
                        </p>
                      </div>
                    </div>

                    {offerData.description && (
                      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                        {offerData.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${
                          offerData.status === 'active'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-[#F7F7F7] text-text-tertiary border border-border'
                        }`}
                      >
                        <MdCheckCircle className="text-sm" />
                        {offerData.status || 'draft'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Link
                        href={`/merchant/offers/${offer.id}`}
                        className="block w-full text-center bg-white border border-border text-text-primary py-3 px-4 hover:border-primary transition-colors text-sm font-semibold"
                      >
                        View & Edit
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
