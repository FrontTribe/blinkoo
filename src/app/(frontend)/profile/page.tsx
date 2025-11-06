'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiUser,
  FiSettings,
  FiBell,
  FiClock,
  FiHeart,
  FiLogOut,
  FiEdit,
  FiCheck,
  FiX,
  FiMoon,
  FiAlertCircle,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [claimsCount, setClaimsCount] = useState({ total: 0, active: 0, redeemed: 0 })
  const [notificationPrefs, setNotificationPrefs] = useState({
    inApp: true,
    email: false,
    push: false,
    smartNotifications: true,
    quietHoursStart: 22,
    quietHoursEnd: 8,
    notificationFrequency: 'important' as 'all' | 'important' | 'occasional',
  })

  // Use push notifications hook
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications()

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/web/user', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setNotificationPrefs(data.user?.notificationPreferences || notificationPrefs)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    async function fetchClaimsStats() {
      try {
        const response = await fetch('/api/web/my-claims', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          const claims = data.claims || []
          setClaimsCount({
            total: claims.length,
            active: claims.filter((c: any) => c.status === 'RESERVED').length,
            redeemed: claims.filter((c: any) => c.status === 'REDEEMED').length,
          })
        }
      } catch (error) {
        console.error('Error fetching claims:', error)
      }
    }

    fetchClaimsStats()
  }, [])

  async function handleLogout() {
    try {
      await fetch('/api/web/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  async function updateNotificationPrefs(prefs: any) {
    setNotificationPrefs(prefs)
    try {
      const response = await fetch('/api/web/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationPreferences: prefs }),
        credentials: 'include',
      })
      if (response.ok) {
        toast.success('Preferences updated')
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error('Failed to update preferences')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <p className="text-text-primary">Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary mb-4">Please sign in to view your profile</p>
          <Link
            href="/auth/login"
            className="inline-block bg-primary text-white px-6 py-3 hover:bg-primary-hover transition-colors font-semibold"
            style={{ color: 'white' }}
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white border border-border p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <FiUser className="text-3xl text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="font-heading text-2xl font-bold text-text-primary">
                {user.name || 'User'}
              </h1>
              <p className="text-sm text-text-secondary">{user.email}</p>
              {user.phone && <p className="text-xs text-text-tertiary mt-1">{user.phone}</p>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-border p-4 text-center">
            <div className="text-2xl font-bold text-text-primary mb-1">{claimsCount.total}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">Total Claims</div>
          </div>
          <div className="bg-white border border-border p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{claimsCount.active}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">Active</div>
          </div>
          <div className="bg-white border border-border p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1">{claimsCount.redeemed}</div>
            <div className="text-xs text-text-secondary uppercase tracking-wider">Redeemed</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-border p-6 mb-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/my-claims"
              className="flex items-center gap-3 p-4 border border-border hover:border-primary transition-colors"
            >
              <FiClock className="text-xl text-primary" />
              <span className="font-medium text-text-primary">My Claims</span>
            </Link>
            <Link
              href="/saved-offers"
              className="flex items-center gap-3 p-4 border border-border hover:border-primary transition-colors"
            >
              <FiHeart className="text-xl text-primary" />
              <span className="font-medium text-text-primary">Saved Offers</span>
            </Link>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-text-primary">Notifications</h2>
            <FiBell className="text-xl text-text-tertiary" />
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border border-border hover:border-primary transition-colors cursor-pointer">
              <span className="text-text-primary font-medium">In-App Notifications</span>
              <button
                onClick={() =>
                  updateNotificationPrefs({ ...notificationPrefs, inApp: !notificationPrefs.inApp })
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  notificationPrefs.inApp ? 'bg-primary' : 'bg-gray-300'
                }`}
                style={notificationPrefs.inApp ? { backgroundColor: '#ff385c' } : undefined}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    notificationPrefs.inApp ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
            <label className="flex items-center justify-between p-3 border border-border hover:border-primary transition-colors cursor-pointer">
              <span className="text-text-primary font-medium">Email Notifications</span>
              <button
                onClick={() =>
                  updateNotificationPrefs({ ...notificationPrefs, email: !notificationPrefs.email })
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  notificationPrefs.email ? 'bg-primary' : 'bg-gray-300'
                }`}
                style={notificationPrefs.email ? { backgroundColor: '#ff385c' } : undefined}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    notificationPrefs.email ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
            <label className="flex items-center justify-between p-3 border border-border hover:border-primary transition-colors cursor-pointer">
              <div>
                <span className="text-text-primary font-medium">Push Notifications</span>
                {!isSupported && (
                  <p className="text-xs text-text-tertiary mt-1">Not supported in this browser</p>
                )}
              </div>
              {isSupported ? (
                <button
                  onClick={async () => {
                    if (isSubscribed) {
                      unsubscribe()
                      updateNotificationPrefs({ ...notificationPrefs, push: false })
                    } else {
                      subscribe()
                      updateNotificationPrefs({ ...notificationPrefs, push: true })
                    }
                  }}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    isSubscribed ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  style={isSubscribed ? { backgroundColor: '#ff385c' } : undefined}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      isSubscribed ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              ) : (
                <span className="text-text-tertiary text-sm">N/A</span>
              )}
            </label>
            <label className="flex items-center justify-between p-3 border border-border hover:border-primary transition-colors cursor-pointer">
              <div>
                <span className="text-text-primary font-medium">Smart Notifications</span>
                <p className="text-xs text-text-tertiary mt-1">
                  Personalized alerts based on your activity
                </p>
              </div>
              <button
                onClick={() =>
                  updateNotificationPrefs({
                    ...notificationPrefs,
                    smartNotifications: !notificationPrefs.smartNotifications,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  notificationPrefs.smartNotifications ? 'bg-primary' : 'bg-gray-300'
                }`}
                style={notificationPrefs.smartNotifications ? { backgroundColor: '#ff385c' } : undefined}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    notificationPrefs.smartNotifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Quiet Hours */}
          {notificationPrefs.smartNotifications && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <FiMoon className="text-primary" />
                <h3 className="text-sm font-semibold text-text-primary">Quiet Hours</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Start (Hour)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={notificationPrefs.quietHoursStart}
                    onChange={(e) =>
                      updateNotificationPrefs({
                        ...notificationPrefs,
                        quietHoursStart: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full border border-border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">End (Hour)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={notificationPrefs.quietHoursEnd}
                    onChange={(e) =>
                      updateNotificationPrefs({
                        ...notificationPrefs,
                        quietHoursEnd: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full border border-border px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Frequency */}
          {notificationPrefs.smartNotifications && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <FiAlertCircle className="text-primary" />
                <h3 className="text-sm font-semibold text-text-primary">Notification Frequency</h3>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    value="all"
                    checked={notificationPrefs.notificationFrequency === 'all'}
                    onChange={() =>
                      updateNotificationPrefs({ ...notificationPrefs, notificationFrequency: 'all' })
                    }
                    className="accent-primary"
                  />
                  <span className="text-sm text-text-primary">All updates</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    value="important"
                    checked={notificationPrefs.notificationFrequency === 'important'}
                    onChange={() =>
                      updateNotificationPrefs({
                        ...notificationPrefs,
                        notificationFrequency: 'important',
                      })
                    }
                    className="accent-primary"
                  />
                  <span className="text-sm text-text-primary">Important only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    value="occasional"
                    checked={notificationPrefs.notificationFrequency === 'occasional'}
                    onChange={() =>
                      updateNotificationPrefs({
                        ...notificationPrefs,
                        notificationFrequency: 'occasional',
                      })
                    }
                    className="accent-primary"
                  />
                  <span className="text-sm text-text-primary">Occasional</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-white border border-border p-6 mb-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border">
              <div>
                <p className="text-text-primary font-medium">Phone Verification</p>
                <p className="text-xs text-text-secondary">
                  {user.phoneVerified ? 'Verified' : 'Not verified'}
                </p>
              </div>
              {user.phoneVerified ? (
                <FiCheck className="text-success text-xl" />
              ) : (
                <Link
                  href="/auth/verify-phone"
                  className="text-primary hover:text-primary-hover font-medium text-sm"
                >
                  Verify
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-error text-error p-4 hover:bg-error hover:text-white transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </div>
  )
}
