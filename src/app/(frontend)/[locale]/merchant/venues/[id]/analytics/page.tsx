'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { FiArrowLeft, FiTrendingUp, FiUsers, FiCalendar } from 'react-icons/fi'
import { BarChart } from '@/components/charts/BarChart'

export default function VenueAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('merchant.analytics')
  const venueId = params.id as string
  const [venue, setVenue] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [topOffers, setTopOffers] = useState<any[]>([])
  const [hourlyBreakdown, setHourlyBreakdown] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null)
        const response = await fetch(`/api/merchant/venues/${venueId}/analytics`, {
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Nepoznata greška' }))
          setError(errorData.error || 'Učitavanje analitike nije uspjelo')
          setLoading(false)
          return
        }

        const data = await response.json()
        setVenue(data.venue)
        setStats(data.stats)
        setTopOffers(data.topOffers || [])
        setHourlyBreakdown(data.hourlyBreakdown || null)
      } catch (error) {
        console.error('Error fetching venue analytics:', error)
        setError('Greška pri učitavanju analitike. Molimo pokušajte ponovno.')
      } finally {
        setLoading(false)
      }
    }

    if (venueId) {
      fetchData()
    }
  }, [venueId])

  if (loading) {
    return <LoadingSpinner message={t('loading')} />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary mb-4 text-red-600">{error}</p>
          <Link href="/merchant/venues" className="text-primary hover:text-primary-hover">
            Natrag na lokacije
          </Link>
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary mb-4">Lokacija nije pronađena</p>
          <Link href="/merchant/venues" className="text-primary hover:text-primary-hover">
            Natrag na lokacije
          </Link>
        </div>
      </div>
    )
  }

  const hourlyData =
    hourlyBreakdown?.claims?.map((item: any) => ({
      hour: `${item.hour.toString().padStart(2, '0')}:00`,
      claims: item.count,
    })) || []

  const topOffersChart =
    topOffers.map((offer: any) => ({
      offer: offer.title || 'Nepoznata ponuda',
      claims: offer.claims || 0,
    })) || []

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/merchant/venues"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <FiArrowLeft />
          Natrag na lokacije
        </Link>

        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
            Analitika - {venue.name}
          </h1>
          <p className="text-text-secondary">
            {venue.address}, {venue.city}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white border border-border p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FiCalendar className="text-primary" />
              <h3 className="text-xs font-medium text-text-secondary uppercase">Ukupno Ponuda</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-text-primary">
              {stats?.totalOffers || 0}
            </p>
          </div>
          <div className="bg-white border border-border p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FiUsers className="text-green-600" />
              <h3 className="text-xs font-medium text-text-secondary uppercase">Stopa Iskorištenja</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-green-600">
              {stats?.redemptionRate || 0}%
            </p>
          </div>
          <div className="bg-white border border-border p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FiTrendingUp className="text-yellow-600" />
              <h3 className="text-xs font-medium text-text-secondary uppercase">Stopa Ispunjenosti</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-yellow-600">
              {stats?.fillRate || 0}%
            </p>
          </div>
          <div className="bg-white border border-border p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FiUsers className="text-blue-600" />
              <h3 className="text-xs font-medium text-text-secondary uppercase">Ukupno Rezervacija</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-blue-600">
              {stats?.totalClaims || 0}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white border border-border p-6 rounded-lg">
            <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Najprometniji Sati
            </h2>
            {hourlyData.length > 0 ? (
              <BarChart
                data={hourlyData}
                bars={[{ key: 'claims', name: 'Rezervacije', color: '#3B82F6' }]}
                xAxisKey="hour"
                height={300}
              />
            ) : (
              <p className="text-text-tertiary text-center py-8">Nema dostupnih podataka</p>
            )}
          </div>

          <div className="bg-white border border-border p-6 rounded-lg">
            <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Najbolje Ponude
            </h2>
            {topOffersChart.length > 0 ? (
              <BarChart
                data={topOffersChart}
                bars={[{ key: 'claims', name: 'Rezervacije', color: '#10B981' }]}
                xAxisKey="offer"
                height={300}
              />
            ) : (
              <p className="text-text-tertiary text-center py-8">Još nema ponuda</p>
            )}
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="mt-8 bg-white border border-border p-6 rounded-lg">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Detaljna Statistika
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-text-secondary uppercase mb-1">Iskorišteno</p>
              <p className="text-2xl font-bold text-green-600">{stats?.redeemedClaims || 0}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase mb-1">Isteklo</p>
              <p className="text-2xl font-bold text-red-600">{stats?.expiredClaims || 0}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase mb-1">Rezervirano</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.reservedClaims || 0}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase mb-1">Ukupni Kapacitet</p>
              <p className="text-2xl font-bold text-text-primary">{stats?.totalCapacity || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
