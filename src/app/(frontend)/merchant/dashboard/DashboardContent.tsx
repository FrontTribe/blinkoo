'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiTrendingUp, FiClock, FiUsers, FiDollarSign, FiAlertCircle, FiChevronRight, FiCheckCircle } from 'react-icons/fi'

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

  const lowStockCount = liveSlots.filter((slot: any) => slot.qtyRemaining < 10).length
  const endingSoonCount = liveSlots.filter((slot: any) => {
    const endsAt = new Date(slot.endsAt)
    const hoursUntilEnd = (endsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60)
    return hoursUntilEnd <= 2 && hoursUntilEnd > 0
  }).length

  return (
    <div className="min-h-screen bg-white py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
              Dashboard
            </h1>
            <p className="mt-2 text-sm md:text-base text-text-secondary">
              Welcome back, {user?.name || 'Merchant'}! Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/merchant/offers/create"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors"
              style={{ color: 'white' }}
            >
              + Create Offer
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {(lowStockCount > 0 || endingSoonCount > 0) && (
          <div className="space-y-3">
            {lowStockCount > 0 && (
              <div className="bg-error/10 border border-error rounded-lg p-4 flex items-start gap-3">
                <FiAlertCircle className="text-error text-xl flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-error mb-1">Low Stock Alert</h3>
                  <p className="text-sm text-text-secondary">
                    {lowStockCount} live offer{lowStockCount > 1 ? 's have' : ' has'} less than 10 slots remaining
                  </p>
                </div>
                <Link
                  href="/merchant/offers"
                  className="text-sm font-semibold text-error hover:text-error/80"
                >
                  View Offers →
                </Link>
              </div>
            )}
            {endingSoonCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <FiClock className="text-amber-600 text-xl flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">Ending Soon</h3>
                  <p className="text-sm text-amber-700">
                    {endingSoonCount} offer{endingSoonCount > 1 ? 's are' : ' is'} ending in less than 2 hours
                  </p>
                </div>
                <Link
                  href="/merchant/offers"
                  className="text-sm font-semibold text-amber-900 hover:text-amber-800"
                >
                  View Offers →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FiUsers className="text-primary text-lg" />
              </div>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Total Offers
              </h3>
            </div>
            <p className="font-heading text-3xl font-bold text-text-primary">{offers.length}</p>
            <p className="text-xs text-text-secondary mt-2">{liveSlots.length} live right now</p>
          </div>

          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-lg" />
              </div>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Today&apos;s Claims
              </h3>
            </div>
            <p className="font-heading text-3xl font-bold text-primary">
              {todayStats?.summary?.totalClaims || 0}
            </p>
            {todayStats?.summary && (
              <p className="text-xs text-text-secondary mt-2">
                {todayStats.summary.redeemedClaims} redeemed
              </p>
            )}
          </div>

          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FiTrendingUp className="text-blue-600 text-lg" />
              </div>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Fill Rate
              </h3>
            </div>
            <p className="font-heading text-3xl font-bold text-blue-600">
              {todayStats?.summary?.fillRate || '0%'}
            </p>
            {todayStats?.summary && (
              <p className="text-xs text-text-secondary mt-2">
                {todayStats.summary.totalClaimed}/{todayStats.summary.totalCapacity} capacity
              </p>
            )}
          </div>

          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <FiClock className="text-purple-600 text-lg" />
              </div>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Live Slots
              </h3>
            </div>
            <p className="font-heading text-3xl font-bold text-purple-600">{liveSlots.length}</p>
            <p className="text-xs text-text-secondary mt-2">Active offers running now</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Live Slots - Left Side (2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-border">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-text-primary">
                  Live Offer Slots
                </h2>
                {liveSlots.length > 0 && (
                  <Link
                    href="/merchant/offers"
                    className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    View All <FiChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              <div className="p-6">
                {liveSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-bg-secondary flex items-center justify-center mb-4">
                      <FiUsers className="text-text-tertiary text-2xl" />
                    </div>
                    <p className="text-text-tertiary font-medium mb-2">No live slots at the moment</p>
                    <Link
                      href="/merchant/offers/create"
                      className="text-primary hover:text-primary-hover text-sm font-semibold inline-flex items-center gap-1"
                    >
                      Create your first offer <FiChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {liveSlots.slice(0, 5).map((slot: any) => {
                      const offer = slot.offer
                      const venue = offer?.venue
                      const isLowStock = slot.qtyRemaining < 10
                      const endsAt = new Date(slot.endsAt)
                      const hoursUntilEnd = (endsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60)

                      return (
                        <Link
                          key={slot.id}
                          href={`/merchant/offers/${offer?.id}`}
                          className="block border border-border p-4 hover:border-primary transition-all bg-white group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-text-primary text-sm mb-1 group-hover:text-primary transition-colors">
                                {offer?.title || 'Untitled Offer'}
                              </h3>
                              <p className="text-xs text-text-secondary truncate">
                                {venue?.name || 'Unknown Venue'}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                {isLowStock && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-error/10 text-error text-xs font-medium rounded">
                                    <FiAlertCircle className="w-3 h-3" />
                                    Low Stock
                                  </span>
                                )}
                                {hoursUntilEnd <= 2 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded">
                                    <FiClock className="w-3 h-3" />
                                    Ending Soon
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-lg font-bold text-primary">
                                {slot.qtyRemaining}
                              </div>
                              <div className="text-xs text-text-secondary">of {slot.qtyTotal} left</div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white border border-border">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-text-primary">
                  Recent Activity
                </h2>
                {recentClaims.length > 0 && (
                  <Link
                    href="/merchant/claims"
                    className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    View All <FiChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              <div className="p-6">
                {recentClaims.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-text-tertiary text-sm">No recent claims</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentClaims.slice(0, 5).map((claim: any) => {
                      const offer = claim.offer
                      const statusColors: Record<string, string> = {
                        REDEEMED: 'bg-green-50 text-green-700',
                        RESERVED: 'bg-blue-50 text-blue-700',
                        EXPIRED: 'bg-gray-50 text-gray-700',
                        CANCELLED: 'bg-red-50 text-red-700',
                      }

                      return (
                        <Link
                          key={claim.id}
                          href={`/merchant/claims`}
                          className="block border border-border p-3 hover:border-primary transition-all bg-white"
                        >
                          <p className="font-semibold text-sm text-text-primary line-clamp-1">
                            {offer?.title || 'Unknown Offer'}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                                statusColors[claim.status] || 'bg-gray-50 text-gray-700'
                              }`}
                            >
                              {claim.status}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {new Date(claim.reservedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-6">
              <h3 className="font-semibold text-text-primary mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/merchant/analytics"
                  className="flex items-center justify-between p-3 bg-white border border-border hover:border-primary transition-colors group"
                >
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary">
                    View Analytics
                  </span>
                  <FiChevronRight className="text-text-tertiary group-hover:text-primary" />
                </Link>
                <Link
                  href="/merchant/customers"
                  className="flex items-center justify-between p-3 bg-white border border-border hover:border-primary transition-colors group"
                >
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary">
                    Customer Insights
                  </span>
                  <FiChevronRight className="text-text-tertiary group-hover:text-primary" />
                </Link>
                <Link
                  href="/merchant/venues"
                  className="flex items-center justify-between p-3 bg-white border border-border hover:border-primary transition-colors group"
                >
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary">
                    Manage Venues
                  </span>
                  <FiChevronRight className="text-text-tertiary group-hover:text-primary" />
                </Link>
                <Link
                  href="/merchant/claims"
                  className="flex items-center justify-between p-3 bg-white border border-border hover:border-primary transition-colors group"
                >
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary">
                    All Claims
                  </span>
                  <FiChevronRight className="text-text-tertiary group-hover:text-primary" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
