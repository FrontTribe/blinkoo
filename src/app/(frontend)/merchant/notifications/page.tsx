'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FiSend, FiUsers, FiTag, FiArrowLeft } from 'react-icons/fi'

export default function MerchantNotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [target, setTarget] = useState<'offer' | 'custom'>('offer')
  const [offerId, setOfferId] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [message, setMessage] = useState({
    title: '',
    body: '',
    url: '',
  })

  // For demo - in production, fetch from API
  const [availableOffers, setAvailableOffers] = useState<any[]>([])

  async function fetchOffers() {
    try {
      const res = await fetch('/api/merchant/offers', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAvailableOffers(data.offers || [])
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  async function handleSend() {
    if (!message.title || !message.body) {
      toast.error('Please fill in title and message')
      return
    }

    if (target === 'offer' && !offerId) {
      toast.error('Please select an offer')
      return
    }

    if (target === 'custom' && selectedUsers.length === 0) {
      toast.error('Please select at least one user')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/web/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: target === 'offer' ? offerId : undefined,
          userIds: target === 'custom' ? selectedUsers : undefined,
          message,
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Notification sent to ${data.sent} users`)
        setMessage({ title: '', body: '', url: '' })
        setOfferId('')
        setSelectedUsers([])
      } else {
        toast.error(data.error || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/merchant/dashboard"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"
          >
            <FiArrowLeft />
            Back to Dashboard
          </Link>
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
            Send Push Notifications
          </h1>
          <p className="text-text-secondary">
            Notify customers about new offers, updates, or announcements
          </p>
        </div>

        {/* Target Selection */}
        <div className="bg-white border border-border p-6 mb-6">
          <h2 className="font-semibold text-text-primary mb-4">Target Audience</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTarget('offer')}
              className={`p-4 border-2 rounded transition-colors ${
                target === 'offer'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <FiTag className="text-2xl mb-2" />
              <div className="font-medium text-text-primary">Saved Offer Users</div>
              <div className="text-sm text-text-secondary mt-1">
                Send to all users who saved a specific offer
              </div>
            </button>
            <button
              onClick={() => setTarget('custom')}
              className={`p-4 border-2 rounded transition-colors ${
                target === 'custom'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <FiUsers className="text-2xl mb-2" />
              <div className="font-medium text-text-primary">Custom Selection</div>
              <div className="text-sm text-text-secondary mt-1">
                Select specific customers to notify
              </div>
            </button>
          </div>
        </div>

        {/* Target Configuration */}
        {target === 'offer' && (
          <div className="bg-white border border-border p-6 mb-6">
            <label className="block font-medium text-text-primary mb-2">Select Offer</label>
            <select
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
              className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none"
            >
              <option value="">Choose an offer...</option>
              {availableOffers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.title}
                </option>
              ))}
            </select>
            <p className="text-sm text-text-secondary mt-2">
              All users who saved this offer will receive the notification
            </p>
          </div>
        )}

        {target === 'custom' && (
          <div className="bg-white border border-border p-6 mb-6">
            <label className="block font-medium text-text-primary mb-2">Select Customers</label>
            <p className="text-sm text-text-secondary mb-4">
              Customer selection UI would go here (could integrate with customers page)
            </p>
            <button className="px-4 py-2 border border-primary text-primary hover:bg-primary/5">
              Select from Customer List
            </button>
          </div>
        )}

        {/* Message Composition */}
        <div className="bg-white border border-border p-6 mb-6">
          <h2 className="font-semibold text-text-primary mb-4">Notification Message</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium text-text-primary mb-2">Title</label>
              <input
                type="text"
                value={message.title}
                onChange={(e) => setMessage({ ...message, title: e.target.value })}
                placeholder="e.g., New Offer Available!"
                className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none"
                maxLength={50}
              />
              <p className="text-xs text-text-secondary mt-1">{message.title.length}/50</p>
            </div>
            <div>
              <label className="block font-medium text-text-primary mb-2">Message</label>
              <textarea
                value={message.body}
                onChange={(e) => setMessage({ ...message, body: e.target.value })}
                placeholder="e.g., Check out our new special - 50% off on all items!"
                rows={4}
                className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none"
                maxLength={200}
              />
              <p className="text-xs text-text-secondary mt-1">{message.body.length}/200</p>
            </div>
            <div>
              <label className="block font-medium text-text-primary mb-2">
                Link URL (Optional)
              </label>
              <input
                type="url"
                value={message.url}
                onChange={(e) => setMessage({ ...message, url: e.target.value })}
                placeholder="e.g., /offers/offer-slug"
                className="w-full px-4 py-2 border border-border focus:border-primary focus:outline-none"
              />
              <p className="text-xs text-text-secondary mt-1">
                Where users should be taken when they tap the notification
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {message.title && (
          <div className="bg-bg-secondary border border-border p-6 mb-6">
            <h3 className="font-semibold text-text-primary mb-3">Preview</h3>
            <div className="bg-white p-4 border border-border">
              <div className="font-semibold text-text-primary mb-1">{message.title}</div>
              <div className="text-sm text-text-secondary">{message.body}</div>
            </div>
          </div>
        )}

        {/* Send Button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {target === 'offer'
              ? `Will send to all users who saved the selected offer`
              : `Will send to ${selectedUsers.length} selected users`}
          </p>
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-primary text-white px-6 py-3 hover:bg-primary-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ color: 'white' }}
          >
            <FiSend />
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </div>
  )
}
