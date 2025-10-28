'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [offers, setOffers] = useState<any[]>([])
  const [liveSlots, setLiveSlots] = useState<any[]>([])
  const [recentClaims, setRecentClaims] = useState<any[]>([])
  const [todayStats, setTodayStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user
        const userRes = await fetch('/api/web/auth/me', { credentials: 'include' })
        const userData = await userRes.json()
        setUser(userData)

        if (!userData) {
          return
        }

        // Fetch dashboard data
        const res = await fetch('/api/merchant/dashboard', { credentials: 'include' })
        const data = await res.json()

        if (data.success) {
          setOffers(data.offers || [])
          setLiveSlots(data.liveSlots || [])
          setRecentClaims(data.recentClaims || [])
        }

        // Fetch today's stats
        const todayRes = await fetch('/api/merchant/analytics/daily-summary', {
          credentials: 'include',
        })
        if (todayRes.ok) {
          const todayData = await todayRes.json()
          setTodayStats(todayData)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white p-10 max-w-md w-full mx-4 border border-border">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">
            Sign In Required
          </h2>
          <p className="text-text-secondary mb-6">
            Please sign in to access the merchant dashboard
          </p>
          <Link
            href="/auth/login"
            className="block bg-primary text-white py-4 px-6 text-center hover:bg-primary-hover transition-colors font-semibold"
            style={{ color: 'white' }}
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
              Dashboard
            </h1>
            <p className="mt-2 text-sm md:text-base text-text-secondary">
              Manage your offers and venues
            </p>
          </div>
          <Link
            href="/merchant/offers/create"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors"
            style={{ color: 'white' }}
          >
            <span style={{ color: 'white' }}>+ Create Offer</span>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
              Total Offers
            </h3>
            <p className="font-heading text-3xl font-bold text-text-primary">{offers.length}</p>
          </div>
          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
              Live Slots
            </h3>
            <p className="font-heading text-3xl font-bold text-primary">{liveSlots.length}</p>
          </div>
          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
              Today's Claims
            </h3>
            <p className="font-heading text-3xl font-bold text-text-primary">
              {todayStats?.summary?.totalClaims || 0}
            </p>
            {todayStats?.summary && (
              <p className="text-xs text-text-secondary mt-1">
                {todayStats.summary.redeemedClaims} redeemed
              </p>
            )}
          </div>
          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
              Today's Fill Rate
            </h3>
            <p className="font-heading text-3xl font-bold text-primary">
              {todayStats?.summary?.fillRate || '0%'}
            </p>
            {todayStats?.summary && (
              <p className="text-xs text-text-secondary mt-1">
                {todayStats.summary.totalClaimed}/{todayStats.summary.totalCapacity}
              </p>
            )}
          </div>
        </div>

        {/* Urgent Actions */}
        {liveSlots.some((slot: any) => slot.qtyRemaining < 10) && (
          <div className="bg-error/10 border border-error p-4 mb-8">
            <h2 className="font-heading text-base font-semibold text-error mb-2">
              ⚠️ Low Stock Alert
            </h2>
            <p className="text-sm text-text-secondary">
              {liveSlots.filter((slot: any) => slot.qtyRemaining < 10).length} live offer(s) have
              less than 10 slots remaining
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Live Slots */}
          <div className="bg-white border border-border">
            <div className="px-6 py-4 border-b border-[#EBEBEB]">
              <h2 className="font-heading text-lg font-semibold text-text-primary">
                Live Offer Slots
              </h2>
            </div>
            <div className="p-6">
              {liveSlots.length === 0 ? (
                <p className="text-text-tertiary text-center py-8">No live slots at the moment</p>
              ) : (
                <div className="space-y-3">
                  {liveSlots.map((slot: any) => {
                    const offer = slot.offer
                    const venue = offer?.venue

                    return (
                      <div
                        key={slot.id}
                        className="border border-border p-4 hover:border-primary transition-colors bg-[#F7F7F7]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text-primary text-sm truncate">
                              {offer?.title || 'Untitled Offer'}
                            </h3>
                            <p className="text-xs text-text-secondary mt-1 truncate">
                              {venue?.name || 'Unknown Venue'}
                            </p>
                          </div>
                          <span className="bg-primary/10 text-primary px-3 py-1 text-xs font-medium border border-primary/20 flex-shrink-0">
                            {slot.qtyRemaining}/{slot.qtyTotal}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Claims */}
          <div className="bg-white border border-border">
            <div className="px-6 py-4 border-b border-[#EBEBEB]">
              <h2 className="font-heading text-lg font-semibold text-text-primary">
                Recent Claims
              </h2>
            </div>
            <div className="p-6">
              {recentClaims.length === 0 ? (
                <p className="text-text-tertiary text-center py-8">No recent claims</p>
              ) : (
                <div className="space-y-3">
                  {recentClaims.map((claim: any) => {
                    const offer = claim.offer
                    const venue = offer?.venue

                    return (
                      <div
                        key={claim.id}
                        className="border border-border p-3 hover:border-primary transition-colors bg-[#F7F7F7]"
                      >
                        <p className="font-semibold text-sm text-text-primary">{offer?.title}</p>
                        <p className="text-xs text-text-secondary mt-1">{venue?.name}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-white text-text-secondary text-xs border border-border">
                          {claim.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-border p-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/merchant/venues/create"
              className="bg-white border border-border text-text-primary px-4 py-3 hover:border-primary transition-colors font-medium text-center"
            >
              + Add Venue
            </Link>
            <Link
              href="/merchant/offers"
              className="bg-white border border-border text-text-primary px-4 py-3 hover:border-primary transition-colors font-medium text-center"
            >
              Manage Offers
            </Link>
            <Link
              href="/merchant/venues"
              className="bg-white border border-border text-text-primary px-4 py-3 hover:border-primary transition-colors font-medium text-center"
            >
              Manage Venues
            </Link>
            <Link
              href="/merchant/analytics"
              className="bg-white border border-primary text-primary px-4 py-3 hover:bg-primary hover:text-white transition-colors font-medium text-center"
              style={{ color: 'inherit' }}
            >
              View Analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
