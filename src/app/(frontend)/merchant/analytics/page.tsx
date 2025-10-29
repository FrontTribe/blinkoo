'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FiArrowLeft,
  FiTrendingUp,
  FiClock,
  FiUsers,
  FiDollarSign,
  FiPercent,
  FiDownload,
} from 'react-icons/fi'
import { TimingHeatmap } from '@/components/merchant/TimingHeatmap'
import { SuggestedTimeslots } from '@/components/merchant/SuggestedTimeslots'

type AnalyticsData = {
  totalOffers: number
  totalClaims: number
  redeemedClaims: number
  expiredClaims: number
  reservedClaims: number
  totalRevenue: number
  redemptionRate: string
  fillRate: string
  avgTimeToRedemption: string
  repeatCustomerRate: string
  uplift: string
  popularSlots: Array<{ time: string; count: number }>
  topOffers: Array<{ id: string; title: string; count: number }>
  categoryPerformance: Array<{
    id: string
    name: string
    claims: number
    redemptions: number
    redemptionRate: string
    fillRate: number
  }>
  offerFillRates: Array<{
    id: string
    title: string
    fillRate: string
    capacity: number
    claimed: number
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [comparison, setComparison] = useState<any>(null)
  const [timingInsights, setTimingInsights] = useState<any>(null)
  const [benchmarks, setBenchmarks] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    fetchAnalytics()
    fetchComparison()
    fetchTimingInsights()
    fetchBenchmarks()
  }, [startDate, endDate])

  async function fetchTimingInsights() {
    try {
      const response = await fetch('/api/merchant/analytics/timing-insights', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setTimingInsights(data)
      }
    } catch (error) {
      console.error('Error fetching timing insights:', error)
    }
  }

  async function fetchBenchmarks() {
    try {
      const response = await fetch('/api/merchant/analytics/benchmarks', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setBenchmarks(data)
      }
    } catch (error) {
      console.error('Error fetching benchmarks:', error)
    }
  }

  async function fetchComparison() {
    try {
      const response = await fetch('/api/merchant/analytics/comparison?period=week', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setComparison(data)
      }
    } catch (error) {
      console.error('Error fetching comparison:', error)
    }
  }

  async function fetchAnalytics() {
    setLoading(true)
    try {
      let url = '/api/merchant/analytics'
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      if (params.toString()) url += '?' + params.toString()

      const response = await fetch(url, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <div className="text-text-secondary text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-text-primary mb-1">Analytics</h1>
            <p className="text-sm text-text-secondary">Performance metrics and insights</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 text-sm font-medium text-text-primary border border-border px-4 py-2 hover:bg-bg-secondary transition-colors"
            >
              <FiTrendingUp />
              {showComparison ? 'Hide' : 'Show'} Comparison
            </button>
            <button
              onClick={() => {
                const params = new URLSearchParams()
                if (startDate) params.set('startDate', startDate)
                if (endDate) params.set('endDate', endDate)
                window.open(`/api/merchant/analytics/export?${params.toString()}`, '_blank')
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-text-primary border border-border px-4 py-2 hover:bg-bg-secondary transition-colors"
            >
              <FiDownload />
              Export CSV
            </button>
            <Link
              href="/merchant/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-text-primary border border-border px-4 py-2 hover:bg-bg-secondary transition-colors"
            >
              <FiArrowLeft />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6 bg-white border border-border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm focus:border-text-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm focus:border-text-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Comparison View */}
        {showComparison && comparison && (
          <div className="bg-white border border-primary p-6 mb-6">
            <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Week Comparison
            </h2>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase">
                  Total Claims
                </h3>
                <p className="text-2xl font-bold text-text-primary">
                  {comparison.currentPeriod.stats.totalClaims}
                </p>
                <p
                  className={`text-sm font-medium ${
                    parseFloat(comparison.changes.totalClaims) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {parseFloat(comparison.changes.totalClaims) >= 0 ? '↑' : '↓'}{' '}
                  {Math.abs(parseFloat(comparison.changes.totalClaims))}%
                </p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase">Redeemed</h3>
                <p className="text-2xl font-bold text-primary">
                  {comparison.currentPeriod.stats.redeemed}
                </p>
                <p
                  className={`text-sm font-medium ${
                    parseFloat(comparison.changes.redeemed) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {parseFloat(comparison.changes.redeemed) >= 0 ? '↑' : '↓'}{' '}
                  {Math.abs(parseFloat(comparison.changes.redeemed))}%
                </p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase">Expired</h3>
                <p className="text-2xl font-bold text-error">
                  {comparison.currentPeriod.stats.expired}
                </p>
                <p
                  className={`text-sm font-medium ${
                    parseFloat(comparison.changes.expired) >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {parseFloat(comparison.changes.expired) >= 0 ? '↑' : '↓'}{' '}
                  {Math.abs(parseFloat(comparison.changes.expired))}%
                </p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase">Reserved</h3>
                <p className="text-2xl font-bold text-text-primary">
                  {comparison.currentPeriod.stats.reserved}
                </p>
                <p
                  className={`text-sm font-medium ${
                    parseFloat(comparison.changes.reserved) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {parseFloat(comparison.changes.reserved) >= 0 ? '↑' : '↓'}{' '}
                  {Math.abs(parseFloat(comparison.changes.reserved))}%
                </p>
              </div>
            </div>
            <p className="text-xs text-text-tertiary mt-4">
              Comparing {comparison.currentPeriod.start} to {comparison.currentPeriod.end} vs{' '}
              {comparison.previousPeriod.start} to {comparison.previousPeriod.end}
            </p>
          </div>
        )}

        {analytics && (
          <>
            {/* Primary Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="bg-white border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiTrendingUp className="text-primary text-base" />
                  <h3 className="text-xs font-medium text-text-secondary uppercase">Fill Rate</h3>
                </div>
                <p className="font-heading text-3xl font-bold text-text-primary">
                  {analytics.fillRate}
                </p>
              </div>

              <div className="bg-white border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiPercent className="text-primary text-base" />
                  <h3 className="text-xs font-medium text-text-secondary uppercase">
                    Redemption Rate
                  </h3>
                </div>
                <p className="font-heading text-3xl font-bold text-text-primary">
                  {analytics.redemptionRate}
                </p>
              </div>

              <div className="bg-white border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiClock className="text-primary text-base" />
                  <h3 className="text-xs font-medium text-text-secondary uppercase">
                    Avg Time to Redemption
                  </h3>
                </div>
                <p className="font-heading text-3xl font-bold text-text-primary">
                  {analytics.avgTimeToRedemption}
                </p>
              </div>

              <div className="bg-white border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="text-primary text-base" />
                  <h3 className="text-xs font-medium text-text-secondary uppercase">
                    Repeat Customer Rate
                  </h3>
                </div>
                <p className="font-heading text-3xl font-bold text-text-primary">
                  {analytics.repeatCustomerRate}
                </p>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
              <div className="bg-white border border-border p-4">
                <h3 className="text-xs font-medium text-text-secondary uppercase mb-2">
                  Total Offers
                </h3>
                <p className="text-2xl font-bold text-text-primary">{analytics.totalOffers}</p>
              </div>

              <div className="bg-white border border-border p-4">
                <h3 className="text-xs font-medium text-text-secondary uppercase mb-2">
                  Total Claims
                </h3>
                <p className="text-2xl font-bold text-text-primary">{analytics.totalClaims}</p>
              </div>

              <div className="bg-white border border-border p-4">
                <h3 className="text-xs font-medium text-text-secondary uppercase mb-2">Redeemed</h3>
                <p className="text-2xl font-bold text-primary">{analytics.redeemedClaims}</p>
              </div>

              <div className="bg-white border border-border p-4">
                <h3 className="text-xs font-medium text-text-secondary uppercase mb-2">Expired</h3>
                <p className="text-2xl font-bold text-error">{analytics.expiredClaims}</p>
              </div>

              <div className="bg-white border border-border p-4">
                <h3 className="text-xs font-medium text-text-secondary uppercase mb-2">Active</h3>
                <p className="text-2xl font-bold text-text-primary">{analytics.reservedClaims}</p>
              </div>
            </div>

            {/* Uplift Metric */}
            <div className="mb-6 bg-white border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiTrendingUp className="text-primary text-lg" />
                <h2 className="font-heading text-lg font-semibold text-text-primary">
                  Foot Traffic Uplift
                </h2>
              </div>
              <p className="text-3xl font-bold text-primary">{analytics.uplift}</p>
              <p className="text-xs text-text-secondary mt-1">
                Estimated increase in foot traffic from offers
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Category Performance */}
              <div className="bg-white border border-border">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="font-heading text-base font-semibold text-text-primary">
                    Category Performance
                  </h2>
                </div>
                <div className="p-4">
                  {analytics.categoryPerformance.length === 0 ? (
                    <p className="text-text-tertiary text-sm text-center py-6">No data available</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics.categoryPerformance.map((cat, index) => (
                        <div key={cat.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-secondary">
                              {index + 1}.
                            </span>
                            <span className="text-sm text-text-primary">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-secondary">{cat.claims} claims</span>
                            <span className="bg-bg-secondary border border-border px-2 py-0.5 text-xs font-medium">
                              {cat.redemptionRate}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Offer Fill Rates */}
              <div className="bg-white border border-border">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="font-heading text-base font-semibold text-text-primary">
                    Fill Rate by Offer
                  </h2>
                </div>
                <div className="p-4">
                  {analytics.offerFillRates.length === 0 ? (
                    <p className="text-text-tertiary text-sm text-center py-6">No data available</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics.offerFillRates.map((offer, index) => (
                        <Link
                          key={offer.id}
                          href={`/merchant/offers/${offer.id}`}
                          className="flex items-center justify-between hover:bg-bg-secondary transition-colors p-2 -mx-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-secondary">
                              {index + 1}.
                            </span>
                            <span className="text-sm text-text-primary">{offer.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-secondary">
                              {offer.claimed}/{offer.capacity}
                            </span>
                            <span
                              className="bg-primary text-white px-2 py-0.5 text-xs font-medium"
                              style={{ color: 'white' }}
                            >
                              {offer.fillRate}%
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mt-6">
              {/* Popular Time Slots */}
              <div className="bg-white border border-border">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="font-heading text-base font-semibold text-text-primary">
                    Popular Time Slots
                  </h2>
                </div>
                <div className="p-4">
                  {analytics.popularSlots.length === 0 ? (
                    <p className="text-text-tertiary text-sm text-center py-6">No data available</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics.popularSlots.map((slot, index) => (
                        <div key={slot.time} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-secondary">
                              {index + 1}.
                            </span>
                            <span className="text-sm text-text-primary">{slot.time}</span>
                          </div>
                          <span className="bg-bg-secondary border border-border px-2 py-0.5 text-xs font-medium">
                            {slot.count} claims
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Offers */}
              <div className="bg-white border border-border">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="font-heading text-base font-semibold text-text-primary">
                    Top Performing Offers
                  </h2>
                </div>
                <div className="p-4">
                  {analytics.topOffers.length === 0 ? (
                    <p className="text-text-tertiary text-sm text-center py-6">No data available</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics.topOffers.map((offer, index) => (
                        <Link
                          key={offer.id}
                          href={`/merchant/offers/${offer.id}`}
                          className="flex items-center justify-between hover:bg-bg-secondary transition-colors p-2 -mx-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-secondary">
                              {index + 1}.
                            </span>
                            <span className="text-sm text-text-primary">{offer.title}</span>
                          </div>
                          <span
                            className="bg-primary text-white px-2 py-0.5 text-xs font-medium"
                            style={{ color: 'white' }}
                          >
                            {offer.count}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timing Insights Section */}
            {timingInsights && (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="bg-white border border-border p-6">
                  <TimingHeatmap
                    hourlyData={timingInsights.hourlyData}
                    dailyData={timingInsights.dailyData}
                    coldHours={timingInsights.coldHours}
                  />
                </div>
                <div className="bg-white border border-border p-6">
                  <SuggestedTimeslots slots={timingInsights.suggestedSlots} />
                </div>
              </div>
            )}

            {/* Performance Benchmarking Section */}
            {benchmarks &&
              benchmarks.merchantPerformance &&
              benchmarks.merchantPerformance.length > 0 && (
                <div className="mt-6 bg-white border border-border p-6">
                  <h2 className="font-heading text-xl font-bold text-text-primary mb-4">
                    Performance vs Industry Benchmarks
                  </h2>
                  <div className="space-y-4">
                    {benchmarks.merchantPerformance.map((perf: any, index: number) => (
                      <div
                        key={index}
                        className="border border-border p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-text-primary">{perf.categoryName}</h3>
                            {perf.badges && perf.badges.length > 0 && (
                              <div className="flex gap-2">
                                {perf.badges.map((badge: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                                      badge === 'Top Performer'
                                        ? 'bg-green-100 text-green-700'
                                        : badge === 'High Conversion'
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-orange-100 text-orange-700'
                                    }`}
                                  >
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-sm font-semibold ${
                                perf.difference >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {perf.difference >= 0 ? '+' : ''}
                              {perf.difference.toFixed(1)}%
                            </span>
                            <div className="text-xs text-text-secondary">vs industry avg</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <div className="text-xs text-text-secondary mb-1">Your Fill Rate</div>
                            <div className="text-lg font-bold text-text-primary">
                              {perf.merchantRate.toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-text-secondary mb-1">Industry Average</div>
                            <div className="text-lg font-bold text-text-primary">
                              {perf.benchmarkRate.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span
                            className={`text-xs font-medium ${
                              perf.percentile === 'Top 10%'
                                ? 'text-green-600'
                                : perf.percentile === 'Top 25%'
                                  ? 'text-blue-600'
                                  : 'text-text-secondary'
                            }`}
                          >
                            Percentile: {perf.percentile}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-blue-50 border border-blue-200 p-4">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> Benchmarks are calculated from offers in the same
                      category across all merchants. Your percentile ranking shows how you compare.
                    </p>
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  )
}
