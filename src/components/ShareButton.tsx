'use client'

import { useState } from 'react'
import { FiShare2, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

type ShareButtonProps = {
  offerId: string
  slug: string
  title: string
  className?: string
}

export function ShareButton({ offerId, slug, title, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/offers/${slug || offerId}`
    const shareData = {
      title: title,
      text: `Check out this offer: ${title}`,
      url,
    }

    // Try native share API first
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)

        // Track share
        try {
          await fetch(`/api/web/offers/${slug}/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ platform: 'native' }),
          })
        } catch (error) {
          console.error('Failed to track share:', error)
        }

        return
      } catch (error) {
        console.log('Native share cancelled')
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)

      // Track share
      try {
        await fetch(`/api/web/offers/${slug}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ platform: 'clipboard' }),
        })
      } catch (error) {
        console.error('Failed to track share:', error)
      }
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-border hover:border-primary hover:bg-primary hover:text-white transition-colors ${className}`}
    >
      {copied ? <FiCheck className="w-4 h-4" /> : <FiShare2 className="w-4 h-4" />}
      <span className="text-sm font-medium">{copied ? 'Copied!' : 'Share'}</span>
    </button>
  )
}
