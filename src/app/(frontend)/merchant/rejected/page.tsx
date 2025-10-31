'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FiAlertCircle, FiMail, FiRefreshCw, FiCheck } from 'react-icons/fi'

export default function RejectedPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [merchant, setMerchant] = useState<any>(null)
  const [resubmitting, setResubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    notes: '',
  })

  useEffect(() => {
    fetchMerchantData()
  }, [])

  async function fetchMerchantData() {
    try {
      const response = await fetch('/api/merchant/info', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        if (data.merchant) {
          setMerchant(data.merchant)
          setFormData({
            name: data.merchant.name || '',
            description: data.merchant.description || '',
            notes: '',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching merchant data:', error)
    }
  }

  async function handleResubmit(e: React.FormEvent) {
    e.preventDefault()
    setResubmitting(true)

    try {
      const response = await fetch('/api/merchant/resubmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        toast.success('Your account has been resubmitted for review')
        router.push('/merchant/pending-approval')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to resubmit')
      }
    } catch (error) {
      console.error('Error resubmitting:', error)
      toast.error('Failed to resubmit. Please try again.')
    } finally {
      setResubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-error/10 border-b border-border px-6 py-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-error flex items-center justify-center mb-4">
              <FiAlertCircle className="text-white text-3xl" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
              Account Rejected
            </h1>
            <p className="text-text-secondary">
              Your merchant account application was not approved
            </p>
          </div>

          {/* Rejection Reason */}
          {merchant?.rejectionReason && (
            <div className="px-6 py-6 bg-amber-50 border-b border-border">
              <h2 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <FiAlertCircle className="text-amber-600" />
                Rejection Reason
              </h2>
              <p className="text-sm text-text-secondary whitespace-pre-line">
                {merchant.rejectionReason}
              </p>
            </div>
          )}

          {/* Resubmission Form */}
          <form onSubmit={handleResubmit} className="px-6 py-8 space-y-6">
            <div>
              <h2 className="font-semibold text-text-primary mb-4">
                Update Your Information
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                Please review your business information and make any necessary updates before
                resubmitting for approval.
              </p>
            </div>

            {/* Business Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                Business Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your business name"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Business Description
              </label>
              <textarea
                id="description"
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your business"
              />
            </div>

            {/* Resubmission Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-text-primary mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Any additional information you'd like to share..."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={resubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'white' }}
              >
                {resubmitting ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    Resubmit for Review
                  </>
                )}
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-white text-text-secondary border border-border px-6 py-3 rounded-lg hover:border-primary transition-colors font-semibold"
              >
                <FiMail />
                Contact Support
              </Link>
            </div>
          </form>

          {/* Help Section */}
          <div className="px-6 py-6 bg-bg-secondary border-t border-border">
            <p className="text-sm text-text-secondary text-center">
              Need help? Contact our support team and we&apos;ll be happy to assist you.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-primary hover:text-primary-hover text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

