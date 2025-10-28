'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import { DatePicker } from '@/components/DatePicker'

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
        toast.success('Photo uploaded!')
      } else {
        toast.error('Failed to upload photo')
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

      toast.success(isEdit ? 'Offer updated successfully!' : 'Offer created successfully!')

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
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/merchant/offers"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          ← Back to offers
        </Link>

        <div className="bg-white border border-border p-10">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-6">
            {isEdit ? 'Edit Offer' : 'Create New Offer'}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Offer Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Offer Photo
              </label>
              <div className="space-y-3">
                {photoPreview && (
                  <div className="relative w-48 h-48 border border-border overflow-hidden">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploadingPhoto}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {uploadingPhoto && <p className="text-sm text-text-tertiary">Uploading...</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Venue *</label>
              <select
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Offer Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                  required
                >
                  <option value="percent">Percentage Discount</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="bogo">Buy One Get One</option>
                  <option value="addon">Free Add-on</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Discount Value *
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                  placeholder={formData.type === 'percent' ? '20' : '10'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Terms & Conditions
              </label>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {!isEdit && (
              <div className="border-t border-[#EBEBEB] pt-6">
                <h3 className="font-semibold text-text-primary mb-2">Initial Time Slot</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Define the first available time slot. You can add more slots later from the offer
                  detail page.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <DatePicker
                    label="Start Date & Time *"
                    value={formData.startsAt}
                    onChange={(value) => setFormData({ ...formData, startsAt: value })}
                    required
                  />
                  <DatePicker
                    label="End Date & Time *"
                    value={formData.endsAt}
                    onChange={(value) => setFormData({ ...formData, endsAt: value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Total Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.qtyTotal}
                      onChange={(e) => setFormData({ ...formData, qtyTotal: e.target.value })}
                      className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                      placeholder="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Release Mode *
                    </label>
                    <select
                      value={formData.mode}
                      onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                      className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                      required
                    >
                      <option value="flash">Flash (all at once)</option>
                      <option value="drip">Drip (gradual release)</option>
                    </select>
                  </div>
                </div>
                {formData.mode === 'drip' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Drip Every (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.dripEveryMinutes}
                        onChange={(e) =>
                          setFormData({ ...formData, dripEveryMinutes: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Drip Quantity
                      </label>
                      <input
                        type="number"
                        value={formData.dripQty}
                        onChange={(e) => setFormData({ ...formData, dripQty: e.target.value })}
                        className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                        placeholder="10"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-[#EBEBEB] pt-6">
              <h3 className="font-semibold text-text-primary mb-3">Per-User Controls</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                    className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Cooldown (min)
                  </label>
                  <input
                    type="number"
                    value={formData.cooldownMinutes}
                    onChange={(e) => setFormData({ ...formData, cooldownMinutes: e.target.value })}
                    className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Geofence (km)
                  </label>
                  <input
                    type="number"
                    value={formData.geofenceKm}
                    onChange={(e) => setFormData({ ...formData, geofenceKm: e.target.value })}
                    className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-white text-text-primary border border-border hover:border-primary transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                style={{ color: 'white' }}
              >
                {loading
                  ? isEdit
                    ? 'Saving...'
                    : 'Creating...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Offer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
