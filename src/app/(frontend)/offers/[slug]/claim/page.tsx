'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { HelpTooltip } from '@/components/HelpTooltip'
import { Confetti } from '@/components/Confetti'
import { ClaimSuccess } from '@/components/ClaimSuccess'
import { useGeolocation } from '@/hooks/useGeolocation'
import { FiMapPin, FiAlertCircle, FiRefreshCw, FiCheck, FiClock, FiArrowLeft } from 'react-icons/fi'

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
  
  // Use cached location from useGeolocation hook with manual retry
  const { lat, lng, loading: locationLoading, error: locationError, requestLocation } = useGeolocation()

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
        {/* Back Button */}
        <Link
          href={`/offers/${slotIdOrSlug}`}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <FiArrowLeft />
          <span className="font-medium">Back to Offer</span>
        </Link>

        {/* Error Alert */}
        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-error text-xl flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-error mb-1">Claim Failed</p>
                <p className="text-error text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border p-6">
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-heading text-3xl font-bold text-text-primary">Claim This Offer</h2>
              <HelpTooltip
                content="Once claimed, you get a QR code and 6-digit code. Show either to staff at the venue. You have 7 minutes to redeem after claiming."
                position="bottom"
              />
            </div>
            <p className="text-text-secondary text-base">
              Secure your spot and get your redemption code
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Time Remaining Indicator */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FiClock className="text-primary text-xl" />
                <div>
                  <p className="font-semibold text-text-primary">You have 7 minutes</p>
                  <p className="text-sm text-text-secondary">Visit the venue after claiming to redeem</p>
                </div>
              </div>
            </div>

            {/* Location Status */}
            {locationLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                  <p className="text-sm text-blue-900">Getting your location...</p>
                </div>
              </div>
            )}

            {lat && lng && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCheck className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">Location Ready</p>
                    <p className="text-xs text-green-700">We know where you are</p>
                  </div>
                </div>
              </div>
            )}

            {locationError && !lat && !lng && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="text-amber-600 text-xl flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900 mb-1">Location Required</p>
                    <p className="text-xs text-amber-700 mb-3">
                      Enable location access to claim this offer. Some offers have distance restrictions.
                    </p>
                    <button
                      onClick={requestLocation}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 hover:border-amber-400 rounded-lg transition-colors text-sm font-medium text-amber-900"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      Request Location Access
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleClaim}
              disabled={loading || locationLoading}
              className="w-full bg-primary text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              style={{ color: 'white' }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🎉</span>
                  <span>Claim This Offer</span>
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-center text-xs text-text-tertiary">
              By claiming, you agree to visit the venue within 7 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
