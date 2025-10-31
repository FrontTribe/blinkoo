'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiX, FiMail, FiPhone, FiLock, FiUsers, FiMapPin } from 'react-icons/fi'

type Venue = {
  id: string
  name: string
}

type StaffMember = {
  id: string
  name: string
  email: string
  phone?: string
  venues?: Array<{ venue: { id: string; name?: string } }>
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  venues: Venue[]
  staffMember?: StaffMember | null
}

export default function StaffModal({ isOpen, onClose, onSuccess, venues, staffMember }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    venueIds: [] as string[],
  })

  useEffect(() => {
    if (staffMember) {
      setFormData({
        name: staffMember.name || '',
        email: staffMember.email || '',
        phone: staffMember.phone || '',
        password: '',
        venueIds:
          staffMember.venues?.map((v) =>
            typeof v.venue === 'object' ? String(v.venue.id) : String(v.venue),
          ) || [],
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        venueIds: [],
      })
    }
  }, [staffMember, isOpen])

  if (!isOpen) return null

  function handleVenueToggle(venueId: string) {
    setFormData((prev) => ({
      ...prev,
      venueIds: prev.venueIds.includes(venueId)
        ? prev.venueIds.filter((id) => id !== venueId)
        : [...prev.venueIds, venueId],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      toast.error('Name and email are required')
      return
    }

    // Password required for new staff members
    if (!staffMember && !formData.password) {
      toast.error('Password is required for new staff members')
      return
    }

    if (formData.venueIds.length === 0) {
      toast.error('Please assign at least one venue')
      return
    }

    setLoading(true)

    try {
      if (staffMember) {
        // Update existing staff
        const response = await fetch(`/api/merchant/staff/${staffMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            venueIds: formData.venueIds,
          }),
        })

        if (response.ok) {
          toast.success('Staff member updated successfully')
          onSuccess()
        } else {
          const data = await response.json()
          toast.error(data.error || 'Failed to update staff member')
        }
      } else {
        // Create new staff
        const response = await fetch('/api/merchant/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            venueIds: formData.venueIds,
          }),
        })

        if (response.ok) {
          toast.success('Staff member created successfully')
          onSuccess()
        } else {
          const data = await response.json()
          toast.error(data.error || 'Failed to create staff member')
        }
      }
    } catch (error) {
      console.error('Error saving staff member:', error)
      toast.error('Failed to save staff member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-heading text-xl font-bold text-text-primary">
              {staffMember ? 'Edit Staff Member' : 'Add Staff Member'}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {staffMember
                ? 'Update staff member information and venue assignments'
                : 'Create a new staff account with venue assignments'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Basic Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiUsers className="text-primary text-lg" />
              <h3 className="font-semibold text-text-primary">Basic Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {!staffMember && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    Password *
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                    <input
                      type="password"
                      id="password"
                      required={!staffMember}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Minimum 8 characters. Staff member will use this to log in.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Venue Assignments */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiMapPin className="text-primary text-lg" />
              <h3 className="font-semibold text-text-primary">Venue Assignments *</h3>
            </div>
            {venues.length === 0 ? (
              <div className="bg-bg-secondary border border-border rounded-lg p-6 text-center">
                <p className="text-text-secondary">
                  No venues available. Please create a venue first.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {venues.map((venue) => (
                  <label
                    key={venue.id}
                    className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.venueIds.includes(String(venue.id))}
                      onChange={() => handleVenueToggle(String(venue.id))}
                      className="w-5 h-5 border-border rounded focus:ring-2 focus:ring-primary text-primary"
                    />
                    <span className="text-sm font-medium text-text-primary">{venue.name}</span>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-text-secondary mt-2">
              Staff members can only access features for their assigned venues
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white text-text-secondary border border-border hover:border-primary transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary text-white hover:bg-primary-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'white' }}
            >
              {loading ? 'Saving...' : staffMember ? 'Update Staff Member' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

