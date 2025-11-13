'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { OfferForm } from '../../create/OfferForm'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useLocale, useTranslations } from 'next-intl'

export default function EditOfferPage() {
  const router = useRouter()
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('merchant.offers')
  const offerId = params.id as string
  const [offer, setOffer] = useState<any>(null)
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch offer with locale
        const offerResponse = await fetch(`/api/merchant/offers/${offerId}?locale=${locale}`, {
          credentials: 'include',
        })

        if (offerResponse.ok) {
          const offerData = await offerResponse.json()
          setOffer(offerData.offer)
        }

        // Fetch venues with locale
        const venuesResponse = await fetch(`/api/merchant/venues?locale=${locale}`, {
          credentials: 'include',
        })

        if (venuesResponse.ok) {
          const venuesData = await venuesResponse.json()
          setVenues(venuesData.venues || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (offerId) {
      fetchData()
    }
  }, [offerId, locale])

  if (loading) {
    return <LoadingSpinner message={t('loading')} />
  }

  if (!offer || venues.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-black border border-gray-800 p-8 max-w-md">
          <h2 className="font-heading text-2xl font-bold text-white mb-4">Offer Not Found</h2>
          <Link
            href="/merchant/offers"
            className="block text-center bg-orange-primary text-white py-3 px-6 hover:bg-orange-light transition-colors"
          >
            Back to Offers
          </Link>
        </div>
      </div>
    )
  }

  return <OfferForm venues={venues} offer={offer} isEdit={true} />
}
