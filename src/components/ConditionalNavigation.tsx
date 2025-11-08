'use client'

import { usePathname } from 'next/navigation'
import NavigationClient from './NavigationClient'
import { MobileBottomNav } from './mobile/MobileBottomNav'
import { MobileStaffNav } from './mobile/MobileStaffNav'

type Props = {
  initialUser?: any | null
}

export function ConditionalNavigation({ initialUser }: Props) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')
  const isMerchantPage = pathname?.startsWith('/merchant')
  const isStaffPage = pathname?.startsWith('/staff')

  // Show bottom nav for customer pages and staff pages
  const showCustomerBottomNav = !isAuthPage && !isMerchantPage && !isStaffPage
  const showStaffBottomNav = isStaffPage

  return (
    <>
      {!isAuthPage && <NavigationClient initialUser={initialUser} />}
      {showCustomerBottomNav && <MobileBottomNav />}
      {showStaffBottomNav && <MobileStaffNav />}
    </>
  )
}
