'use client'

import { useState } from 'react'
import { FiShare2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

type ShareOfferButtonProps = {
  offerTitle: string
  offerId: string
  venueName?: string
  discount?: string
}

export function ShareOfferButton({
  offerTitle,
  offerId,
  venueName,
  discount,
}: ShareOfferButtonProps) {
  const [sharing, setSharing] = useState(false)

  async function handleShare() {
    setSharing(true)

    const shareText = `${offerTitle}${venueName ? ` at ${venueName}` : ''}${discount ? ` - ${discount}` : ''}\n\nCheck out this exclusive offer on Blinkoo!`
    const shareUrl = `${window.location.origin}/offers/${offerId}`

    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: offerTitle,
          text: shareText,
          url: shareUrl,
        })
        toast.success('Shared successfully!')
        setSharing(false)
        return
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
        } else {
          // User cancelled share
          setSharing(false)
          return
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to share. Please copy the link manually.')
    } finally {
      setSharing(false)
    }
  }

  function handleWhatsAppShare() {
    const shareText = `${offerTitle}${venueName ? ` at ${venueName}` : ''}${discount ? ` - ${discount}` : ''}\n\nCheck out this exclusive offer on Blinkoo!`
    const shareUrl = `${window.location.origin}/offers/${offerId}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`
    
    // Track share
    fetch(`/api/web/offers/${offerId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ platform: 'whatsapp' }),
    }).catch(() => {})
    
    window.open(whatsappUrl, '_blank')
  }

  function handleFacebookShare() {
    const shareUrl = `${window.location.origin}/offers/${offerId}`
    
    // Track share
    fetch(`/api/web/offers/${offerId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ platform: 'facebook' }),
    }).catch(() => {})
    
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
    )
  }

  function handleTwitterShare() {
    const shareText = `${offerTitle}${venueName ? ` at ${venueName}` : ''} - Check out this exclusive offer!`
    const shareUrl = `${window.location.origin}/offers/${offerId}`
    
    // Track share
    fetch(`/api/web/offers/${offerId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ platform: 'twitter' }),
    }).catch(() => {})
    
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={sharing}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-border hover:border-primary transition-colors font-medium text-text-primary disabled:opacity-50 rounded-lg"
      >
        <FiShare2 />
        {sharing ? 'Sharing...' : 'Share'}
      </button>

      {/* Share options dropdown - can be enhanced */}
      <div className="hidden group-hover:block absolute top-full mt-2 bg-white border border-border shadow-lg p-2 z-10 rounded-lg">
        <button
          onClick={handleWhatsAppShare}
          className="block w-full text-left px-4 py-2 hover:bg-bg-secondary text-sm rounded"
        >
          Share on WhatsApp
        </button>
        <button
          onClick={handleFacebookShare}
          className="block w-full text-left px-4 py-2 hover:bg-bg-secondary text-sm rounded"
        >
          Share on Facebook
        </button>
        <button
          onClick={handleTwitterShare}
          className="block w-full text-left px-4 py-2 hover:bg-bg-secondary text-sm rounded"
        >
          Share on Twitter
        </button>
      </div>
    </div>
  )
}
