'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<any[]>([])
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchClaims() {
      try {
        const response = await fetch('/api/web/my-claims', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setClaims(data.claims || [])
        }
      } catch (error) {
        console.error('Error fetching claims:', error)
      }
    }

    fetchClaims()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      const newTimeRemaining: Record<string, number> = {}

      claims.forEach((claim: any) => {
        if (claim.expiresAt && claim.status === 'RESERVED') {
          const expires = new Date(claim.expiresAt).getTime()
          const diff = Math.max(0, expires - now)
          newTimeRemaining[claim.id] = diff
        }
      })

      setTimeRemaining(newTimeRemaining)
    }, 1000)

    return () => clearInterval(timer)
  }, [claims])

  function formatDate(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function getTimeRemaining(diffMs: number): string {
    if (diffMs <= 0) return 'Expired'

    const diffMins = Math.floor(diffMs / 1000 / 60)
    const diffSecs = Math.floor((diffMs / 1000) % 60)

    return `${diffMins}:${String(diffSecs).padStart(2, '0')}`
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'RESERVED':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'REDEEMED':
        return 'bg-success/10 text-success border-success/20'
      case 'EXPIRED':
        return 'bg-text-tertiary/10 text-text-tertiary border-border'
      case 'CANCELLED':
        return 'bg-error/10 text-error border-error/20'
      default:
        return 'bg-text-tertiary/10 text-text-tertiary border-border'
    }
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-text-primary">My Claims</h1>
          <p className="mt-2 text-sm text-text-secondary">View and manage your claimed offers</p>
        </div>

        {claims.length === 0 ? (
          <div className="bg-white border border-border p-12 text-center">
            <p className="text-text-secondary mb-4 text-sm">You haven't claimed any offers yet</p>
            <Link
              href="/offers"
              className="inline-block bg-text-primary text-white px-6 py-3 hover:bg-text-secondary transition-colors font-semibold text-sm"
              style={{ color: 'white' }}
            >
              Browse Offers
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => {
              const claimData = claim as any
              const offer = claimData.offer
              const venue = offer?.venue

              if (!offer || !venue) return null

              return (
                <div key={claim.id} className="bg-white border border-border">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-heading text-base font-semibold text-text-primary">
                          {offer.title}
                        </h3>
                        <p className="text-xs text-text-secondary">{venue.name}</p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium border ${getStatusColor(claimData.status)}`}
                      >
                        {claimData.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-text-secondary mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-tertiary">Claimed:</span>
                        {claimData.reservedAt ? formatDate(claimData.reservedAt) : 'N/A'}
                      </div>
                      {claimData.redeemedAt && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-tertiary">Redeemed:</span>
                          {formatDate(claimData.redeemedAt)}
                        </div>
                      )}
                      {claimData.expiresAt && claimData.status === 'RESERVED' && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-tertiary">Expires:</span>
                          {formatDate(claimData.expiresAt)}
                        </div>
                      )}
                    </div>

                    {claimData.status === 'RESERVED' && claimData.qrToken && (
                      <div className="space-y-4">
                        {/* Time Remaining */}
                        <div className="bg-error/10 border border-error p-3">
                          <p className="text-xs font-semibold text-error mb-1 text-center uppercase tracking-wider">
                            Time Remaining
                          </p>
                          <p className="text-2xl font-bold text-center text-text-primary">
                            {timeRemaining[claim.id] !== undefined
                              ? getTimeRemaining(timeRemaining[claim.id])
                              : 'Calculating...'}
                          </p>
                        </div>

                        {/* QR Code and 6-Digit Code */}
                        <div className="bg-primary/10 border border-primary/20 p-4">
                          {/* 6-Digit Code */}
                          <p className="text-xs font-medium text-text-secondary mb-2 text-center uppercase tracking-wider">
                            Show this code to staff
                          </p>
                          <p className="font-heading text-3xl font-bold text-center text-primary tracking-wider mb-4">
                            {claimData.sixCode}
                          </p>

                          {/* QR Code */}
                          <div className="flex justify-center">
                            <div className="bg-white p-2">
                              <QRCodeSVG
                                value={claimData.qrToken || claimData.sixCode}
                                size={120}
                                level="H"
                                bgColor="#FFFFFF"
                                fgColor="#222222"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
