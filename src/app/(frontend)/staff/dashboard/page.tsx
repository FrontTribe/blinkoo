'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiShoppingCart, FiTrendingUp, FiClock } from 'react-icons/fi'

export default function StaffDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    todayRedeemed: 0,
    weekRedeemed: 0,
    pendingRedemptions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/users/me', { credentials: 'include' })
        if (response.ok) {
          const user = await response.json()
          // Check if user is staff, merchant_owner, or admin
          if (user.role === 'staff' || user.role === 'merchant_owner' || user.role === 'admin') {
            setAuthenticated(true)
            fetchStats()
          } else {
            router.push('/auth/login?redirect=/staff/dashboard')
          }
        } else {
          router.push('/auth/login?redirect=/staff/dashboard')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/login?redirect=/staff/dashboard')
      } finally {
        setLoading(false)
      }
    }

    async function fetchStats() {
      try {
        // In a real app, fetch from API
        // const res = await fetch('/api/staff/dashboard', { credentials: 'include' })
        setStats({
          todayRedeemed: 12,
          weekRedeemed: 47,
          pendingRedemptions: 3,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    checkAuth()
  }, [router])

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center pb-20 md:pb-4">
        <p className="text-text-primary">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl font-bold text-text-primary mb-8">Staff Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-border p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{stats.todayRedeemed}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">Today</div>
          </div>
          <div className="bg-white border border-border p-4 text-center">
            <div className="text-2xl font-bold text-text-primary mb-1">{stats.weekRedeemed}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">This Week</div>
          </div>
          <div className="bg-white border border-border p-4 text-center">
            <div className="text-2xl font-bold text-warning mb-1">{stats.pendingRedemptions}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">Pending</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-border p-6 mb-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/staff/redeem"
              className="flex items-center gap-3 p-4 border border-border hover:border-primary transition-colors"
            >
              <FiShoppingCart className="text-xl text-primary" />
              <span className="font-medium text-text-primary">Redeem Claim</span>
            </Link>
            <Link
              href="/staff/history"
              className="flex items-center gap-3 p-4 border border-border hover:border-primary transition-colors"
            >
              <FiClock className="text-xl text-primary" />
              <span className="font-medium text-text-primary">View History</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
