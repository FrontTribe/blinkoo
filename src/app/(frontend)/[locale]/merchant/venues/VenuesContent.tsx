'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiBarChart2,
  FiExternalLink,
  FiPlus,
  FiChevronRight,
} from 'react-icons/fi'

export default function VenuesContent() {
  const t = useTranslations('merchant.venues')
  const locale = useLocale()
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchVenues() {
    try {
      const response = await fetch(`/api/merchant/venues?locale=${locale}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setVenues(data.venues || [])
      }
    } catch (error) {
      console.error('Error fetching venues:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVenues()
  }, [locale])

  async function handleDelete(venueId: string) {
    if (!confirm(t('deleteConfirm'))) {
      return
    }

    try {
      const response = await fetch(`/api/merchant/venues/${venueId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete venue')
      }

      // Refresh the list
      fetchVenues()
    } catch (error) {
      console.error('Error deleting venue:', error)
      alert(t('deleteError'))
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
          <Link
            href="/merchant/venues/create"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors rounded-lg"
            style={{ color: 'white' }}
          >
            <FiPlus className="w-5 h-5" />
            {t('addVenue')}
          </Link>
        </div>

        {/* Venues Grid or Empty State */}
        {venues.length === 0 ? (
          <div className="bg-white border border-border rounded-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <FiMapPin className="text-primary text-3xl" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-3">
              {t('emptyState.title')}
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              {t('emptyState.description')}
            </p>
            <Link
              href="/merchant/venues/create"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors rounded-lg"
              style={{ color: 'white' }}
            >
              <FiPlus className="w-5 h-5" />
              {t('emptyState.addFirstVenue')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => {
              const venueData = venue as any
              const category = typeof venueData.category === 'object' ? venueData.category : null

              return (
                <div
                  key={venue.id}
                  className="bg-white border border-border rounded-lg overflow-hidden hover:border-primary transition-colors group"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FiMapPin className="text-primary text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-lg font-bold text-text-primary line-clamp-1 mb-1">
                          {venueData.name}
                        </h3>
                        {category && (
                          <p className="text-xs font-medium text-primary uppercase tracking-wide">
                            {category.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Location */}
                    <div>
                      <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                        {venueData.address}
                      </p>
                      <p className="text-xs text-text-tertiary">{venueData.city}</p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${
                          venueData.status === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            venueData.status === 'active' ? 'bg-green-600' : 'bg-gray-400'
                          }`}
                        />
                        {venueData.status === 'active' ? t('active') : t('inactive')}
                      </span>
                    </div>

                    {/* Map Link */}
                    {venueData.lat && venueData.lng && (
                      <a
                        href={`https://maps.google.com?q=${venueData.lat},${venueData.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-medium"
                      >
                        <FiExternalLink className="w-4 h-4" />
                        {t('viewOnMap')}
                      </a>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-bg-secondary border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/merchant/venues/${venue.id}/analytics`}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-white rounded transition-colors"
                        title={t('card.viewAnalytics')}
                      >
                        <FiBarChart2 className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/merchant/venues/${venue.id}/edit`}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-white rounded transition-colors"
                        title={t('card.editVenue')}
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(venue.id)}
                        className="p-2 text-text-secondary hover:text-error hover:bg-white rounded transition-colors"
                        title={t('card.deleteVenue')}
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <Link
                      href={`/merchant/venues/${venue.id}/edit`}
                      className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
                    >
                      {t('manage')} <FiChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Helpful Tip */}
        {venues.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FiMapPin className="text-blue-600 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">{t('tips.title')}</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>{t('tips.tip1')}</li>
                  <li>{t('tips.tip2')}</li>
                  <li>{t('tips.tip3')}</li>
                  <li>{t('tips.tip4')}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
