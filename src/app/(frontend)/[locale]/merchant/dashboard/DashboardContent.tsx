'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { FiTrendingUp, FiClock, FiUsers, FiDollarSign, FiAlertCircle, FiChevronRight, FiCheckCircle } from 'react-icons/fi'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function DashboardContent() {
  const t = useTranslations('merchant.dashboard')
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
    return <LoadingSpinner message={t('loading')} />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white p-10 max-w-md w-full mx-4 border border-border">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">
            {t('loginRequired')}
          </h2>
          <p className="text-text-secondary mb-6">{t('loginRequiredMessage')}</p>
          <Link
            href="/auth/login"
            className="block bg-primary text-white py-4 px-6 text-center hover:bg-primary-hover transition-colors font-semibold"
            style={{ color: 'white' }}
          >
            {t('login')}
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
              {t('title')}
            </h1>
            <p className="mt-2 text-sm md:text-base text-text-secondary">
              {t('welcome', { name: user?.name || t('merchant') })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/merchant/offers/create"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors rounded-lg"
              style={{ color: 'white' }}
            >
              {t('createOffer')}
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
                  <h3 className="font-semibold text-error mb-1">{t('lowStockWarning')}</h3>
                  <p className="text-sm text-text-secondary">
                    {t('lowStockMessage', { count: lowStockCount })}
                  </p>
                </div>
                <Link
                  href="/merchant/offers"
                  className="text-sm font-semibold text-error hover:text-error/80"
                >
                  {t('viewOffers')}
                </Link>
              </div>
            )}
            {endingSoonCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <FiClock className="text-amber-600 text-xl flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">{t('endingSoon')}</h3>
                  <p className="text-sm text-amber-700">
                    {t('endingSoonMessage', { count: endingSoonCount })}
                  </p>
                </div>
                <Link
                  href="/merchant/offers"
                  className="text-sm font-semibold text-amber-900 hover:text-amber-800"
                >
                  {t('viewOffers')}
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
                {t('metrics.totalOffers')}
              </h3>
            </div>
            <p className="font-heading text-3xl font-bold text-text-primary">{offers.length}</p>
            <p className="text-xs text-text-secondary mt-2">
              {liveSlots.length} {t('metrics.activeNow')}
            </p>
          </div>

          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-lg" />
              </div>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                {t('metrics.todayReservations')}
              </h3>
            </div>
            <p className="font-heading text-3xl font-bold text-primary">
              {todayStats?.summary?.totalClaims || 0}
            </p>
            {todayStats?.summary && (
              <p className="text-xs text-text-secondary mt-2">
                {todayStats.summary.redeemedClaims} {t('metrics.redeemed')}
              </p>
            )}
          </div>

          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FiTrendingUp className="text-blue-600 text-lg" />
              </div>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                {t('metrics.fillRate')}
              </h3>
            </div>
            <p className="font-heading text-3xl font-bold text-blue-600">
              {todayStats?.summary?.fillRate || '0%'}
            </p>
            {todayStats?.summary && (
              <p className="text-xs text-text-secondary mt-2">
                {todayStats.summary.totalClaimed}/{todayStats.summary.totalCapacity}{' '}
                {t('metrics.ofCapacity')}
              </p>
            )}
          </div>

          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <FiClock className="text-purple-600 text-lg" />
              </div>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                {t('metrics.activeSlots')}
              </h3>
            </div>
            <p className="font-heading text-3xl font-bold text-purple-600">{liveSlots.length}</p>
            <p className="text-xs text-text-secondary mt-2">
              {t('metrics.activeOffersCurrentlyRunning')}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Live Slots - Left Side (2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-border">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold text-text-primary">
                  {t('liveSlots.title')}
                </h2>
                {liveSlots.length > 0 && (
                  <Link
                    href="/merchant/offers"
                    className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    {t('liveSlots.viewAll')} <FiChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              <div className="p-6">
                {liveSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto rounded-full bg-bg-secondary flex items-center justify-center mb-4">
                      <FiUsers className="text-text-tertiary text-2xl" />
                    </div>
                    <p className="text-text-tertiary font-medium mb-2">
                      {t('liveSlots.noActiveSlots')}
                    </p>
                    <Link
                      href="/merchant/offers/create"
                      className="text-primary hover:text-primary-hover text-sm font-semibold inline-flex items-center gap-1"
                    >
                      {t('liveSlots.createFirstOffer')} <FiChevronRight className="w-4 h-4" />
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
                                {offer?.title || t('liveSlots.unnamedOffer')}
                              </h3>
                              <p className="text-xs text-text-secondary truncate">
                                {venue?.name || t('liveSlots.unknownLocation')}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                {isLowStock && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-error/10 text-error text-xs font-medium rounded">
                                    <FiAlertCircle className="w-3 h-3" />
                                    {t('liveSlots.lowStock')}
                                  </span>
                                )}
                                {hoursUntilEnd <= 2 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded">
                                    <FiClock className="w-3 h-3" />
                                    {t('liveSlots.endingSoon')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-lg font-bold text-primary">
                                {slot.qtyRemaining}
                              </div>
                              <div className="text-xs text-text-secondary">
                                {t('liveSlots.of')} {slot.qtyTotal} {t('liveSlots.remaining')}
                              </div>
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
                  {t('recentActivity.title')}
                </h2>
                {recentClaims.length > 0 && (
                  <Link
                    href="/merchant/claims"
                    className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    {t('recentActivity.viewAll')} <FiChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              <div className="p-6">
                {recentClaims.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-text-tertiary text-sm">
                      {t('recentActivity.noRecentReservations')}
                    </p>
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
                            {offer?.title || t('recentActivity.unknownOffer')}
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
              <h3 className="font-semibold text-text-primary mb-4">{t('quickLinks.title')}</h3>
              <div className="space-y-2">
                <Link
                  href="/merchant/analytics"
                  className="flex items-center justify-between p-3 bg-white border border-border hover:border-primary transition-colors group"
                >
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary">
                    {t('quickLinks.viewAnalytics')}
                  </span>
                  <FiChevronRight className="text-text-tertiary group-hover:text-primary" />
                </Link>
                <Link
                  href="/merchant/customers"
                  className="flex items-center justify-between p-3 bg-white border border-border hover:border-primary transition-colors group"
                >
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary">
                    {t('quickLinks.customerInsights')}
                  </span>
                  <FiChevronRight className="text-text-tertiary group-hover:text-primary" />
                </Link>
                <Link
                  href="/merchant/venues"
                  className="flex items-center justify-between p-3 bg-white border border-border hover:border-primary transition-colors group"
                >
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary">
                    {t('quickLinks.manageVenues')}
                  </span>
                  <FiChevronRight className="text-text-tertiary group-hover:text-primary" />
                </Link>
                <Link
                  href="/merchant/claims"
                  className="flex items-center justify-between p-3 bg-white border border-border hover:border-primary transition-colors group"
                >
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary">
                    {t('quickLinks.allReservations')}
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
