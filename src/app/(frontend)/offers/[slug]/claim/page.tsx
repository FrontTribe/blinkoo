'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { HelpTooltip } from '@/components/HelpTooltip'
import { Confetti } from '@/components/Confetti'
import { ClaimSuccess } from '@/components/ClaimSuccess'

type ClaimResponse = {
  claim: {
    id: string
    qrToken: string
    sixCode: string
    expiresAt: string
    status: string
  }
  slot: {
    id: string
    qtyRemaining: number
  }
}

export default function ClaimOfferPage() {
  const params = useParams()
  const router = useRouter()
  const slotIdOrSlug = params.slug as string

  const [claim, setClaim] = useState<ClaimResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [venueData, setVenueData] = useState<any>(null)
  const [offerData, setOfferData] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/web/auth/me', { credentials: 'include' })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          router.push('/auth/login?redirect=/offers/' + slotIdOrSlug + '/claim')
        }
      } catch (err) {
        router.push('/auth/login?redirect=/offers/' + slotIdOrSlug + '/claim')
      } finally {
        setAuthLoading(false)
      }
    }
    checkAuth()
  }, [slotIdOrSlug, router])

  useEffect(() => {
    if (claim) {
      const interval = setInterval(() => {
        const now = new Date()
        const expires = new Date(claim.claim.expiresAt)
        const diff = expires.getTime() - now.getTime()
        setTimeRemaining(Math.max(0, Math.floor(diff / 1000)))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [claim])

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  async function getCurrentLocation() {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          reject(error)
        },
        { timeout: 10000 },
      )
    })
  }

  async function handleGetLocation() {
    setGettingLocation(true)
    setLocationError(null)

    try {
      const coords = await getCurrentLocation()
      setLocation(coords)
    } catch (err: any) {
      setLocationError(
        err.message || 'Could not get your location. Please enable location access and try again.',
      )
    } finally {
      setGettingLocation(false)
    }
  }

  async function handleClaim() {
    setLoading(true)
    setError(null)

    try {
      // Get location if not already available
      let userLocation = location
      if (!userLocation) {
        try {
          userLocation = await getCurrentLocation()
        } catch (err) {
          console.log('Location not available, proceeding without it')
        }
      }

      const response = await fetch('/api/web/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId: slotIdOrSlug,
          lat: userLocation?.lat,
          lng: userLocation?.lng,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to claim offer')
      }

      const data = await response.json()
      setClaim(data)

      // Trigger confetti
      setShowConfetti(true)

      // Set offer and venue data from response
      if (data.offer) {
        setOfferData(data.offer)
      }
      if (data.venue) {
        setVenueData(data.venue)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (claim) {
    return (
      <>
        <Confetti trigger={showConfetti} />
        <ClaimSuccess
          claim={claim.claim}
          offer={offerData}
          venue={venueData}
          timeRemaining={timeRemaining}
          onClose={() => router.push('/offers')}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/offers/${slotIdOrSlug}`}
          className="text-text-secondary hover:text-text-primary mb-6 inline-flex items-center gap-2 transition-colors text-sm font-medium"
        >
          ← Back to Offer
        </Link>

        {error && (
          <div className="bg-error/10 border border-error p-4 mb-6">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white border border-border p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="font-heading text-3xl font-bold text-text-primary">Claim This Offer</h2>
            <HelpTooltip
              content="Once claimed, you get a QR code and 6-digit code. Show either to staff at the venue. You have 7 minutes to redeem after claiming."
              position="bottom"
            />
          </div>

          <p className="text-text-secondary mb-6 text-base">
            Click the button below to claim this offer. You'll have 7 minutes to redeem it.
          </p>

          {/* Location Status */}
          {!location && (
            <div className="mb-6 bg-bg-secondary border border-border p-4">
              <p className="text-xs text-text-secondary mb-3 font-medium uppercase tracking-wider">
                Location Access
              </p>
              <p className="text-sm text-text-primary mb-3">
                Enable location for geofence validation (recommended)
              </p>
              <button
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="w-full bg-white text-text-primary py-3 px-4 border border-border hover:bg-bg-secondary transition-colors text-sm font-medium"
              >
                {gettingLocation ? 'Getting Location...' : 'Enable Location'}
              </button>
              {locationError && <p className="text-error text-xs mt-2">{locationError}</p>}
            </div>
          )}

          {location && (
            <div className="mb-6 bg-success/10 border border-success p-4">
              <p className="text-sm text-success font-medium flex items-center gap-2">
                <span>✓</span> Location enabled
              </p>
            </div>
          )}

          <button
            onClick={handleClaim}
            disabled={loading}
            className="w-full bg-text-primary text-white py-4 px-6 hover:bg-text-secondary font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ color: 'white' }}
          >
            {loading ? 'Processing...' : 'Claim Offer'}
          </button>

          <p className="text-center text-xs text-text-tertiary mt-4">
            By claiming, you agree to visit the venue within 7 minutes
          </p>
        </div>
      </div>
    </div>
  )
}
