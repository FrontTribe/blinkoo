'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiClock, FiCheckCircle, FiXCircle, FiArrowLeft, FiFilter } from 'react-icons/fi'
import { LoadingSpinner } from '@/components/LoadingSpinner'

type Redemption = {
  id: string
  code: string
  offerTitle: string
  customerName: string
  redeemedAt: string
  status: 'redeemed' | 'failed'
}

export default function StaffHistoryPage() {
  const router = useRouter()
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('today')

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/users/me', { credentials: 'include' })
        if (response.ok) {
          const user = await response.json()
          // Check if user is staff, merchant_owner, or admin
          if (user.role === 'staff' || user.role === 'merchant_owner' || user.role === 'admin') {
            setAuthenticated(true)
            fetchHistory()
          } else {
            router.push('/auth/login?redirect=/staff/history')
          }
        } else {
          router.push('/auth/login?redirect=/staff/history')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/login?redirect=/staff/history')
      } finally {
        setAuthLoading(false)
      }
    }

    async function fetchHistory() {
      try {
        setLoading(true)
        const res = await fetch(`/api/staff/history?filter=${filter}`, {
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()
          setRedemptions(data.redemptions || [])
        } else {
          console.error('Failed to fetch history:', await res.text())
          setRedemptions([])
        }
      } catch (error) {
        console.error('Error fetching history:', error)
        setRedemptions([])
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [filter, router])

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 1000 / 60)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  if (authLoading || loading || !authenticated) {
    return <LoadingSpinner message="Loading..." />
  }

  return (
    <div className="min-h-screen bg-white py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/staff/dashboard"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FiClock className="text-blue-600 text-3xl" />
            </div>
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
                Redemption History
              </h1>
              <p className="mt-1 text-sm md:text-base text-text-secondary">
                View your past redemptions and activity
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FiFilter className="text-primary text-lg" />
            <h2 className="text-sm font-semibold text-text-primary">Filter by Period</h2>
          </div>
          <div className="flex gap-2">
            {(['all', 'today', 'week'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-semibold rounded transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border text-text-secondary hover:border-primary'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        {redemptions.length === 0 ? (
          <div className="bg-white border border-border rounded-lg p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-6">
              <FiClock className="text-text-tertiary text-4xl" />
            </div>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-2">
              No Redemptions Found
            </h2>
            <p className="text-text-secondary">
              {filter === 'today'
                ? 'No redemptions today yet'
                : filter === 'week'
                  ? 'No redemptions this week'
                  : 'No redemptions found'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-transparent">
              <h2 className="font-heading text-lg font-bold text-text-primary">
                {filter.charAt(0).toUpperCase() + filter.slice(1)} Redemptions ({redemptions.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {redemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="p-6 hover:bg-[#F7F7F7] transition-colors flex items-center gap-4"
                >
                  <div className="flex-shrink-0">
                    {redemption.status === 'redeemed' ? (
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <FiCheckCircle className="text-green-600 text-2xl" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <FiXCircle className="text-red-600 text-2xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-text-primary">{redemption.offerTitle}</h3>
                      <span className="text-xs font-medium text-text-tertiary whitespace-nowrap">
                        {formatTime(redemption.redeemedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-mono font-medium">#{redemption.code}</span>
                      </span>
                      <span>•</span>
                      <span>{redemption.customerName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
