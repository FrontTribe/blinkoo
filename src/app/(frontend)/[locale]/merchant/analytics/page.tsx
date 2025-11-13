'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  FiArrowLeft,
  FiTrendingUp,
  FiClock,
  FiUsers,
  FiPercent,
  FiDownload,
  FiTarget,
  FiZap,
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
  const t = useTranslations('merchant.analytics')
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
    return <LoadingSpinner message={t('loading')} />
  }

  return (
    <div className="min-h-screen bg-white py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
              {t('title')}
            </h1>
            <p className="mt-2 text-sm md:text-base text-text-secondary">{t('subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`inline-flex items-center gap-2 text-sm font-semibold border px-4 py-2 transition-colors ${
                showComparison
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary'
              }`}
            >
              <FiTrendingUp className="w-4 h-4" />
              {showComparison ? 'Hide Comparison' : 'Show Comparison'}
            </button>
            <button
              onClick={() => {
                const params = new URLSearchParams()
                if (startDate) params.set('startDate', startDate)
                if (endDate) params.set('endDate', endDate)
                window.open(`/api/merchant/analytics/export?${params.toString()}`, '_blank')
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold bg-white text-text-secondary border border-border px-4 py-2 hover:border-primary transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              {t('export')}
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Date Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                {t('dateRange.startDate')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-border text-text-primary text-sm rounded focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                {t('dateRange.endDate')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-border text-text-primary text-sm rounded focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* Key Performance Indicators */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <FiPercent className="text-green-600 text-lg" />
                  </div>
                  <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    {t('metrics.fillRate')}
                  </h3>
                </div>
                <p className="font-heading text-3xl font-bold text-green-600 mb-1">
                  {analytics.fillRate}
                </p>
                <p className="text-xs text-text-secondary">{t('metrics.fillRate')}</p>
              </div>

              <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FiTarget className="text-blue-600 text-lg" />
                  </div>
                  <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    {t('metrics.redemptionRate')}
                  </h3>
                </div>
                <p className="font-heading text-3xl font-bold text-blue-600 mb-1">
                  {analytics.redemptionRate}
                </p>
                <p className="text-xs text-text-secondary">{t('metrics.redemptionRate')}</p>
              </div>

              <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <FiUsers className="text-purple-600 text-lg" />
                  </div>
                  <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    {t('metrics.repeatCustomerRate')}
                  </h3>
                </div>
                <p className="font-heading text-3xl font-bold text-purple-600 mb-1">
                  {analytics.repeatCustomerRate}
                </p>
                <p className="text-xs text-text-secondary">{t('metrics.repeatCustomerRate')}</p>
              </div>

              <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <FiZap className="text-amber-600 text-lg" />
                  </div>
                  <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    {t('metrics.uplift')}
                  </h3>
                </div>
                <p className="font-heading text-3xl font-bold text-amber-600 mb-1">
                  {analytics.uplift}
                </p>
                <p className="text-xs text-text-secondary">{t('metrics.uplift')}</p>
              </div>
            </div>

            {/* Overview Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="bg-white border border-border p-5 rounded-lg">
                <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                  {t('metrics.totalOffers')}
                </h3>
                <p className="text-2xl font-bold text-text-primary">{analytics.totalOffers}</p>
              </div>

              <div className="bg-white border border-border p-5 rounded-lg">
                <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                  {t('metrics.totalClaims')}
                </h3>
                <p className="text-2xl font-bold text-text-primary">{analytics.totalClaims}</p>
              </div>

              <div className="bg-white border border-border p-5 rounded-lg">
                <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                  {t('metrics.redeemed')}
                </h3>
                <p className="text-2xl font-bold text-primary">{analytics.redeemedClaims}</p>
              </div>

              <div className="bg-white border border-border p-5 rounded-lg">
                <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                  {t('metrics.expired')}
                </h3>
                <p className="text-2xl font-bold text-error">{analytics.expiredClaims}</p>
              </div>

              <div className="bg-white border border-border p-5 rounded-lg">
                <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                  {t('metrics.reserved')}
                </h3>
                <p className="text-2xl font-bold text-text-primary">{analytics.reservedClaims}</p>
              </div>
            </div>

            {/* Performance Insights - Two Column */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Performing Offers */}
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                  <h2 className="font-heading text-lg font-bold text-text-primary">
                    Najuspješnije ponude
                  </h2>
                </div>
                <div className="p-6">
                  {analytics.topOffers.length === 0 ? (
                    <p className="text-text-tertiary text-sm text-center py-6">Nema dostupnih podataka</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.topOffers.map((offer, index) => (
                        <Link
                          key={offer.id}
                          href={`/merchant/offers/${offer.id}`}
                          className="flex items-center justify-between p-3 border border-border hover:border-primary bg-bg-secondary hover:bg-white transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0
                                  ? 'bg-primary text-white'
                                  : index === 1
                                    ? 'bg-primary/80 text-white'
                                    : index === 2
                                      ? 'bg-primary/60 text-white'
                                      : 'bg-primary/20 text-primary'
                              }`}
                            >
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                              {offer.title}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-primary">{offer.count}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Popular Time Slots */}
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-transparent">
                  <h2 className="font-heading text-lg font-bold text-text-primary">
                    Popularni termini
                  </h2>
                </div>
                <div className="p-6">
                  {analytics.popularSlots.length === 0 ? (
                    <p className="text-text-tertiary text-sm text-center py-6">Nema dostupnih podataka</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.popularSlots.map((slot, index) => (
                        <div
                          key={slot.time}
                          className="flex items-center justify-between p-3 border border-border bg-bg-secondary"
                        >
                          <div className="flex items-center gap-3">
                            <FiClock className="text-text-tertiary w-4 h-4" />
                            <span className="text-sm font-medium text-text-primary">
                              {slot.time}
                            </span>
                          </div>
                          <span className="bg-white border border-border px-3 py-1 text-xs font-semibold">
                            {slot.count} rezervacija
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timing Insights Section */}
            {timingInsights && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white border border-border rounded-lg p-6">
                  <TimingHeatmap
                    hourlyData={timingInsights.hourlyData}
                    dailyData={timingInsights.dailyData}
                    coldHours={timingInsights.coldHours}
                  />
                </div>
                <div className="bg-white border border-border rounded-lg p-6">
                  <SuggestedTimeslots slots={timingInsights.suggestedSlots} />
                </div>
              </div>
            )}

            {/* Performance Benchmarking */}
            {benchmarks && benchmarks.merchantPerformance && benchmarks.merchantPerformance.length > 0 && (
              <div className="bg-white border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <FiTrendingUp className="text-green-600 text-lg" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-text-primary">
                      Usporedba performansi
                    </h2>
                    <p className="text-sm text-text-secondary">Kako stojite u odnosu na prosjek industrije</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {benchmarks.merchantPerformance.map((perf: any, index: number) => (
                    <div
                      key={index}
                      className="border border-border p-5 rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-text-primary">{perf.categoryName}</h3>
                          {perf.badges && perf.badges.length > 0 && (
                            <div className="flex gap-2">
                              {perf.badges.map((badge: string, idx: number) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    badge === 'Top Performer'
                                      ? 'bg-green-100 text-green-700'
                                      : badge === 'High Conversion'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-orange-100 text-orange-700'
                                  }`}
                                >
                                  {t(`badges.${badge === 'Top Performer' ? 'topPerformer' : badge === 'High Conversion' ? 'highConversion' : 'needsImprovement'}`)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-2xl font-bold ${
                              perf.difference >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {perf.difference >= 0 ? '+' : ''}
                            {perf.difference.toFixed(1)}%
                          </span>
                          <div className="text-xs text-text-secondary">u odnosu na prosjek industrije</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-bg-secondary p-3 rounded">
                          <div className="text-xs font-medium text-text-secondary mb-1">Vaša stopa</div>
                          <div className="text-xl font-bold text-text-primary">
                            {perf.merchantRate.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-bg-secondary p-3 rounded">
                          <div className="text-xs font-medium text-text-secondary mb-1">
                            Prosjek industrije
                          </div>
                          <div className="text-xl font-bold text-text-primary">
                            {perf.benchmarkRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs font-medium text-text-secondary">
                        Nalazite se u <span className="text-primary font-bold">{perf.percentile}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-800">
                    <strong>ℹ️ Napomena:</strong> Referentne vrijednosti izračunate su na temelju ponuda u istoj kategoriji
                    svih trgovaca. Vaš percentil pokazuje vaš konkurentski položaj.
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
