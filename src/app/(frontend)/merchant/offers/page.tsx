'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiPackage, FiPlus, FiChevronRight, FiSearch, FiEdit2 } from 'react-icons/fi'
import Image from 'next/image'

export default function ManageOffersPage() {
  const [offers, setOffers] = useState<any[]>([])
  const [filteredOffers, setFilteredOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchOffers() {
      try {
        const response = await fetch('/api/merchant/offers', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setOffers(data.offers || [])
          setFilteredOffers(data.offers || [])
        }
      } catch (error) {
        console.error('Error fetching offers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  // Filter offers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOffers(offers)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = offers.filter((offer: any) => {
      const title = offer.title?.toLowerCase() || ''
      const description = offer.description?.toLowerCase() || ''
      const venueName = offer.venue?.name?.toLowerCase() || ''

      return title.includes(query) || description.includes(query) || venueName.includes(query)
    })
    setFilteredOffers(filtered)
  }, [searchQuery, offers])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-secondary text-sm">Učitavanje ponuda...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
              Upravljaj Ponudama
            </h1>
            <p className="mt-2 text-sm md:text-base text-text-secondary">
              Kreirajte i upravljajte svojim ponudama
            </p>
          </div>
          <Link
            href="/merchant/offers/create"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors"
            style={{ color: 'white' }}
          >
            <FiPlus className="w-5 h-5" />
            Kreiraj Ponudu
          </Link>
        </div>

        {/* Search Bar */}
        {offers.length > 0 && (
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
            <input
              type="text"
              placeholder="Pretražite ponude po naslovu, opisu ili lokaciji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-border text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
        )}

        {/* Offers Grid or Empty State */}
        {filteredOffers.length === 0 && !loading ? (
          <div className="bg-white border border-border rounded-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <FiPackage className="text-primary text-3xl" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-3">
              {offers.length === 0 ? 'Još nema ponuda' : `Nema rezultata za "${searchQuery}"`}
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              {offers.length === 0
                ? 'Kreirajte svoju prvu ponudu da počnete privlačiti kupce tijekom praznih sati.'
                : 'Pokušajte s drugim pojmom za pretragu ili očistite pretragu da vidite sve ponude.'}
            </p>
            {offers.length === 0 ? (
              <Link
                href="/merchant/offers/create"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors"
                style={{ color: 'white' }}
              >
                <FiPlus className="w-5 h-5" />
                Kreirajte Svoju Prvu Ponudu
              </Link>
            ) : (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-2 bg-white text-text-secondary border border-border px-6 py-3 hover:border-primary font-semibold transition-colors"
              >
                Očisti Pretragu
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOffers.map((offer) => {
              const offerData = offer as any
              const venue = offerData.venue
              const isActive = offerData.status === 'active'

              return (
                <div
                  key={offer.id}
                  className="bg-white border border-border rounded-lg overflow-hidden hover:border-primary transition-all group"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-start gap-4">
                      {offerData.photo ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                          {typeof offerData.photo === 'object' && offerData.photo.url ? (
                            <Image
                              src={offerData.photo.url}
                              alt={offerData.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
                              <span className="text-text-tertiary text-xs">Nema slike</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FiPackage className="text-primary text-2xl" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-lg font-bold text-text-primary line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                          {offerData.title}
                        </h3>
                        <p className="text-xs font-medium text-text-secondary">
                          {venue?.name || 'Nepoznata Lokacija'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Description */}
                    {offerData.description && (
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {offerData.description}
                      </p>
                    )}

                    {/* Offer Type Badge */}
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border bg-bg-secondary border-border">
                        {offerData.type === 'percent' && `${offerData.discountValue}% POPUSTA`}
                        {offerData.type === 'fixed' && `€${offerData.discountValue} POPUSTA`}
                        {offerData.type === 'bogo' && 'BOGO'}
                        {offerData.type === 'addon' && 'Besplatno Dodatno'}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${
                          isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-green-600' : 'bg-gray-400'
                          }`}
                        />
                        {isActive ? 'Aktivno' : 'Neaktivno'}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-bg-secondary border-t border-border flex items-center justify-between">
                    <Link
                      href={`/merchant/offers/${offer.id}`}
                      className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
                    >
                      Pogledaj Detalje <FiChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/merchant/offers/${offer.id}/edit`}
                      className="p-2 text-text-secondary hover:text-primary hover:bg-white rounded transition-colors"
                      title="Uredi ponudu"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Helpful Tip */}
        {offers.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FiPackage className="text-blue-600 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Savjeti za Upravljanje Ponudama</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Kreirajte više vremenskih slotova za istu ponudu da maksimizirate pokrivenost</li>
                  <li>• Pratite stope ispunjenosti da optimizirate cijene i vrijeme</li>
                  <li>• Koristite drip način rada za postupno otpuštanje slotova tijekom dana</li>
                  <li>• Prilagodite geofence postavke da ciljate pravi radijus kupaca</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
