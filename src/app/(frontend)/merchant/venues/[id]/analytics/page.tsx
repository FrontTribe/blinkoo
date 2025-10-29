'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiTrendingUp, FiUsers, FiCalendar } from 'react-icons/fi'
import { BarChart } from '@/components/charts/BarChart'

export default function VenueAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const venueId = params.id as string
  const [venue, setVenue] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/merchant/venues/${venueId}/analytics`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setVenue(data.venue)
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching venue analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    if (venueId) {
      fetchData()
    }
  }, [venueId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-primary">Loading analytics...</p>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary mb-4">Venue not found</p>
          <Link href="/merchant/venues" className="text-primary hover:text-primary-hover">
            Back to venues
          </Link>
        </div>
      </div>
    )
  }

  const hourlyData =
    stats?.hourlyBreakdown?.claims.map((item: any) => ({
      hour: `${item.hour}:00`,
      claims: item.count,
    })) || []

  const topOffersChart =
    stats?.topOffers.map((offer: any) => ({
      offer: offer.title,
      claims: offer.claims,
    })) || []

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/merchant/venues"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <FiArrowLeft />
          Back to venues
        </Link>

        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
            {venue.name} Analytics
          </h1>
          <p className="text-text-secondary">
            {venue.address}, {venue.city}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white border border-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <FiCalendar className="text-primary" />
              <h3 className="text-xs font-medium text-text-secondary uppercase">Total Offers</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-text-primary">
              {stats?.totalOffers || 0}
            </p>
          </div>
          <div className="bg-white border border-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <FiUsers className="text-green-600" />
              <h3 className="text-xs font-medium text-text-secondary uppercase">Redemption Rate</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-green-600">
              {stats?.redemptionRate || 0}%
            </p>
          </div>
          <div className="bg-white border border-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <FiTrendingUp className="text-yellow-600" />
              <h3 className="text-xs font-medium text-text-secondary uppercase">Fill Rate</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-yellow-600">
              {stats?.fillRate || 0}%
            </p>
          </div>
          <div className="bg-white border border-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <FiUsers className="text-blue-600" />
              <h3 className="text-xs font-medium text-text-secondary uppercase">Total Claims</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-blue-600">
              {stats?.totalClaims || 0}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white border border-border p-6">
            <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Peak Hours
            </h2>
            {hourlyData.length > 0 ? (
              <BarChart
                data={hourlyData}
                bars={[{ key: 'claims', name: 'Claims', color: '#3B82F6' }]}
                xAxisKey="hour"
                height={300}
              />
            ) : (
              <p className="text-text-tertiary text-center py-8">No data available</p>
            )}
          </div>

          <div className="bg-white border border-border p-6">
            <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Top Offers
            </h2>
            {topOffersChart.length > 0 ? (
              <BarChart
                data={topOffersChart}
                bars={[{ key: 'claims', name: 'Claims', color: '#10B981' }]}
                xAxisKey="offer"
                height={300}
              />
            ) : (
              <p className="text-text-tertiary text-center py-8">No offers yet</p>
            )}
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="mt-8 bg-white border border-border p-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Detailed Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-text-secondary uppercase mb-1">Redeemed</p>
              <p className="text-2xl font-bold text-green-600">{stats?.redeemedClaims || 0}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase mb-1">Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats?.expiredClaims || 0}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase mb-1">Reserved</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.reservedClaims || 0}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase mb-1">Total Capacity</p>
              <p className="text-2xl font-bold text-text-primary">{stats?.totalCapacity || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
