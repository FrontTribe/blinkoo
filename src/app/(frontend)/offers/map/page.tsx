'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapComponent as Map } from '@/components/Map'
import { useGeolocation } from '@/hooks/useGeolocation'

type Offer = {
  slot: {
    id: string
    startsAt: string
    endsAt: string
    qtyRemaining: number
    qtyTotal: number
  }
  offer: {
    id: string
    title: string
    description: string
    type: string
    discountValue: number
  }
  venue: {
    id: string
    name: string
    address: string
    distance: number | null
    lat: number
    lng: number
  }
}

export default function OffersMapPage() {
  const router = useRouter()
  const { lat: userLat, lng: userLng, loading: locationLoading } = useGeolocation()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [center, setCenter] = useState<[number, number]>([-74.5, 40]) // Default to NYC

  useEffect(() => {
    if (userLat && userLng) {
      setCenter([userLng, userLat])
    }
  }, [userLat, userLng])

  useEffect(() => {
    async function fetchOffers() {
      try {
        const lat = userLat || 0
        const lng = userLng || 0
        const response = await fetch(
          `/api/web/offers?lat=${lat}&lng=${lng}&radius=10&filter=live`,
          {
            credentials: 'include',
          },
        )

        if (response.ok) {
          const data = await response.json()
          setOffers(data.results || [])
        }
      } catch (error) {
        console.error('Error fetching offers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [userLat, userLng])

  const markers = offers
    .filter((offer) => offer.venue.lat && offer.venue.lng)
    .map((offer) => ({
      id: offer.slot.id,
      lat: offer.venue.lat,
      lng: offer.venue.lng,
      offerTitle: offer.offer.title,
      venueName: offer.venue.name,
      remaining: offer.slot.qtyRemaining,
    }))

  if (loading || locationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-96 bg-white shadow-lg overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Map View</h1>
              <button
                onClick={() => router.push('/offers')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                📋 List View
              </button>
            </div>

            <div className="space-y-4">
              {offers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No live offers found</p>
              ) : (
                offers.map((item) => (
                  <div
                    key={item.slot.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/offers/${item.slot.id}/claim`)}
                  >
                    <h3 className="font-semibold text-gray-900">{item.offer.title}</h3>
                    <p className="text-sm text-gray-600">{item.venue.name}</p>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-orange-600 font-medium">
                        {item.slot.qtyRemaining} left
                      </span>
                      {item.venue.distance !== null && (
                        <span className="text-gray-500">
                          📍 {item.venue.distance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <Map
            markers={markers}
            center={center}
            zoom={12}
            onMarkerClick={(id) => router.push(`/offers/${id}/claim`)}
          />
        </div>
      </div>
    </div>
  )
}
