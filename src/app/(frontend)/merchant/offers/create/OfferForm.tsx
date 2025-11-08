'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import { DatePicker } from '@/components/DatePicker'
import { FiArrowLeft, FiInfo } from 'react-icons/fi'
import { HelpTooltip } from '@/components/HelpTooltip'

type Venue = {
  id: string
  name: string
  category?: {
    id: string
    name: string
    slug: string
  }
}

type Props = {
  venues: Venue[]
  offer?: any
  isEdit?: boolean
}

export function OfferForm({ venues, offer, isEdit = false }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(offer?.photo || null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoId, setPhotoId] = useState<string | null>(offer?.photo || null)

  const [formData, setFormData] = useState({
    title: offer?.title || '',
    description: offer?.description || '',
    terms: offer?.terms || '',
    type: offer?.type || 'percent',
    discountValue: offer?.discountValue?.toString() || '',
    perUserLimit: offer?.perUserLimit?.toString() || '1',
    cooldownMinutes: offer?.cooldownMinutes?.toString() || '0',
    geofenceKm: offer?.geofenceKm?.toString() || '0',
    venueId: offer?.venue?.id || venues[0]?.id || '',
    // Offer Slot fields (only used when creating, not editing)
    startsAt: '',
    endsAt: '',
    qtyTotal: '',
    mode: 'flash',
    dripEveryMinutes: '',
    dripQty: '',
  })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Payload
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', 'Offer photo')

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setPhotoId(data.doc.id)
        toast.success('Slika je učitana!')
      } else {
        toast.error('Učitavanje slike nije uspjelo')
        setPhotoFile(null)
        setPhotoPreview(offer?.photo || null)
      }
    } catch (error) {
      toast.error('Failed to upload photo')
      setPhotoFile(null)
      setPhotoPreview(offer?.photo || null)
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isEdit ? `/api/merchant/offers/${offer.id}` : '/api/merchant/offers'
      const method = isEdit ? 'PUT' : 'POST'

      const submitData = {
        ...formData,
        photo: photoId,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} offer`)
      }

      toast.success(isEdit ? 'Ponuda je uspješno ažurirana!' : 'Ponuda je uspješno kreirana!')

      // Small delay before redirect to show toast
      setTimeout(() => {
        router.push('/merchant/offers')
      }, 500)
    } catch (err: any) {
      toast.error(err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/merchant/offers"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Natrag na Ponude
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            {isEdit ? 'Uredi Ponudu' : 'Kreiraj Novu Ponudu'}
          </h1>
          <p className="mt-2 text-sm md:text-base text-text-secondary">
            {isEdit
              ? 'Ažurirajte detalje i postavke svoje ponude'
              : 'Ispunite detalje u nastavku da kreirate novu ponudu'}
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
                Naslov Ponude <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                placeholder="e.g., Happy Hour Special"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Opis</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors resize-none rounded"
                placeholder="Describe what makes this offer special..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Slika Ponude</label>
              <div className="space-y-3">
                {photoPreview && (
                  <div className="relative w-32 h-32 border border-border rounded-lg overflow-hidden">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploadingPhoto}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
                />
                {uploadingPhoto && <p className="text-sm text-text-tertiary">Učitavanje...</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Lokacija <span className="text-error">*</span>
              </label>
              <select
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                required
              >
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                    {venue.category ? ` (${venue.category.name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Offer Details */}
          <div className="bg-white border border-border rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <FiInfo className="text-primary text-lg" />
              <h2 className="font-heading text-lg font-bold text-text-primary">Detalji Ponude</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Vrsta Ponude <span className="text-error">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                  required
                >
                  <option value="percent">Postotak Popusta</option>
                  <option value="fixed">Fiksni Iznos Popusta</option>
                  <option value="bogo">Kupi Jedan Dobij Jedan</option>
                  <option value="addon">Besplatno Dodatno</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Vrijednost Popusta <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                  placeholder={formData.type === 'percent' ? '20' : '10'}
                  required
                />
                <p className="text-xs text-text-secondary mt-1">
                  {formData.type === 'percent' ? 'Postotak (npr., 20 za 20%)' : 'Iznos u eurima'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Uvjeti i Odredbe
              </label>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors resize-none rounded"
                placeholder="Terms, restrictions, or special conditions..."
              />
            </div>
          </div>

          {/* Initial Time Slot */}
          {!isEdit && (
            <div className="bg-white border border-border rounded-lg p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <FiInfo className="text-primary text-lg" />
                <h2 className="font-heading text-lg font-bold text-text-primary">Početni Vremenski Slot</h2>
              </div>
              <p className="text-sm text-text-secondary bg-blue-50 border border-blue-200 rounded-lg p-3">
                Definirajte prvi dostupan vremenski slot. Možete dodati više slotova kasnije sa stranice detalja ponude.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DatePicker
                  label="Datum i Vrijeme Početka"
                  value={formData.startsAt}
                  onChange={(value) => setFormData({ ...formData, startsAt: value })}
                  required
                />
                <DatePicker
                  label="Datum i Vrijeme Završetka"
                  value={formData.endsAt}
                  onChange={(value) => setFormData({ ...formData, endsAt: value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Ukupna Količina <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.qtyTotal}
                    onChange={(e) => setFormData({ ...formData, qtyTotal: e.target.value })}
                    className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Način Otpuštanja <span className="text-error">*</span>
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                    required
                  >
                    <option value="flash">Flash (sve odjednom)</option>
                    <option value="drip">Drip (postupno otpuštanje)</option>
                  </select>
                </div>
              </div>

              {formData.mode === 'drip' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Drip Svakih (minuta)
                    </label>
                    <input
                      type="number"
                      value={formData.dripEveryMinutes}
                      onChange={(e) =>
                        setFormData({ ...formData, dripEveryMinutes: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                      placeholder="15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">
                      Drip Količina
                    </label>
                    <input
                      type="number"
                      value={formData.dripQty}
                      onChange={(e) => setFormData({ ...formData, dripQty: e.target.value })}
                      className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                      placeholder="10"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Advanced Settings */}
          <div className="bg-white border border-border rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <FiInfo className="text-primary text-lg" />
              <h2 className="font-heading text-lg font-bold text-text-primary">Napredne Postavke</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                  Limit po Korisniku
                  <HelpTooltip
                    content="Maksimalan broj ponuda koje jedan korisnik može rezervirati za ovu ponudu. Ostavite prazno ili 0 za neograničeno."
                    position="top"
                  />
                </label>
                <input
                  type="number"
                  value={formData.perUserLimit}
                  onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                  Cooldown (min)
                  <HelpTooltip
                    content="Vrijeme u minutama koje korisnik mora pričekati između rezervacija iste ponude. Sprječava prebrzo višestruko rezerviranje."
                    position="top"
                  />
                </label>
                <input
                  type="number"
                  value={formData.cooldownMinutes}
                  onChange={(e) => setFormData({ ...formData, cooldownMinutes: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                  Geofence (km)
                  <HelpTooltip
                    content="Maksimalna udaljenost u kilometrima od lokacije na kojoj korisnici mogu vidjeti i rezervirati ovu ponudu. 0 znači da nema geografskog ograničenja."
                    position="top"
                  />
                </label>
                <input
                  type="number"
                  value={formData.geofenceKm}
                  onChange={(e) => setFormData({ ...formData, geofenceKm: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors rounded"
                  placeholder="0"
                />
              </div>
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
              {loading
                ? isEdit
                  ? 'Spremanje...'
                  : 'Kreiranje...'
                : isEdit
                  ? 'Spremi Promjene'
                  : 'Kreiraj Ponudu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
