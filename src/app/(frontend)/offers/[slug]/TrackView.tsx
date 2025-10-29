'use client'

import { useEffect } from 'react'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'

export function TrackView({
  offer,
}: {
  offer: { id: string; slug: string; title: string; photo?: any }
}) {
  const { addRecentlyViewed } = useRecentlyViewed()

  useEffect(() => {
    if (offer?.id && addRecentlyViewed) {
      addRecentlyViewed({
        id: offer.id,
        slug: offer.slug || offer.id,
        title: offer.title,
        photo: typeof offer.photo === 'object' && offer.photo?.url ? offer.photo.url : offer.photo,
      })
    }
  }, [offer?.id, offer?.slug, offer?.title, offer?.photo, addRecentlyViewed])

  return null
}
