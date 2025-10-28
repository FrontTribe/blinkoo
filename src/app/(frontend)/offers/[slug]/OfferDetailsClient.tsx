'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useGeolocation } from '@/hooks/useGeolocation'
import { FiMapPin, FiClock, FiUsers, FiAlertCircle } from 'react-icons/fi'
import { SavedButton } from '@/components/SavedButton'
import { CountdownTimer } from '@/components/CountdownTimer'

type OfferDetailsClientProps = {
  slug: string
  offer: any
  venue: any
  slot: any
  geofenceKm?: number
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

function getTimeRemaining(endsAt: string): string {
  const now = new Date()
  const end = new Date(endsAt)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Ended'

  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `Ends in ${hours}h ${minutes % 60}m`
  }
  return `Ends in ${minutes}m`
}

export function OfferDetailsClient({
  slug,
  offer,
  venue,
  slot,
  geofenceKm = 0,
}: OfferDetailsClientProps) {
  const { lat, lng, loading: locationLoading } = useGeolocation()
  const [distance, setDistance] = useState<number | null>(null)

  useEffect(() => {
    if (lat && lng && venue.lat && venue.lng) {
      const calculatedDistance = calculateDistance(lat, lng, venue.lat, venue.lng)
      setDistance(calculatedDistance)
    }
  }, [lat, lng, venue.lat, venue.lng])

  const hasGeofence = geofenceKm > 0
  const isOutsideGeofence = hasGeofence && distance !== null && distance > geofenceKm
  const distanceText = distance !== null ? `${distance.toFixed(1)} km away` : null

  return (
    <div className="bg-white border border-border overflow-hidden">
      {/* Header Section with Title */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="font-heading text-4xl font-bold text-text-primary mb-3 leading-tight">
              {offer.title}
            </h1>

            {/* Venue Info with Distance */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <FiMapPin className="text-primary" />
                <span className="font-medium">{venue.name}</span>
              </div>
              {distanceText && (
                <div className="flex items-center gap-1 text-text-tertiary">
                  <span className="w-1 h-1 rounded-full bg-text-tertiary" />
                  <span>{distanceText}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Geofence Warning */}
        {hasGeofence && isOutsideGeofence && (
          <div className="bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-amber-600 mt-0.5 flex-shrink-0 text-lg" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-1">Outside Geofence Zone</p>
                <p className="text-xs text-amber-700">
                  You're currently {distance?.toFixed(1)} km away. You need to be within{' '}
                  {geofenceKm} km of this venue to claim this offer.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 divide-x divide-border">
        {/* Countdown */}
        <div className="p-5 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <FiClock className="text-primary text-lg" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Time Remaining
            </span>
          </div>
          <div className="sm:hidden">
            <CountdownTimer endDate={slot.endsAt} />
          </div>
          <div className="hidden sm:block">
            <div className="text-2xl font-bold text-text-primary">
              {getTimeRemaining(slot.endsAt)}
            </div>
          </div>
        </div>

        {/* Quantity Available */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <FiUsers className="text-primary text-lg" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Available
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">{slot.qtyRemaining}</span>
            <span className="text-sm text-text-tertiary">left</span>
          </div>
        </div>

        {/* Total Quantity */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <FiUsers className="text-text-secondary text-lg" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Total
            </span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{slot.qtyTotal}</div>
        </div>
      </div>
    </div>
  )
}

// Separate component for booking card
export function OfferBookingCard({
  slug,
  offerId,
  venue,
  geofenceKm = 0,
}: {
  slug: string
  offerId: string
  venue: any
  geofenceKm?: number
}) {
  const { lat, lng } = useGeolocation()
  const [distance, setDistance] = useState<number | null>(null)

  useEffect(() => {
    if (lat && lng && venue.lat && venue.lng) {
      const calculatedDistance = calculateDistance(lat, lng, venue.lat, venue.lng)
      setDistance(calculatedDistance)
    }
  }, [lat, lng, venue.lat, venue.lng])

  const hasGeofence = geofenceKm > 0
  const isOutsideGeofence = hasGeofence && distance !== null && distance > geofenceKm

  return (
    <div className="lg:sticky lg:top-32 bg-gradient-to-br from-white to-bg-secondary border-2 border-primary/20 overflow-hidden">
      {/* Header Badge */}
      <div className="bg-primary/10 border-b border-primary/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              Special Offer
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold text-text-primary">Free</span>
            </div>
          </div>
          <SavedButton offerId={offerId} />
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Geofence Warning in Booking Card */}
        {hasGeofence && isOutsideGeofence && (
          <div className="bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="text-amber-600 mt-0.5 flex-shrink-0 text-lg" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Outside Geofence</p>
                <p className="text-xs text-amber-700 mt-1">
                  Currently {distance?.toFixed(1)} km away. Need to be within {geofenceKm} km.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Claim Button */}
        <Link
          href={`/offers/${slug}/claim`}
          className={`block w-full text-center py-4 px-6 font-bold text-base transition-colors ${
            hasGeofence && isOutsideGeofence
              ? 'bg-amber-100 text-amber-900 border-2 border-amber-300 hover:bg-amber-200'
              : 'bg-primary text-white hover:bg-primary-hover transform hover:-translate-y-0.5'
          }`}
          style={hasGeofence && isOutsideGeofence ? {} : { color: 'white' }}
        >
          {hasGeofence && isOutsideGeofence
            ? '⚠️ Claim Offer (Outside Geofence)'
            : '🎉 Claim This Offer'}
        </Link>

        {hasGeofence && isOutsideGeofence && (
          <p className="text-xs text-center text-amber-700">
            Warning: You may be too far from the venue to claim
          </p>
        )}

        {/* Info Note */}
        <div className="bg-bg-secondary border border-border p-3">
          <p className="text-xs text-text-secondary text-center leading-relaxed">
            Claim this offer to get a unique QR code. Show it at the venue within 7 minutes to
            redeem.
          </p>
        </div>

        {/* Terms */}
        <p className="text-xs text-center text-text-tertiary">Terms and conditions apply</p>
      </div>
    </div>
  )
}
