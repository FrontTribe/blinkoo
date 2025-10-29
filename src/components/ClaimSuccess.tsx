'use client'

import { QRCodeSVG } from 'qrcode.react'
import { FiClock, FiMapPin, FiShare2, FiCheck } from 'react-icons/fi'
import Link from 'next/link'

type ClaimSuccessProps = {
  claim: {
    id: string
    qrToken: string
    sixCode: string
    expiresAt: string
    status: string
  }
  offer?: {
    id: string
    title: string
  }
  venue?: {
    id: string
    name: string
    address: string
    lat?: number
    lng?: number
  }
  timeRemaining: number
  onClose: () => void
}

export function ClaimSuccess({ claim, offer, venue, timeRemaining, onClose }: ClaimSuccessProps) {
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function handleShare() {
    if (navigator.share && offer) {
      navigator.share({
        title: `I just claimed ${offer.title}!`,
        text: `Check out this great offer on Blinkoo!`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  function getDirectionsUrl() {
    if (venue?.lat && venue?.lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`
    }
    if (venue?.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`
    }
    return 'https://maps.google.com'
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="bg-white border border-border p-8 mb-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-heading text-4xl font-bold text-text-primary mb-2">
            You&apos;ve Claimed It!
          </h1>
          <p className="text-text-secondary text-lg">Show your code to staff at the venue</p>
        </div>

        {/* QR Code */}
        <div className="bg-white border border-border p-8 mb-4">
          <div className="text-center mb-6">
            <div className="bg-white border border-border inline-block p-6">
              <QRCodeSVG
                value={claim.qrToken || claim.sixCode}
                size={240}
                level="H"
                bgColor="#FFFFFF"
                fgColor="#ff385c"
              />
            </div>
          </div>

          <div className="text-center mb-6 pb-6 border-b border-border">
            <p className="text-text-secondary mb-3 text-sm font-medium uppercase tracking-wider">
              Or enter this code
            </p>
            <p className="font-heading text-6xl font-bold tracking-wider text-primary">
              {claim.sixCode}
            </p>
          </div>

          {/* Time Remaining */}
          <div className="bg-primary/5 border border-primary/20 p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FiClock className="text-primary text-xl" />
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                Time Remaining
              </p>
            </div>
            <p className="font-heading text-4xl font-bold text-text-primary">
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>

        {/* Venue Info */}
        {venue && (
          <div className="bg-white border border-border p-6 mb-4">
            <div className="flex items-start gap-3 mb-4">
              <FiMapPin className="text-primary text-xl flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">{venue.name}</h3>
                <p className="text-sm text-text-secondary">{venue.address}</p>
              </div>
            </div>
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-text-primary text-white py-3 px-6 text-center hover:bg-text-secondary font-semibold transition-colors mb-2"
              style={{ color: 'white' }}
            >
              Get Directions
            </a>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white border border-border p-6 mb-4">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FiCheck className="text-primary" />
            Next Steps
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div
                className="bg-primary text-white w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ color: 'white' }}
              >
                1
              </div>
              <div className="flex-1">
                <p className="text-text-primary font-medium">Go to the venue</p>
                <p className="text-text-secondary text-xs mt-0.5">
                  Show your QR code or enter the code to staff
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div
                className="bg-primary text-white w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ color: 'white' }}
              >
                2
              </div>
              <div className="flex-1">
                <p className="text-text-primary font-medium">Hurry, you have 7 minutes!</p>
                <p className="text-text-secondary text-xs mt-0.5">
                  Your claim expires in {formatTime(timeRemaining)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div
                className="bg-primary text-white w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ color: 'white' }}
              >
                3
              </div>
              <div className="flex-1">
                <p className="text-text-primary font-medium">Enjoy your offer</p>
                <p className="text-text-secondary text-xs mt-0.5">
                  Leave a review to help others discover great deals
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleShare}
            className="bg-white border border-border text-text-primary py-3 px-4 hover:bg-bg-secondary transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FiShare2 />
            Share
          </button>
          <Link
            href="/offers"
            className="bg-bg-secondary border border-border text-text-primary py-3 px-4 hover:bg-bg-secondary transition-colors font-medium flex items-center justify-center gap-2"
          >
            View More Offers
          </Link>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-white border border-border text-text-primary py-3 px-4 hover:bg-bg-secondary transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}
