'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  children: React.ReactNode
  requirePhoneVerification?: boolean
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requirePhoneVerification = false,
  redirectTo = '/auth/login',
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/users/me', { credentials: 'include' })
        if (response.ok) {
          const user = await response.json()
          if (requirePhoneVerification && !user.phoneVerified) {
            router.push('/auth/verify-phone')
            return
          }
          setAuthenticated(true)
        } else {
          const currentPath = window.location.pathname
          router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`)
        }
      } catch (err) {
        const currentPath = window.location.pathname
        router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router, requirePhoneVerification, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return <>{children}</>
}
