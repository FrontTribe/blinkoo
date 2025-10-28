'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { OfferForm } from './OfferForm'

export default function CreateOfferPage() {
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVenues() {
      try {
        const response = await fetch('/api/merchant/venues', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setVenues(data.venues || [])
        }
      } catch (error) {
        console.error('Error fetching venues:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-primary">Loading venues...</p>
      </div>
    )
  }

  if (venues.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white border border-border p-10 max-w-md">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">No Venues</h2>
          <p className="text-text-secondary mb-6">
            You need to create a venue first before creating offers.
          </p>
          <Link
            href="/merchant/venues/create"
            className="block text-center bg-primary text-white py-4 px-6 hover:bg-primary-hover transition-colors font-semibold"
            style={{ color: 'white' }}
          >
            Create Venue
          </Link>
        </div>
      </div>
    )
  }

  return <OfferForm venues={venues} />
}
