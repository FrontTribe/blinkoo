'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MdArrowForward, MdAccessTime, MdLocalOffer } from 'react-icons/md'
import { useTranslation } from '@/i18n/useTranslation'
import type { Locale } from '@/i18n/config'

type Offer = {
  id: string
  slug: string
  title: string
  description?: string
  type: string
  discountValue: number
  venue: {
    name: string
    category?: {
      icon: string
    }
  }
  photo?: any
}

type Slot = {
  id: string
  endsAt: string
  qtyRemaining: number
  qtyTotal: number
}

type Props = {
  offer: Offer
  slot: Slot
  venue?: {
    name: string
    distance?: number
  }
  locale?: Locale
}

function getOfferLabel(type: string, value: number): string {
  switch (type) {
    case 'percent':
      return `${value}% off`
    case 'fixed':
      return `€${value} off`
    case 'bogo':
      return 'BOGO'
    case 'addon':
      return 'Free Add-on'
    default:
      return 'Special Offer'
  }
}

function getTimeRemaining(endsAt: string, t: (key: string) => string): string {
  const now = new Date()
  const end = new Date(endsAt)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return t('offers.detail.ended')

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) {
    const remainingHours = hours % 24
    const dayText = days === 1 ? t('offers.detail.day') : t('offers.detail.days')
    return `${days} ${dayText} ${remainingHours}h`
  }
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function LiveOfferPreview({ offer, slot, venue, locale = 'en' }: Props) {
  const { t } = useTranslation(locale)
  return (
    <Link
      href={`/offers/${offer.id}`}
      className="bg-white border border-[#EBEBEB] hover:border-primary transition-colors group block"
    >
      {offer.photo && (
        <div className="aspect-video overflow-hidden bg-gray-200 relative">
          {typeof offer.photo === 'object' && offer.photo.url ? (
            <Image
              src={offer.photo.url}
              alt={offer.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 33vw"
              loading="lazy"
            />
          ) : typeof offer.photo === 'string' ? (
            <Image
              src={offer.photo}
              alt={offer.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {offer.title}
            </h3>
            <p className="text-sm text-text-secondary">
              {venue?.name || (typeof offer.venue === 'object' && offer.venue?.name) || 'Venue'}
            </p>
          </div>
          <span className="bg-primary/10 text-primary px-3 py-1 text-xs font-semibold border border-primary/20">
            {getOfferLabel(offer.type, offer.discountValue || 0)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
          <div className="flex items-center gap-1">
            <MdAccessTime className="text-sm" />
            <span>
              {getTimeRemaining(slot.endsAt, t)} {t('offers.detail.left')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MdLocalOffer className="text-sm" />
            <span>
              {slot.qtyRemaining} {t('offers.detail.left')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-primary font-semibold group-hover:text-primary-hover transition-colors">
          {t('offers.detail.browseOffers')}
          <MdArrowForward />
        </div>
      </div>
    </Link>
  )
}
