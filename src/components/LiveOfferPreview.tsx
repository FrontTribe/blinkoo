import Link from 'next/link'
import { MdArrowForward, MdAccessTime, MdLocalOffer } from 'react-icons/md'

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

function getTimeRemaining(endsAt: string): string {
  const now = new Date()
  const end = new Date(endsAt)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Expired'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function LiveOfferPreview({ offer, slot }: Props) {
  return (
    <Link
      href={`/offers/${offer.id}`}
      className="bg-white border border-[#EBEBEB] hover:border-primary transition-colors group block"
    >
      {offer.photo && (
        <div className="aspect-video overflow-hidden bg-gray-200">
          {typeof offer.photo === 'object' && offer.photo.url ? (
            <img
              src={offer.photo.url}
              alt={offer.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : typeof offer.photo === 'string' ? (
            <img
              src={offer.photo}
              alt={offer.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
            <p className="text-sm text-text-secondary">{offer.venue.name}</p>
          </div>
          <span className="bg-primary/10 text-primary px-3 py-1 text-xs font-semibold border border-primary/20">
            {getOfferLabel(offer.type, offer.discountValue || 0)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
          <div className="flex items-center gap-1">
            <MdAccessTime className="text-sm" />
            <span>{getTimeRemaining(slot.endsAt)} left</span>
          </div>
          <div className="flex items-center gap-1">
            <MdLocalOffer className="text-sm" />
            <span>{slot.qtyRemaining} left</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-primary font-semibold group-hover:text-primary-hover transition-colors">
          View Offer
          <MdArrowForward />
        </div>
      </div>
    </Link>
  )
}
