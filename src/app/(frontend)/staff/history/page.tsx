'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi'

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
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center pb-20 md:pb-4">
        <p className="text-text-primary">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl font-bold text-text-primary mb-6">
          Redemption History
        </h1>

        {/* Filter */}
        <div className="bg-white border border-border p-4 mb-6">
          <div className="flex gap-2">
            {(['all', 'today', 'week'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-hover'
                }`}
                style={filter === f ? { color: 'white' } : undefined}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        {redemptions.length === 0 ? (
          <div className="bg-white border border-border p-12 text-center">
            <FiClock className="text-5xl text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary mb-2">No redemptions found</p>
            <p className="text-sm text-text-tertiary">
              {filter === 'today'
                ? 'No redemptions today yet'
                : filter === 'week'
                  ? 'No redemptions this week'
                  : 'No redemptions found'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {redemptions.map((redemption) => (
              <div
                key={redemption.id}
                className="bg-white border border-border p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  {redemption.status === 'redeemed' ? (
                    <FiCheckCircle className="text-success text-2xl" />
                  ) : (
                    <FiXCircle className="text-error text-2xl" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-text-primary mb-1">
                      {redemption.offerTitle}
                    </div>
                    <div className="text-sm text-text-secondary">
                      Code: {redemption.code} • {redemption.customerName}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-text-tertiary">
                  {formatTime(redemption.redeemedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
