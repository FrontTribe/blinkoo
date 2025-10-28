'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MdAdd, MdLocalOffer, MdCheckCircle } from 'react-icons/md'

export default function ManageOffersPage() {
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOffers() {
      try {
        const response = await fetch('/api/merchant/offers', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setOffers(data.offers || [])
        }
      } catch (error) {
        console.error('Error fetching offers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-primary">Loading offers...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
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

        {offers.length === 0 ? (
          <div className="bg-white border border-border p-12 text-center">
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
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
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
        )}
      </div>
    </div>
  )
}
