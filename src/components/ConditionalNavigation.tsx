'use client'

import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import Navigation only when needed (client-side)
const DynamicNavigation = dynamic(() => import('./NavigationClient'), {
  ssr: false,
})

export function ConditionalNavigation() {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')

  if (isAuthPage) {
    return null
  }

  return <DynamicNavigation />
}
