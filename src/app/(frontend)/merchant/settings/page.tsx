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
      toast.error('Učitavanje postavki nije uspjelo')
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
        toast.success('Profil je uspješno ažuriran')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Ažuriranje profila nije uspjelo')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Ažuriranje profila nije uspjelo')
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
        toast.success('Račun je uspješno ažuriran')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Ažuriranje računa nije uspjelo')
      }
    } catch (error) {
      console.error('Error updating account:', error)
      toast.error('Ažuriranje računa nije uspjelo')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Molimo ispunite sva polja za lozinku')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Nove lozinke se ne podudaraju')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Lozinka mora imati najmanje 8 znakova')
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
        toast.success('Lozinka je uspješno promijenjena')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        toast.error(data.error || 'Promjena lozinke nije uspjela')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Promjena lozinke nije uspjela')
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
        toast.success('Postavke obavijesti su ažurirane')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Ažuriranje postavki nije uspjelo')
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error('Ažuriranje postavki nije uspjelo')
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
        <p className="text-text-secondary text-sm">Učitavanje postavki...</p>
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
            Natrag na nadzornu ploču
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            Postavke
          </h1>
          <p className="mt-2 text-sm md:text-base text-text-secondary">
            Upravljajte svojim računom i podacima o poslovanju
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
              Poslovni profil
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
              Postavke računa
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
              Obavijesti
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          {activeTab === 'profile' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-text-primary mb-4">
                  Poslovni profil
                </h2>
                <p className="text-sm text-text-secondary mb-6">
                  Ažurirajte informacije o poslovanju koje će kupci vidjeti
                </p>
              </div>

              <div>
                <label htmlFor="business-name" className="block text-sm font-medium text-text-primary mb-2">
                  Naziv poslovanja *
                </label>
                <input
                  type="text"
                  id="business-name"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Naziv vašeg poslovanja"
                />
              </div>

              <div>
                <label htmlFor="business-description" className="block text-sm font-medium text-text-primary mb-2">
                  Opis poslovanja
                </label>
                <textarea
                  id="business-description"
                  rows={4}
                  value={profileData.description}
                  onChange={(e) =>
                    setProfileData({ ...profileData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-border text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Recite kupcima nešto o svom poslu..."
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
                  {saving ? 'Spremanje...' : 'Spremi promjene'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-text-primary mb-4">
                  Podaci o računu
                </h2>
                <p className="text-sm text-text-secondary mb-6">
                  Ažurirajte osobne podatke o računu
                </p>
              </div>

              <div>
                <label htmlFor="account-name" className="block text-sm font-medium text-text-primary mb-2">
                  Ime i prezime
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
                  E-mail adresa
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
                  Broj telefona
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
                  {saving ? 'Spremanje...' : 'Spremi promjene'}
                </button>
              </div>

              <div className="border-t border-border pt-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <FiLock />
                    Promijeni lozinku
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Ažurirajte lozinku kako biste zadržali sigurnost računa
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-text-primary mb-2">
                      Trenutna lozinka
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
                      Nova lozinka
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
                      Potvrdi novu lozinku
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
                    Promijeni lozinku
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-text-primary mb-4">
                  Postavke obavijesti
                </h2>
                <p className="text-sm text-text-secondary mb-6">
                  Kontrolirajte kako primate obavijesti o svom poslovanju
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <div>
                    <div className="font-semibold text-text-primary">Obavijesti u aplikaciji</div>
                    <div className="text-sm text-text-secondary">Primajte obavijesti unutar aplikacije</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.inApp}
                    onChange={(e) =>
                      setNotificationPrefs({ ...notificationPrefs, inApp: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-2 border-border text-primary accent-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 transition-colors"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <div>
                    <div className="font-semibold text-text-primary">E-mail obavijesti</div>
                    <div className="text-sm text-text-secondary">Primajte obavijesti putem e-pošte</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.email}
                    onChange={(e) =>
                      setNotificationPrefs({ ...notificationPrefs, email: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-2 border-border text-primary accent-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 transition-colors"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <div>
                    <div className="font-semibold text-text-primary">Push obavijesti</div>
                    <div className="text-sm text-text-secondary">Primajte push obavijesti na svoj uređaj</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.push}
                    onChange={(e) =>
                      setNotificationPrefs({ ...notificationPrefs, push: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-2 border-border text-primary accent-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 transition-colors"
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
                  {saving ? 'Spremanje...' : 'Spremi postavke'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

