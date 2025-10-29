'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiShoppingBag, FiMapPin, FiTag, FiUser } from 'react-icons/fi'
import { useEffect, useState } from 'react'

export function MobileBottomNav() {
  const pathname = usePathname()
  const [activeClaimsCount, setActiveClaimsCount] = useState(0)

  useEffect(() => {
    async function fetchActiveClaims() {
      try {
        const response = await fetch('/api/web/my-claims', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          const reserved = (data.claims || []).filter((c: any) => c.status === 'RESERVED').length
          setActiveClaimsCount(reserved)
        }
      } catch (error) {
        console.error('Error fetching claims count:', error)
      }
    }

    if (pathname?.includes('/my-claims') || pathname?.includes('/offers') || pathname === '/') {
      fetchActiveClaims()
    }
  }, [pathname])

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(path)
  }

  const tabs = [
    {
      path: '/',
      label: 'Home',
      icon: FiHome,
      exact: true,
    },
    {
      path: '/offers',
      label: 'Browse',
      icon: FiShoppingBag,
      exact: false,
    },
    {
      path: '/offers/map',
      label: 'Map',
      icon: FiMapPin,
      exact: false,
    },
    {
      path: '/my-claims',
      label: 'Claims',
      icon: FiTag,
      exact: false,
      badge: activeClaimsCount > 0 ? activeClaimsCount : null,
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: FiUser,
      exact: false,
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border safe-area-pb shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = tab.exact ? pathname === tab.path : isActive(tab.path)

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                active ? 'text-primary' : 'text-text-tertiary'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium mt-0.5">{tab.label}</span>
              {active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-t-full" />
              )}
            </Link>
          )
        })}
      </div>
      {/* Safe area spacer for devices with notches */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  )
}
