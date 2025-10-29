'use client'

import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import Link from 'next/link'
import Image from 'next/image'
import { FiClock, FiX } from 'react-icons/fi'
import { LiveOfferPreview } from './LiveOfferPreview'

export function RecentlyViewed() {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed()

  if (recentlyViewed.length === 0) {
    return null
  }

  return (
    <div className="border-b border-border shrink-0">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <FiClock className="text-primary text-sm" />
          <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wide">
            Recently Viewed
          </h3>
        </div>
        <button
          onClick={clearRecentlyViewed}
          className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
        >
          <FiX className="w-3 h-3" />
        </button>
      </div>

      <div className="overflow-x-auto px-4 pb-3">
        <div className="flex gap-2">
          {recentlyViewed.map((item) => (
            <Link
              key={item.id}
              href={`/offers/${item.slug}`}
              className="flex-shrink-0 w-20 group"
            >
              {item.photo ? (
                <div className="aspect-square relative overflow-hidden rounded border border-border group-hover:border-primary transition-colors">
                  <Image
                    src={
                      typeof item.photo === 'object' && 'url' in item.photo && item.photo.url
                        ? (item.photo.url as string)
                        : typeof item.photo === 'string'
                          ? item.photo
                          : ''
                    }
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="80px"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-bg-secondary border border-border rounded flex items-center justify-center group-hover:border-primary transition-colors">
                  <span className="text-text-tertiary text-[10px]">No img</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
