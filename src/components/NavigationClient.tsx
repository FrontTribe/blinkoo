'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MdLogout, MdAccountCircle, MdSearch } from 'react-icons/md'

export default function NavigationClient() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

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
        if (data) setUser(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('NavigationClient - fetch error:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <nav
        className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'border-b border-[#EBEBEB]' : ''
        }`}
      >
        <div className="max-w-[1760px] mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <Link
              href="/"
              className="font-heading text-2xl font-bold text-primary hover:text-primary-hover transition-colors"
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
        scrolled ? 'border-b border-[#EBEBEB]' : ''
      }`}
    >
      <div className="max-w-[1760px] mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="font-heading text-2xl font-bold text-primary hover:text-primary-hover transition-colors"
            >
              Blinkoo
            </Link>

            {/* Search Bar - Center */}
            <Link
              href="/offers"
              className="hidden lg:flex items-center gap-3 px-4 py-2 border border-border hover:border-text-primary transition-all duration-200 cursor-pointer"
            >
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium text-text-primary">Where?</span>
                <span className="text-xs text-text-secondary">Anywhere</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium text-text-primary">When?</span>
                <span className="text-xs text-text-secondary">Live Now</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium text-text-primary">Offers</span>
                <span className="text-xs text-text-secondary">Search</span>
              </div>
              <div className="bg-primary text-white p-2">
                <MdSearch className="w-4 h-4" />
              </div>
            </Link>

            {/* Mobile Search */}
            <Link
              href="/offers"
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border hover:border-text-primary transition-colors"
            >
              <MdSearch className="w-5 h-5 text-text-primary" />
              <span className="text-sm text-text-secondary">Search offers</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {(user.role === 'merchant_owner' || user.role === 'admin') && (
                  <Link
                    href="/merchant/dashboard"
                    className="hidden sm:block text-text-primary hover:text-text-secondary px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Switch to Hosting
                  </Link>
                )}
                <Link
                  href="/offers"
                  className="hidden sm:block text-text-primary hover:text-text-secondary px-4 py-2 text-sm font-medium transition-colors"
                >
                  Browse Offers
                </Link>
                <Link
                  href="/my-claims"
                  className="hidden sm:block text-text-primary hover:text-text-secondary px-4 py-2 text-sm font-medium transition-colors"
                >
                  My Claims
                </Link>
                <Link
                  href="/favorites"
                  className="hidden sm:block text-text-primary hover:text-text-secondary px-4 py-2 text-sm font-medium transition-colors"
                >
                  Favorites
                </Link>
                <div className="flex items-center gap-2 px-3 py-2 border border-border hover:border-text-primary transition-all cursor-pointer">
                  <MdAccountCircle className="w-6 h-6 text-text-secondary" />
                  <span className="hidden lg:inline text-sm text-text-primary font-medium">
                    {user.name?.split(' ')[0] || 'Menu'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-text-secondary hover:text-text-primary px-2 transition-colors"
                  title="Logout"
                >
                  <MdLogout className="w-5 h-5" />
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
