'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiEdit2, FiPause, FiPlay, FiMoreVertical, FiCopy } from 'react-icons/fi'
import { MdLocalOffer } from 'react-icons/md'

type MobileOfferCardProps = {
  offer: any
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onTogglePause?: (id: string) => void
}

export function MobileOfferCard({
  offer,
  onEdit,
  onDuplicate,
  onTogglePause,
}: MobileOfferCardProps) {
  const [showActions, setShowActions] = useState(false)

  const isActive = offer.status === 'active'

  function handleAction(action: 'edit' | 'duplicate' | 'pause') {
    setShowActions(false)
    if (action === 'edit' && onEdit) {
      onEdit(offer.id)
    } else if (action === 'duplicate' && onDuplicate) {
      onDuplicate(offer.id)
    } else if (action === 'pause' && onTogglePause) {
      onTogglePause(offer.id)
    }
  }

  return (
    <div className="bg-white border border-border mb-4 overflow-hidden md:hidden">
      {/* Card Header with Image */}
      <div className="relative">
        {offer.photo ? (
          <div className="aspect-[16/9] relative">
            <Image
              src={
                typeof offer.photo === 'object' && offer.photo.url ? offer.photo.url : offer.photo
              }
              alt={offer.title}
              fill
              className="object-cover"
              sizes="100vw"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] bg-bg-secondary flex items-center justify-center">
            <MdLocalOffer className="text-4xl text-text-tertiary" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowActions(!showActions)}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md"
            aria-label="More actions"
            aria-expanded={showActions}
          >
            <FiMoreVertical className="w-5 h-5 text-text-primary" />
          </button>
        </div>
        {!isActive && (
          <div className="absolute top-2 left-2 bg-error/90 text-white px-3 py-1 text-xs font-semibold rounded">
            Paused
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-text-primary mb-1 line-clamp-2">
          {offer.title}
        </h3>
        <p className="text-xs text-text-secondary mb-3">{offer.venue?.name || 'Unknown Venue'}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div>
            <span className="text-text-tertiary">Slots: </span>
            <span className="font-semibold text-text-primary">{offer.slots?.length || 0}</span>
          </div>
          <div>
            <span className="text-text-tertiary">Claims: </span>
            <span className="font-semibold text-text-primary">{offer.claimsCount || 0}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link
            href={`/merchant/offers/${offer.id}`}
            className="flex-1 bg-primary text-white py-2.5 px-4 text-center text-sm font-semibold hover:bg-primary-hover transition-colors"
            style={{ color: 'white' }}
          >
            View
          </Link>
          <button
            onClick={() => handleAction('edit')}
            className="flex items-center justify-center px-4 py-2.5 border border-border hover:border-primary transition-colors"
            aria-label="Edit offer"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          {onTogglePause && (
            <button
              onClick={() => handleAction('pause')}
              className="flex items-center justify-center px-4 py-2.5 border border-border hover:border-primary transition-colors"
              aria-label={isActive ? 'Pause offer' : 'Activate offer'}
            >
              {isActive ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Actions Dropdown */}
      {showActions && (
        <div className="border-t border-border p-2 space-y-1">
          <button
            onClick={() => handleAction('edit')}
            className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors flex items-center gap-2"
          >
            <FiEdit2 className="w-4 h-4" />
            Edit Offer
          </button>
          {onDuplicate && (
            <button
              onClick={() => handleAction('duplicate')}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors flex items-center gap-2"
            >
              <FiCopy className="w-4 h-4" />
              Duplicate
            </button>
          )}
          {onTogglePause && (
            <button
              onClick={() => handleAction('pause')}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors flex items-center gap-2"
            >
              {isActive ? (
                <>
                  <FiPause className="w-4 h-4" />
                  Pause Offer
                </>
              ) : (
                <>
                  <FiPlay className="w-4 h-4" />
                  Activate Offer
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
