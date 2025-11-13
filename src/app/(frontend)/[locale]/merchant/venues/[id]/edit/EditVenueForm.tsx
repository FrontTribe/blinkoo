'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import toast from 'react-hot-toast'

type Props = {
  venue: any
}

export function EditVenueForm({ venue }: Props) {
  const router = useRouter()
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<any[]>(venue.photos || [])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [formData, setFormData] = useState({
    name: venue.name || '',
    description: venue.description || '',
    address: venue.address || '',
    city: venue.city || '',
    country: venue.country || 'Croatia',
    lat: venue.lat?.toString() || '',
    lng: venue.lng?.toString() || '',
    phone: venue.phone || '',
    email: venue.email || '',
  })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingPhoto(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt', 'Venue photo')

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          return data.doc
        }
        throw new Error('Upload failed')
      })

      const uploadedPhotos = await Promise.all(uploadPromises)
      setPhotos([...photos, ...uploadedPhotos])
      toast.success(`${uploadedPhotos.length} photo(s) uploaded!`)
    } catch (error) {
      console.error('Error uploading photos:', error)
      toast.error('Failed to upload photos')
    } finally {
      setUploadingPhoto(false)
    }
  }

  function removePhoto(photoId: string) {
    setPhotos(photos.filter((p) => p.id !== photoId))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/merchant/venues/${venue.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          ...formData,
          photos: photos.map((p) => p.id),
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to update venue')
      }

      toast.success('Venue updated successfully!')
      setTimeout(() => {
        router.push('/merchant/venues')
      }, 500)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Venue Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Address *</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={2}
          className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors resize-none"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">City *</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Country *</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Latitude *</label>
          <input
            type="number"
            step="any"
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Longitude *</label>
          <input
            type="number"
            step="any"
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Venue Photos</label>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploadingPhoto}
            className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          {uploadingPhoto && <p className="text-sm text-text-tertiary">Uploading photos...</p>}

          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url || photo}
                    alt="Venue photo"
                    className="w-full h-32 object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
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
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
