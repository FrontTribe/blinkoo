'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiShoppingCart, FiClock } from 'react-icons/fi'

export function MobileStaffNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname?.startsWith(path)
  }

  const tabs = [
    {
      path: '/staff/dashboard',
      label: 'Dashboard',
      icon: FiHome,
      exact: false,
    },
    {
      path: '/staff/redeem',
      label: 'Redeem',
      icon: FiShoppingCart,
      exact: false,
    },
    {
      path: '/staff/history',
      label: 'History',
      icon: FiClock,
      exact: false,
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border safe-area-pb shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.path)

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
