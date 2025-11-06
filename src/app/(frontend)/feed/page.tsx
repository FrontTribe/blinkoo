'use client'

import { SocialFeed } from '@/components/SocialFeed'
import Link from 'next/link'

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Community Feed</h1>
            <p className="text-text-secondary">See what others are discovering and sharing</p>
          </div>
          <Link
            href="/offers"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            style={{ color: 'white' }}
          >
            Browse Offers
          </Link>
        </div>
        <SocialFeed />
      </div>
    </div>
  )
}

