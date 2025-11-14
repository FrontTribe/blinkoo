'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRouter, usePathname } from '@/i18n/navigation'
import { MdLogout, MdAccountCircle, MdDashboard } from 'react-icons/md'
import {
  FiShoppingBag,
  FiBookmark,
  FiHeart,
  FiChevronDown,
  FiMenu,
  FiX,
  FiSettings,
  FiHome,
  FiPackage,
  FiMapPin,
  FiBarChart2,
  FiShoppingCart,
  FiClock,
  FiUsers,
} from 'react-icons/fi'
import { NotificationBell } from '@/components/NotificationBell'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { BlinkLogo } from '@/components/BlinkLogo'
import { useTranslations } from 'next-intl'

type NavigationClientProps = {
  initialUser?: any | null
}

export default function NavigationClient({ initialUser = null }: NavigationClientProps) {
  const [user, setUser] = useState<any>(initialUser)
  const [loading, setLoading] = useState(!initialUser)
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('nav')

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function handleLogout() {
    try {
      await fetch('/api/web/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      // Force a hard refresh to clear all state
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function hydrateUser() {
      try {
        const res = await fetch('/api/web/auth/me', { credentials: 'include' })
        if (!res.ok) {
          if (isMounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        const data = await res.json()
        if (isMounted && data) {
          setUser(data)

          if (data.role === 'customer') {
            try {
              const savedRes = await fetch('/api/web/saved-offers', { credentials: 'include' })
              if (savedRes.ok) {
                const savedData = await savedRes.json()
                setSavedCount(savedData?.savedOffers?.length || 0)
              } else {
                setSavedCount(0)
              }
            } catch {
              setSavedCount(0)
            }
          }
        }
      } catch (err) {
        console.error('NavigationClient - fetch error:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Fetch only if we don't have initial user or to refresh saved count
    if (!initialUser) {
      hydrateUser()
    } else if (initialUser?.role === 'customer') {
      hydrateUser()
    }

    return () => {
      isMounted = false
    }
  }, [initialUser])

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const isActive = (path: string) => pathname === path

  if (loading) {
    return (
      <nav
        className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'border-b border-[#EBEBEB]' : ''
        }`}
      >
        <div className="max-w-[1760px] mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <BlinkLogo size="md" />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-text-primary hover:text-text-secondary px-4 py-2 text-sm font-medium transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                href="/auth/signup"
                className="bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
                style={{ color: 'white' }}
              >
                {t('signup')}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-[#EBEBEB] shadow-sm' : ''
      }`}
    >
      <div className="max-w-[1760px] mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo + Main Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <BlinkLogo size="md" />
            </Link>

            {/* Main Navigation Links - For all users (offers), and logged-in customers */}
            <div className="hidden md:flex items-center gap-1">
              {(!user || user.role === 'customer') && (
                <Link
                  href="/offers"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors rounded-lg ${
                    isActive('/offers')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  <FiShoppingBag
                    className={`w-4 h-4 ${isActive('/offers') ? 'text-primary' : ''}`}
                  />
                  {t('offers')}
                </Link>
              )}
              {user && user.role === 'customer' && (
                <>
                  <Link
                    href="/feed"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive('/feed')
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                    }`}
                  >
                    <FiUsers className={`w-4 h-4 ${isActive('/feed') ? 'text-primary' : ''}`} />
                    {t('feed')}
                  </Link>
                  <Link
                    href="/my-claims"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive('/my-claims')
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                    }`}
                  >
                    <FiShoppingBag
                      className={`w-4 h-4 ${isActive('/my-claims') ? 'text-primary' : ''}`}
                    />
                    {t('myClaims')}
                  </Link>
                </>
              )}
            </div>

            {/* Staff Navigation */}
            {user && user.role === 'staff' && (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/staff/dashboard"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname === '/staff/dashboard'
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  <MdDashboard
                    className={`w-4 h-4 ${pathname === '/staff/dashboard' ? 'text-primary' : ''}`}
                  />
                  {t('dashboard')}
                </Link>
                <Link
                  href="/staff/redeem"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/staff/redeem')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  <FiShoppingCart
                    className={`w-4 h-4 ${pathname?.startsWith('/staff/redeem') ? 'text-primary' : ''}`}
                  />
                  {t('redeem')}
                </Link>
                <Link
                  href="/staff/history"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/staff/history')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  <FiClock
                    className={`w-4 h-4 ${pathname?.startsWith('/staff/history') ? 'text-primary' : ''}`}
                  />
                  {t('history')}
                </Link>
              </div>
            )}

            {/* Merchant Navigation */}
            {user && (user.role === 'merchant_owner' || user.role === 'admin') && (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/merchant/dashboard"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname === '/merchant/dashboard'
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  <MdDashboard
                    className={`w-4 h-4 ${pathname === '/merchant/dashboard' ? 'text-primary' : ''}`}
                  />
                  {t('dashboard')}
                </Link>
                <Link
                  href="/merchant/offers"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/merchant/offers')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  <FiShoppingBag
                    className={`w-4 h-4 ${pathname?.startsWith('/merchant/offers') ? 'text-primary' : ''}`}
                  />
                  {t('offers')}
                </Link>
                <Link
                  href="/merchant/venues"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/merchant/venues')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  <FiMapPin
                    className={`w-4 h-4 ${pathname?.startsWith('/merchant/venues') ? 'text-primary' : ''}`}
                  />
                  {t('venues')}
                </Link>
                <Link
                  href="/merchant/staff"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/merchant/staff')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  <FiUsers
                    className={`w-4 h-4 ${pathname?.startsWith('/merchant/staff') ? 'text-primary' : ''}`}
                  />
                  {t('staff')}
                </Link>
                <Link
                  href="/merchant/analytics"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/merchant/analytics')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  <FiBarChart2
                    className={`w-4 h-4 ${pathname?.startsWith('/merchant/analytics') ? 'text-primary' : ''}`}
                  />
                  {t('analytics')}
                </Link>
              </div>
            )}
          </div>

          {/* Right: Auth / User Menu */}
          <div className="flex items-center gap-2">
            {/* Language Switcher - Show for everyone */}
            <LocaleSwitcher />

            {user ? (
              <>
                {/* Notification Bell - Show for merchants */}
                {user.role === 'merchant_owner' && <NotificationBell />}

                {/* User Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2.5 py-1.5 border border-border hover:border-text-primary transition-all rounded-lg"
                  >
                    <MdAccountCircle className="w-5 h-5 text-text-secondary" />
                    <span className="hidden lg:inline text-sm text-text-primary font-medium">
                      {user.name?.split(' ')[0] || t('account')}
                    </span>
                    <FiChevronDown
                      className={`w-4 h-4 text-text-secondary transition-transform ${
                        showUserMenu ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-border shadow-lg overflow-hidden z-50 rounded-lg">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-text-primary">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs text-text-secondary">{user.email}</p>
                      </div>
                      <div className="py-1">
                        {user.role === 'customer' && (
                          <>
                            <Link
                              href="/offers"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiShoppingBag className="w-4 h-4" />
                              {t('browseOffers')}
                            </Link>
                            <Link
                              href="/my-claims"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiShoppingBag className="w-4 h-4" />
                              {t('myClaims')}
                            </Link>
                            <Link
                              href="/saved-offers"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiBookmark className="w-4 h-4" />
                              {t('savedOffers')}
                              {savedCount > 0 && (
                                <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                  {savedCount}
                                </span>
                              )}
                            </Link>
                            <Link
                              href="/favorites"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiHeart className="w-4 h-4" />
                              {t('favorites')}
                            </Link>
                          </>
                        )}
                        {user.role === 'staff' && (
                          <>
                            <Link
                              href="/staff/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiHome className="w-4 h-4" />
                              {t('staffDashboard')}
                            </Link>
                            <Link
                              href="/staff/redeem"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiShoppingCart className="w-4 h-4" />
                              {t('redeemReservations')}
                            </Link>
                            <Link
                              href="/staff/history"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiClock className="w-4 h-4" />
                              {t('redemptionHistory')}
                            </Link>
                          </>
                        )}
                        {(user.role === 'merchant_owner' || user.role === 'admin') && (
                          <>
                            <Link
                              href="/merchant/venues"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiMapPin className="w-4 h-4" />
                              {t('venues')}
                            </Link>
                            <Link
                              href="/merchant/analytics"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiBarChart2 className="w-4 h-4" />
                              {t('analytics')}
                            </Link>
                            <Link
                              href="/staff/redeem"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiShoppingCart className="w-4 h-4" />
                              {t('redeemCodes')}
                            </Link>
                            <Link
                              href="/merchant/settings"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiSettings className="w-4 h-4" />
                              {t('settings')}
                            </Link>
                          </>
                        )}
                      </div>
                      <div className="border-t border-border py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-bg-secondary transition-colors"
                        >
                          <MdLogout className="w-4 h-4" />
                          {t('logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button - Show for everyone (logged in or out) */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg"
                >
                  {showMobileMenu ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-text-primary hover:text-text-secondary px-4 py-2 text-sm font-medium transition-colors rounded-lg"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors rounded-lg"
                  style={{ color: 'white' }}
                >
                  {t('signup')}
                </Link>
                {/* Mobile Menu Button - Show for logged-out users too */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg"
                >
                  {showMobileMenu ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-border py-2 space-y-1">
            {/* Offers link - visible to everyone except merchants */}
            {(!user || user.role === 'customer') && (
              <Link
                href="/offers"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  isActive('/offers')
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-bg-secondary'
                }`}
              >
                <FiShoppingBag className={`w-4 h-4 ${isActive('/offers') ? 'text-primary' : ''}`} />
                {t('browseOffers')}
              </Link>
            )}

            {/* Customer-specific links */}
            {user && user.role === 'customer' && (
              <>
                <Link
                  href="/my-claims"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                    isActive('/my-claims')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  <FiShoppingBag
                    className={`w-4 h-4 ${isActive('/my-claims') ? 'text-primary' : ''}`}
                  />
                  {t('myClaims')}
                </Link>
              </>
            )}
            {user && user.role === 'staff' && (
              <>
                <Link
                  href="/staff/dashboard"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                    pathname === '/staff/dashboard'
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  <MdDashboard
                    className={`w-4 h-4 ${pathname === '/staff/dashboard' ? 'text-primary' : ''}`}
                  />
                  {t('dashboard')}
                </Link>
                <Link
                  href="/staff/redeem"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/staff/redeem')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  <FiShoppingCart
                    className={`w-4 h-4 ${pathname?.startsWith('/staff/redeem') ? 'text-primary' : ''}`}
                  />
                  {t('redeem')}
                </Link>
                <Link
                  href="/staff/history"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/staff/history')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  <FiClock
                    className={`w-4 h-4 ${pathname?.startsWith('/staff/history') ? 'text-primary' : ''}`}
                  />
                  {t('history')}
                </Link>
              </>
            )}
            {user && (user.role === 'merchant_owner' || user.role === 'admin') && (
              <>
                <Link
                  href="/merchant/dashboard"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                    pathname === '/merchant/dashboard'
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  <MdDashboard
                    className={`w-4 h-4 ${pathname === '/merchant/dashboard' ? 'text-primary' : ''}`}
                  />
                  {t('dashboard')}
                </Link>
                <Link
                  href="/merchant/offers"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/merchant/offers')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  <FiShoppingBag
                    className={`w-4 h-4 ${pathname?.startsWith('/merchant/offers') ? 'text-primary' : ''}`}
                  />
                  {t('offers')}
                </Link>
                <Link
                  href="/merchant/venues"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/merchant/venues')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  <FiMapPin
                    className={`w-4 h-4 ${pathname?.startsWith('/merchant/venues') ? 'text-primary' : ''}`}
                  />
                  {t('venues')}
                </Link>
                <Link
                  href="/merchant/analytics"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/merchant/analytics')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  <FiBarChart2
                    className={`w-4 h-4 ${pathname?.startsWith('/merchant/analytics') ? 'text-primary' : ''}`}
                  />
                  {t('analytics')}
                </Link>
                <Link
                  href="/staff/redeem"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/staff')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  <FiShoppingCart
                    className={`w-4 h-4 ${pathname?.startsWith('/staff') ? 'text-primary' : ''}`}
                  />
                  {t('redeemCodes')}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
