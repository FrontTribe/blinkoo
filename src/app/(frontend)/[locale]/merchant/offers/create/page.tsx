'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { OfferForm } from './OfferForm'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useLocale, useTranslations } from 'next-intl'

export default function CreateOfferPage() {
  const locale = useLocale()
  const t = useTranslations('merchant.venues')
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

    fetchVenues()
  }, [locale])

  if (loading) {
    return <LoadingSpinner message={t('loading')} />
  }

  if (venues.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white border border-border p-10 max-w-md">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">Nema Lokacija</h2>
          <p className="text-text-secondary mb-6">
            Morate prvo kreirati lokaciju prije kreiranja ponuda.
          </p>
          <Link
            href="/merchant/venues/create"
            className="block text-center bg-primary text-white py-4 px-6 hover:bg-primary-hover transition-colors font-semibold"
            style={{ color: 'white' }}
          >
            Kreiraj Lokaciju
          </Link>
        </div>
      </div>
    )
  }

  return <OfferForm venues={venues} />
}
