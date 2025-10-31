'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  FiArrowLeft,
  FiSave,
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiBell,
  FiUpload,
  FiEdit2,
  FiInfo,
} from 'react-icons/fi'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications'>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [merchant, setMerchant] = useState<any>(null)

  // Profile fields
  const [profileData, setProfileData] = useState({
    name: '',
    description: '',
    logo: null as string | null,
    categories: [] as string[],
  })

  // Account fields
  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  // Password fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    inApp: true,
    email: false,
    push: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch user and merchant data in parallel
      const [userRes, merchantRes] = await Promise.all([
        fetch('/api/users/me', { credentials: 'include' }),
        fetch('/api/merchant/info', { credentials: 'include' }),
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
        setAccountData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        })
        setNotificationPrefs({
          inApp: userData.notificationPreferences?.inApp ?? true,
          email: userData.notificationPreferences?.email ?? false,
          push: userData.notificationPreferences?.push ?? false,
        })
      }

      if (merchantRes.ok) {
        const merchantData = await merchantRes.json()
        if (merchantData.merchant) {
          setMerchant(merchantData.merchant)
          setProfileData({
            name: merchantData.merchant.name || '',
            description: merchantData.merchant.description || '',
            logo: merchantData.merchant.logo || null,
            categories: merchantData.merchant.categories?.map((c: any) => c.category) || [],
          })
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    setSaving(true)
    try {
      const response = await fetch('/api/merchant/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profileData.name,
          description: profileData.description,
          categories: profileData.categories,
        }),
      })

      if (response.ok) {
        toast.success('Profile updated successfully')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAccount() {
    setSaving(true)
    try {
      const response = await fetch('/api/merchant/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: accountData.name,
          email: accountData.email,
          phone: accountData.phone,
        }),
      })

      if (response.ok) {
        toast.success('Account updated successfully')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update account')
      }
    } catch (error) {
      console.error('Error updating account:', error)
      toast.error('Failed to update account')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/merchant/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        toast.success('Password changed successfully')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveNotifications() {
    setSaving(true)
    try {
      const response = await fetch('/api/merchant/account/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          notificationPreferences: notificationPrefs,
        }),
      })

      if (response.ok) {
        toast.success('Notification preferences updated')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update preferences')
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error('Failed to update preferences')
    } finally {
      setSaving(false)
    }
  }

  function handleSave() {
    switch (activeTab) {
      case 'profile':
        handleSaveProfile()
        break
      case 'account':
        handleSaveAccount()
        break
      case 'notifications':
        handleSaveNotifications()
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-secondary text-sm">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/merchant/dashboard"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4"
          >
            <FiArrowLeft />
            Back to Dashboard
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Settings
          </h1>
          <p className="mt-2 text-sm md:text-base text-text-secondary">
            Manage your account and business information
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <FiInfo className="inline mr-2" />
              Business Profile
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`py-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'account'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <FiUser className="inline mr-2" />
              Account Settings
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <FiBell className="inline mr-2" />
              Notifications
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          {activeTab === 'profile' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-text-primary mb-4">
                  Business Profile
                </h2>
                <p className="text-sm text-text-secondary mb-6">
                  Update your business information that customers will see
                </p>
              </div>

              <div>
                <label htmlFor="business-name" className="block text-sm font-medium text-text-primary mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="business-name"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <label htmlFor="business-description" className="block text-sm font-medium text-text-primary mb-2">
                  Business Description
                </label>
                <textarea
                  id="business-description"
                  rows={4}
                  value={profileData.description}
                  onChange={(e) =>
                    setProfileData({ ...profileData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell customers about your business..."
                />
              </div>

              <div className="border-t border-border pt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'white' }}
                >
                  <FiSave />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-text-primary mb-4">
                  Account Information
                </h2>
                <p className="text-sm text-text-secondary mb-6">
                  Update your personal account details
                </p>
              </div>

              <div>
                <label htmlFor="account-name" className="block text-sm font-medium text-text-primary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="account-name"
                  value={accountData.name}
                  onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="account-email" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="account-email"
                  value={accountData.email}
                  onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="account-phone" className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="account-phone"
                  value={accountData.phone}
                  onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="border-t border-border pt-6">
                <button
                  onClick={handleSaveAccount}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'white' }}
                >
                  <FiSave />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className="border-t border-border pt-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <FiLock />
                    Change Password
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Update your password to keep your account secure
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-text-primary mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-text-primary mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-text-primary mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-white text-text-secondary border border-border px-6 py-3 hover:border-primary font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiLock />
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-text-primary mb-4">
                  Notification Preferences
                </h2>
                <p className="text-sm text-text-secondary mb-6">
                  Control how you receive notifications about your business
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <div>
                    <div className="font-semibold text-text-primary">In-App Notifications</div>
                    <div className="text-sm text-text-secondary">Receive notifications within the app</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.inApp}
                    onChange={(e) =>
                      setNotificationPrefs({ ...notificationPrefs, inApp: e.target.checked })
                    }
                    className="w-6 h-6 border-border rounded focus:ring-2 focus:ring-primary text-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <div>
                    <div className="font-semibold text-text-primary">Email Notifications</div>
                    <div className="text-sm text-text-secondary">Receive notifications via email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.email}
                    onChange={(e) =>
                      setNotificationPrefs({ ...notificationPrefs, email: e.target.checked })
                    }
                    className="w-6 h-6 border-border rounded focus:ring-2 focus:ring-primary text-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <div>
                    <div className="font-semibold text-text-primary">Push Notifications</div>
                    <div className="text-sm text-text-secondary">Receive push notifications on your device</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.push}
                    onChange={(e) =>
                      setNotificationPrefs({ ...notificationPrefs, push: e.target.checked })
                    }
                    className="w-6 h-6 border-border rounded focus:ring-2 focus:ring-primary text-primary"
                  />
                </label>
              </div>

              <div className="border-t border-border pt-6">
                <button
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'white' }}
                >
                  <FiSave />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

