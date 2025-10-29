'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
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
} from 'react-icons/fi'

export default function NavigationClient() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const userMenuRef = useRef<HTMLDivElement>(null)

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
    console.log('NavigationClient - fetching user')
    // Fetch user on client side
    fetch('/api/web/auth/me', { credentials: 'include' })
      .then((res) => {
        console.log('NavigationClient - response status:', res.status)
        return res.ok ? res.json() : null
      })
      .then((data) => {
        console.log('NavigationClient - user data:', data?.email)
        if (data) {
          setUser(data)
          // Fetch saved count
          if (data.role === 'customer') {
            fetch('/api/web/saved-offers', { credentials: 'include' })
              .then((res) => res.ok && res.json())
              .then((data) => setSavedCount(data?.savedOffers?.length || 0))
              .catch(() => setSavedCount(0))
          }
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('NavigationClient - fetch error:', err)
        setLoading(false)
      })
  }, [])

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
            <Link
              href="/"
              className="font-heading text-xl font-bold text-primary hover:text-primary-hover transition-colors"
            >
              Blinkoo
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-text-primary hover:text-text-secondary px-4 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
                style={{ color: 'white' }}
              >
                Sign Up
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
            <Link
              href="/"
              className="font-heading text-xl font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-2"
            >
              <FiHome className="w-5 h-5" />
              Blinkoo
            </Link>

            {/* Main Navigation Links - For all users (offers), and logged-in customers */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/offers"
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive('/offers')
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                }`}
              >
                <FiShoppingBag className={`w-4 h-4 ${isActive('/offers') ? 'text-primary' : ''}`} />
                Offers
              </Link>
              {user && user.role === 'customer' && (
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
                  Claims
                </Link>
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
                  Dashboard
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
                  Redeem
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
                  History
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
                  Dashboard
                </Link>
                <Link
                  href="/merchant/offers"
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname?.startsWith('/merchant/offers')
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  <FiPackage
                    className={`w-4 h-4 ${pathname?.startsWith('/merchant/offers') ? 'text-primary' : ''}`}
                  />
                  Offers
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
                  Venues
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
                  Analytics
                </Link>
              </div>
            )}
          </div>

          {/* Right: Auth / User Menu */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* User Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2.5 py-1.5 border border-border hover:border-text-primary transition-all"
                  >
                    <MdAccountCircle className="w-5 h-5 text-text-secondary" />
                    <span className="hidden lg:inline text-sm text-text-primary font-medium">
                      {user.name?.split(' ')[0] || 'Account'}
                    </span>
                    <FiChevronDown
                      className={`w-4 h-4 text-text-secondary transition-transform ${
                        showUserMenu ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-border shadow-lg overflow-hidden z-50">
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
                              Browse Offers
                            </Link>
                            <Link
                              href="/my-claims"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiShoppingBag className="w-4 h-4" />
                              My Claims
                            </Link>
                            <Link
                              href="/saved-offers"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiBookmark className="w-4 h-4" />
                              Saved for Later
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
                              Favorites
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
                              Staff Dashboard
                            </Link>
                            <Link
                              href="/staff/redeem"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiShoppingCart className="w-4 h-4" />
                              Redeem Claims
                            </Link>
                            <Link
                              href="/staff/history"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiClock className="w-4 h-4" />
                              Redemption History
                            </Link>
                          </>
                        )}
                        {(user.role === 'merchant_owner' || user.role === 'admin') && (
                          <>
                            <Link
                              href="/merchant/offers"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiPackage className="w-4 h-4" />
                              My Offers
                            </Link>
                            <Link
                              href="/merchant/venues"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiMapPin className="w-4 h-4" />
                              Venues
                            </Link>
                            <Link
                              href="/merchant/analytics"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiBarChart2 className="w-4 h-4" />
                              Analytics
                            </Link>
                            <Link
                              href="/staff/redeem"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
                            >
                              <FiShoppingCart className="w-4 h-4" />
                              Redeem Codes
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
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button - Show for everyone (logged in or out) */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 text-text-secondary hover:text-text-primary"
                >
                  {showMobileMenu ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-text-primary hover:text-text-secondary px-4 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
                  style={{ color: 'white' }}
                >
                  Sign Up
                </Link>
                {/* Mobile Menu Button - Show for logged-out users too */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 text-text-secondary hover:text-text-primary"
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
            {/* Offers link - visible to everyone */}
            <Link
              href="/offers"
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/offers')
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-bg-secondary'
              }`}
            >
              <FiShoppingBag className={`w-4 h-4 ${isActive('/offers') ? 'text-primary' : ''}`} />
              Browse Offers
            </Link>

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
                  My Claims
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
                  Dashboard
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
                  Redeem
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
                  History
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
                  Dashboard
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
                  <FiPackage
                    className={`w-4 h-4 ${pathname?.startsWith('/merchant/offers') ? 'text-primary' : ''}`}
                  />
                  Offers
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
                  Venues
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
                  Analytics
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
                  Redeem Codes
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
