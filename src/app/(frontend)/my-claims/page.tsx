'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { FiMessageSquare, FiCheckCircle } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { OfferSuggestions } from '@/components/OfferSuggestions'
import { useOfferUpdates } from '@/hooks/useOfferUpdates'
import { ClaimsListSkeleton } from '@/components/SkeletonLoader'
import { EmptyState } from '@/components/EmptyState'
import { useClaims } from '@/hooks/useClaims'

const STATUS_LABELS: Record<string, string> = {
  RESERVED: 'Rezervirano',
  REDEEMED: 'Iskorišteno',
  EXPIRED: 'Isteklo',
  CANCELLED: 'Otkazano',
}

export default function MyClaimsPage() {
  const { claims, loading, mutate } = useClaims()
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!claims || claims.length === 0) return

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
    return new Date(date).toLocaleString('hr-HR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  function getTimeRemaining(diffMs: number): string {
    if (diffMs <= 0) return 'Isteklo'

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

  async function handleWriteReview(claim: any) {
    const offer = typeof claim.offer === 'object' ? claim.offer : null
    if (!offer) return

    // Navigate to offer page with review prompt
    window.location.href = `/offers/${offer.id}?review=true`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
          <ClaimsListSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-text-primary mb-2">Moje rezervacije</h1>
          <p className="text-text-secondary text-sm">Pregledajte i upravljajte svojim rezerviranim ponudama</p>
        </div>

        {claims.length === 0 ? (
          <EmptyState
            title="Još nema rezervacija"
            description="Počnite rezervirati ponude i iskoristite sjajne popuste!"
            action={{
              label: 'Pregledaj ponude',
              href: '/offers',
            }}
          />
        ) : (
          <div className="space-y-4">
            {claims.map((claim: any) => {
              const claimData = claim as any
              const offer = claimData.offer
              const venue = offer?.venue

              if (!offer || !venue) return null

              return (
                <div key={claim.id} className="bg-white border-2 border-border overflow-hidden">
                  {/* Card Header */}
                  <div className="border-b border-border p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                          {offer.title}
                        </h3>
                        <p className="text-sm text-text-secondary font-medium">{venue.name}</p>
                      </div>
                      <div className={`px-4 py-2 border-2 ${getStatusColor(claimData.status)}`}>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {STATUS_LABELS[claimData.status] || claimData.status}
                        </span>
                      </div>
                    </div>

                    {/* Timeline Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">
                          Rezervirano
                        </p>
                        <p className="text-sm font-medium text-text-primary">
                          {claimData.reservedAt ? formatDate(claimData.reservedAt) : 'Nije dostupno'}
                        </p>
                      </div>
                      {claimData.redeemedAt && (
                        <div>
                          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">
                            Iskorišteno
                          </p>
                          <p className="text-sm font-medium text-text-primary">
                            {formatDate(claimData.redeemedAt)}
                          </p>
                        </div>
                      )}
                      {claimData.expiresAt && claimData.status === 'RESERVED' && (
                        <div>
                          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">
                            Istječe
                          </p>
                          <p className="text-sm font-medium text-text-primary">
                            {formatDate(claimData.expiresAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Claim Content */}
                  {claimData.status === 'RESERVED' && claimData.qrToken && (
                    <div className="p-6 bg-primary/5 border-t border-border">
                      {/* Time Remaining */}
                      <div className="bg-error border-2 border-error p-4 mb-4">
                        <p className="text-xs font-bold text-white mb-2 text-center uppercase tracking-wider">
                          Preostalo vrijeme
                        </p>
                        <p className="text-4xl font-bold text-center text-white">
                          {timeRemaining[claim.id] !== undefined
                            ? getTimeRemaining(timeRemaining[claim.id])
                            : '--:--'}
                        </p>
                      </div>

                      {/* QR Code and 6-Digit Code */}
                      <div className="bg-white border-2 border-primary p-6">
                        {/* 6-Digit Code */}
                        <p className="text-xs font-bold text-text-secondary mb-3 text-center uppercase tracking-wider">
                          Pokažite ovaj kod osoblju
                        </p>
                        <p className="font-heading text-5xl font-bold text-center text-primary tracking-widest mb-6">
                          {claimData.sixCode}
                        </p>

                        {/* QR Code */}
                        <div className="flex justify-center">
                          <div className="bg-white border-2 border-border p-3">
                            <QRCodeSVG
                              value={claimData.qrToken || claimData.sixCode}
                              size={180}
                              level="H"
                              bgColor="#FFFFFF"
                              fgColor="#222222"
                            />
                          </div>
                        </div>

                        <p className="text-xs text-text-tertiary text-center mt-4">
                          Ili skenirajte QR kod mobilnim uređajem
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Review Prompt for Redeemed Offers */}
                  {claimData.status === 'REDEEMED' && !claimData.reviewed && (
                    <div className="border-t border-border p-6 bg-primary/5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="bg-primary/10 border-2 border-primary p-3">
                          <FiMessageSquare className="text-primary text-2xl" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-heading text-lg font-bold text-text-primary mb-1">
                            Podijelite svoje iskustvo
                          </h4>
                          <p className="text-sm text-text-secondary">
                            Pomozite drugima otkriti sjajne ponude ostavljanjem recenzije
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleWriteReview(claim)}
                        className="w-full bg-primary text-white py-3 px-4 hover:bg-primary-hover transition-colors font-bold text-sm flex items-center justify-center gap-2"
                        style={{ color: 'white' }}
                      >
                        <FiMessageSquare />
                        Napišite recenziju
                      </button>
                    </div>
                  )}

                  {/* Review Submitted Confirmation */}
                  {claimData.status === 'REDEEMED' && claimData.reviewed && (
                    <div className="border-t border-border p-6 bg-success/10 border-2 border-success">
                      <div className="flex items-center gap-3">
                        <FiCheckCircle className="text-success text-2xl flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-success uppercase tracking-wider">
                            Recenzija poslana
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Hvala na povratnim informacijama!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Show suggestions if user has redeemed offers */}
        {claims.length > 0 && (
          <div className="mt-8">
            <OfferSuggestions
              offerId={claims[0]?.offer?.id || ''}
              userId={claims[0]?.user?.id}
              limit={4}
            />
          </div>
        )}
      </div>
    </div>
  )
}
