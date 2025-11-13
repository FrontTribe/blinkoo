'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { FiArrowLeft, FiMapPin, FiPhone, FiMail, FiInfo, FiClock } from 'react-icons/fi'
import { LocationMap } from '@/components/LocationMap'
import { VenueHoursEditor } from '@/components/VenueHoursEditor'
import mapboxgl from 'mapbox-gl'

export default function CreateVenuePage() {
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const mapInstance = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    lat: '',
    lng: '',
    phone: '',
    email: '',
    category: '',
    openHours: {},
  })

  const [categories, setCategories] = useState<any[]>([])

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/web/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Handle map load
  function handleMapLoad(map: mapboxgl.Map) {
    mapInstance.current = map

    // Add marker if coordinates exist
    if (formData.lat && formData.lng) {
      const lat = parseFloat(formData.lat)
      const lng = parseFloat(formData.lng)
      if (!isNaN(lat) && !isNaN(lng)) {
        marker.current = new mapboxgl.Marker({
          color: '#ff385c',
        })
          .setLngLat([lng, lat])
          .addTo(map)
      }
    }
  }

  // Update marker when coordinates change
  useEffect(() => {
    if (!mapInstance.current || !formData.lat || !formData.lng) return

    const lat = parseFloat(formData.lat)
    const lng = parseFloat(formData.lng)

    if (isNaN(lat) || isNaN(lng)) return

    try {
      if (marker.current) {
        marker.current.remove()
        marker.current = null
      }

      marker.current = new mapboxgl.Marker({
        color: '#ff385c',
      })
        .setLngLat([lng, lat])
        .addTo(mapInstance.current)

      mapInstance.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1500,
      })
    } catch (error) {
      console.error('Error updating marker:', error)
    }
  }, [formData.lat, formData.lng])

  async function searchLocation(query: string) {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    if (!mapboxToken) {
      console.warn('Mapbox token not found')
      return
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&limit=5&proximity=15.9819,45.815&country=hr`,
      )
      const data = await response.json()
      setSuggestions(data.features || [])
      setShowSuggestions(true)
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  function selectSuggestion(suggestion: any) {
    const [lng, lat] = suggestion.geometry.coordinates

    // Extract details from Mapbox response
    const components: any = {}
    suggestion.context?.forEach((item: any) => {
      const id = item.id.split('.')[0]
      if (id === 'place') components.city = item.text
      if (id === 'postcode') components.postalCode = item.text
      if (id === 'country') components.country = item.text
    })

    setFormData({
      ...formData,
      name: suggestion.text || '',
      address: suggestion.place_name || '',
      city: components.city || '',
      country: components.country || '',
      postalCode: components.postalCode || '',
      lat: lat.toString(),
      lng: lng.toString(),
    })

    setSuggestions([])
    setShowSuggestions(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/merchant/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          name: formData.name,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          phone: formData.phone,
          email: formData.email,
          category: formData.category,
          openHours: formData.openHours,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Kreiranje lokacije nije uspjelo')
      }

      const result = await response.json()

      // Force a hard refresh to show the new venue
      window.location.href = '/merchant/venues'
    } catch (err: any) {
      console.error('Venue creation error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/merchant/venues"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Natrag na Lokacije
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Dodaj Novu Lokaciju
          </h1>
          <p className="mt-2 text-sm md:text-base text-text-secondary">
            Kreirajte novu lokaciju gdje će vaše ponude biti dostupne
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white border border-border rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <FiInfo className="text-primary text-lg" />
              <h2 className="font-heading text-lg font-bold text-text-primary">Osnovne Informacije</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Naziv Lokacije <span className="text-error">*</span>
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                  placeholder="e.g., Downtown Coffee Shop"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Opis</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors resize-none rounded"
                placeholder="Kratak opis vaše lokacije..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Kategorija <span className="text-error">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                required
              >
                <option value="">Odaberite kategoriju</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white border border-border rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <FiMapPin className="text-primary text-lg" />
              <h2 className="font-heading text-lg font-bold text-text-primary">Lokacija</h2>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Pretraži Lokaciju <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pretražite adresu..."
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value })
                    searchLocation(e.target.value)
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                  required
                />
                <FiMapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-bg-secondary border-b border-border last:border-0 transition-colors"
                    >
                      <div className="font-medium text-text-primary">{suggestion.text}</div>
                      <div className="text-sm text-text-secondary">{suggestion.place_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Grad</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Država</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Poštanski Broj</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                />
              </div>
            </div>

            {/* Map preview */}
            {formData.lat && formData.lng ? (
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Pregled Lokacije
                </label>
                <div className="border border-border rounded-lg overflow-hidden">
                  <LocationMap
                    center={[parseFloat(formData.lng), parseFloat(formData.lat)]}
                    zoom={15}
                    onLoad={handleMapLoad}
                  />
                </div>
                <p className="mt-2 text-xs text-text-tertiary">
                  Koordinate: {formData.lat}, {formData.lng}
                </p>
              </div>
            ) : (
              <div className="bg-bg-secondary border border-border rounded-lg p-12 text-center">
                <FiMapPin className="text-text-tertiary text-4xl mx-auto mb-3" />
                <p className="text-text-secondary text-sm">
                  Pretražite adresu gore da vidite lokaciju na karti
                </p>
              </div>
            )}

            {/* Hidden lat/lng inputs for form submission */}
            <input type="hidden" name="lat" value={formData.lat} />
            <input type="hidden" name="lng" value={formData.lng} />
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-border rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <FiMail className="text-primary text-lg" />
              <h2 className="font-heading text-lg font-bold text-text-primary">Kontakt Informacije</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Telefon</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                    placeholder="+385 XX XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">E-pošta</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                    placeholder="venue@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="bg-white border border-border rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <FiClock className="text-primary text-lg" />
              <h2 className="font-heading text-lg font-bold text-text-primary">Radno Vrijeme</h2>
            </div>

            <div>
              <p className="text-sm text-text-secondary mb-4">
                Postavite radno vrijeme svoje lokacije. Ovo pomaže kupcima da znaju kada ste otvoreni.
              </p>
              <VenueHoursEditor
                initialHours={formData.openHours}
                onChange={(hours) => setFormData({ ...formData, openHours: hours })}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white text-text-secondary border border-border hover:border-primary transition-colors font-semibold rounded"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold rounded"
              style={{ color: 'white' }}
            >
              {loading ? 'Kreiranje...' : 'Kreiraj Lokaciju'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
