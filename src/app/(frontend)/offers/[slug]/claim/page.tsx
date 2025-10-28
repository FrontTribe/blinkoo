'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { HelpTooltip } from '@/components/HelpTooltip'
import { Confetti } from '@/components/Confetti'
import { ClaimSuccess } from '@/components/ClaimSuccess'
import { useGeolocation } from '@/hooks/useGeolocation'

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
  const [venueData, setVenueData] = useState<any>(null)
  const [offerData, setOfferData] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Use cached location from useGeolocation hook
  const { lat, lng, loading: locationLoading, error: locationError } = useGeolocation()

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

  async function handleClaim() {
    setLoading(true)
    setError(null)

    try {
      // Location is automatically requested by useGeolocation hook and cached
      const userLocation = lat && lng ? { lat, lng } : null

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

          {/* Location Status - Passive Indicator */}
          {locationLoading && (
            <div className="mb-6 bg-bg-secondary border border-border p-4">
              <p className="text-sm text-text-secondary">Getting your location...</p>
            </div>
          )}

          {lat && lng && (
            <div className="mb-6 bg-success/10 border border-success p-4">
              <p className="text-sm text-success font-medium flex items-center gap-2">
                <span>✓</span> Location ready
              </p>
            </div>
          )}

          {locationError && !lat && !lng && (
            <div className="mb-6 bg-bg-secondary border border-border p-4">
              <p className="text-xs text-text-tertiary">
                Location unavailable. Claims may have geofence restrictions.
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
