'use client'

import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MobileBottomNav } from './mobile/MobileBottomNav'
import { MobileStaffNav } from './mobile/MobileStaffNav'

// Dynamically import Navigation only when needed (client-side)
const DynamicNavigation = dynamic(() => import('./NavigationClient'), {
  ssr: false,
})

export function ConditionalNavigation() {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')
  const isMerchantPage = pathname?.startsWith('/merchant')
  const isStaffPage = pathname?.startsWith('/staff')

  // Show bottom nav for customer pages and staff pages
  const showCustomerBottomNav = !isAuthPage && !isMerchantPage && !isStaffPage
  const showStaffBottomNav = isStaffPage

  return (
    <>
      {!isAuthPage && <DynamicNavigation />}
      {showCustomerBottomNav && <MobileBottomNav />}
      {showStaffBottomNav && <MobileStaffNav />}
    </>
  )
}
