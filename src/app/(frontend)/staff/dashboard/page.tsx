'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiShoppingCart, FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle, FiBarChart2 } from 'react-icons/fi'

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-secondary text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FiShoppingCart className="text-primary text-3xl" />
          </div>
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">Staff Dashboard</h1>
            <p className="mt-1 text-sm md:text-base text-text-secondary">Track your redemption activity</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-lg" />
              </div>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">Today</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-green-600">{stats.todayRedeemed}</p>
            <p className="text-xs text-text-secondary mt-1">Redemptions today</p>
          </div>

          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FiBarChart2 className="text-blue-600 text-lg" />
              </div>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">This Week</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-blue-600">{stats.weekRedeemed}</p>
            <p className="text-xs text-text-secondary mt-1">Total this week</p>
          </div>

          <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <FiClock className="text-amber-600 text-lg" />
              </div>
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">Pending</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-amber-600">{stats.pendingRedemptions}</p>
            <p className="text-xs text-text-secondary mt-1">Awaiting redemption</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <FiShoppingCart className="text-primary text-lg" />
            <h2 className="font-heading text-lg font-bold text-text-primary">Quick Actions</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/staff/redeem"
              className="flex items-center gap-4 p-5 border border-border hover:border-primary transition-all group bg-bg-secondary hover:bg-white rounded-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                <FiShoppingCart className="text-primary group-hover:text-white text-xl transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                  Redeem Claim
                </h3>
                <p className="text-sm text-text-secondary">Scan QR code or enter code</p>
              </div>
              <FiTrendingUp className="text-text-tertiary group-hover:text-primary transition-colors" />
            </Link>

            <Link
              href="/staff/history"
              className="flex items-center gap-4 p-5 border border-border hover:border-primary transition-all group bg-bg-secondary hover:bg-white rounded-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                <FiClock className="text-blue-600 group-hover:text-white text-xl transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                  View History
                </h3>
                <p className="text-sm text-text-secondary">View past redemptions</p>
              </div>
              <FiTrendingUp className="text-text-tertiary group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="text-blue-600 text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Redemption Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Always verify the customer is present before redeeming</li>
                <li>• Check the claim status and expiration date</li>
                <li>• Use the QR scanner for faster processing</li>
                <li>• Contact support if you encounter any issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
