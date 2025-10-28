'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MdAdd, MdLocationOn, MdMap, MdCheckCircle, MdEdit, MdDelete } from 'react-icons/md'

export default function VenuesContent() {
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    fetchVenues()
  }, [])

  async function handleDelete(venueId: string) {
    if (!confirm('Are you sure you want to delete this venue?')) {
      return
    }

    try {
      const response = await fetch(`/api/merchant/venues/${venueId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete venue')
      }

      // Refresh the list
      fetchVenues()
    } catch (error) {
      console.error('Error deleting venue:', error)
      alert('Failed to delete venue. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-primary">Loading venues...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
              Manage Venues
            </h1>
            <p className="mt-1 text-sm text-text-secondary">Add and manage your venue locations</p>
          </div>
          <Link
            href="/merchant/venues/create"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 hover:bg-primary-hover transition-colors font-semibold"
          >
            <MdAdd className="text-lg" />
            <span className="hidden sm:inline">Add Venue</span>
          </Link>
        </div>

        {venues.length === 0 ? (
          <div className="bg-white border border-border p-12 text-center">
            <MdLocationOn className="text-6xl text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary mb-6">You haven't added any venues yet</p>
            <Link
              href="/merchant/venues/create"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover transition-colors font-semibold"
            >
              <MdAdd className="text-lg" />
              Add Your First Venue
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => {
              const venueData = venue as any

              return (
                <div
                  key={venue.id}
                  className="bg-white border border-border p-5 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="bg-primary/10 p-2 border border-primary/30 flex-shrink-0">
                        <MdLocationOn className="text-primary text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-lg font-semibold text-text-primary line-clamp-1">
                          {venueData.name}
                        </h3>
                        {venueData.category && (
                          <p className="text-xs text-text-secondary mt-0.5">
                            {typeof venueData.category === 'object'
                              ? venueData.category.name
                              : 'Uncategorized'}
                          </p>
                        )}
                        <p className="text-sm text-text-secondary mt-1">{venueData.city}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {venueData.address}
                  </p>

                  {venueData.lat && venueData.lng && (
                    <div className="mb-3">
                      <a
                        href={`https://maps.google.com?q=${venueData.lat},${venueData.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors"
                      >
                        <MdMap />
                        View on Map
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-[#EBEBEB]">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border ${
                        venueData.status === 'active'
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-bg-secondary text-text-tertiary border-border'
                      }`}
                    >
                      <MdCheckCircle className="text-sm" />
                      {venueData.status}
                    </span>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/merchant/venues/${venue.id}/edit`}
                        className="p-2 bg-bg-secondary text-text-secondary hover:text-primary hover:bg-[#F7F7F7] transition-colors"
                        title="Edit venue"
                      >
                        <MdEdit className="text-lg" />
                      </Link>
                      <button
                        onClick={() => handleDelete(venue.id)}
                        className="p-2 bg-bg-secondary text-text-secondary hover:text-red-600 hover:bg-[#F7F7F7] transition-colors"
                        title="Delete venue"
                      >
                        <MdDelete className="text-lg" />
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
