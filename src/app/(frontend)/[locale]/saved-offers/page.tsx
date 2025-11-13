'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  FiArrowLeft,
  FiClock,
  FiUsers,
  FiMapPin,
  FiBookmark,
  FiBell,
  FiCheck,
} from 'react-icons/fi'
import { DynamicIcon } from '@/components/DynamicIcon'
import { SavedButton } from '@/components/SavedButton'
import { EmptyState } from '@/components/EmptyState'

type SavedOffer = {
  id: string
  offer: {
    id: string
    title: string
    description: string
    type: string
    discountValue: number
    photo?: string | { url: string }
    venue?: {
      id: string
      name: string
      address: string
      category?: {
        id: string
        name: string
        slug: string
        icon: string
      }
    }
  }
  notifyOnSlotStart: boolean
  notify30MinBefore: boolean
  createdAt: string
}

function getOfferLabel(type: string, value: number): string {
  switch (type) {
    case 'percent':
      return `${value}% popusta`
    case 'fixed':
      return `-${value.toFixed(2)} €`
    case 'bogo':
      return '2 za 1'
    case 'addon':
      return 'Besplatan dodatak'
    default:
      return 'Posebna ponuda'
  }
}

function formatSavedDate(date: string): string {
  return new Date(date).toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SavedOffersPage() {
  const t = useTranslations('nav')
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSavedOffers() {
      try {
        const response = await fetch('/api/web/saved-offers', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setSavedOffers(data.savedOffers || [])
        }
      } catch (error) {
        console.error('Error fetching saved offers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedOffers()
  }, [])

  if (loading) {
    return <LoadingSpinner message={t('loading')} />
  }

  return (
    <div className="min-h-screen bg-bg-secondary pb-20 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12">
        <div className="mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-text-primary mb-2">
            Spremljene ponude
          </h1>
          <p className="text-sm md:text-base text-text-secondary">
            Rezervirajte favorite i primajte obavijesti kada se oslobode termini.
          </p>
        </div>

        {savedOffers.length === 0 ? (
          <EmptyState
            title="Trenutno nema spremljenih ponuda"
            description="Spremite ponude koje vas zanimaju i obavijestit ćemo vas kada se oslobode mjesta."
            action={{
              label: 'Pregledaj ponude',
              href: '/offers',
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOffers.map((saved) => (
              <Link
                key={saved.id}
                href={`/offers/${saved.offer.id}`}
                className="group relative overflow-hidden border border-border hover:border-text-primary transition-all bg-white rounded-xl shadow-sm hover:shadow-lg"
              >
                {/* Saved Button */}
                <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
                  <SavedButton offerId={saved.offer.id} />
                </div>

                {/* Image */}
                <div className="aspect-[4/3] bg-bg-secondary relative overflow-hidden">
                  {saved.offer.photo ? (
                    <Image
                      src={
                        typeof saved.offer.photo === 'object' &&
                        'url' in saved.offer.photo &&
                        saved.offer.photo.url
                          ? (saved.offer.photo.url as string)
                          : typeof saved.offer.photo === 'string'
                            ? saved.offer.photo
                            : ''
                      }
                      alt={saved.offer.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-bg-secondary text-text-tertiary text-xs">
                      No Image
                    </div>
                  )}

                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 bg-text-primary text-white px-2 py-1 text-xs font-semibold uppercase tracking-wider">
                    {getOfferLabel(saved.offer.type, saved.offer.discountValue || 0)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Offer Title */}
                  <h3 className="text-base font-semibold text-text-primary line-clamp-2 mb-2">
                    {saved.offer.title}
                  </h3>

                  {/* Venue Info */}
                  {saved.offer.venue && (
                    <div className="space-y-2 mb-4 text-sm">
                      {/* Venue Name */}
                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-text-secondary text-xs" />
                        <p className="text-xs text-text-secondary line-clamp-1 uppercase tracking-wide">
                          {saved.offer.venue.name}
                        </p>
                      </div>

                      {/* Category */}
                      {saved.offer.venue.category && (
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <DynamicIcon
                            iconName={saved.offer.venue.category.icon}
                            className="text-xs"
                          />
                          <span className="capitalize">{saved.offer.venue.category.name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notification Status */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-text-tertiary">
                      <FiClock className="text-xs" />
                      <span>Spremljeno {formatSavedDate(saved.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <FiBell className="text-sm text-primary" />
                      {saved.notifyOnSlotStart && <span>Obavijesti pri otvaranju termina</span>}
                      {saved.notify30MinBefore && saved.notifyOnSlotStart && <span>•</span>}
                      {saved.notify30MinBefore && <span>30 min prije početka</span>}
                      {!saved.notifyOnSlotStart && !saved.notify30MinBefore && (
                        <span>Obavijesti su isključene</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
