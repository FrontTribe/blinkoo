import { headers } from 'next/headers'

type CurrentUser = {
  id: string
  email: string
  name?: string
  role: 'customer' | 'merchant_owner' | 'staff' | 'admin'
} | null

/**
 * Fetches the currently authenticated user on the server-side using the request cookies.
 * Returns null if the user is not authenticated or the request fails.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  try {
    const cookieHeader = headers().get('cookie')
    const host = headers().get('host')
    const protocol = headers().get('x-forwarded-proto') ?? 'http'

    if (!cookieHeader || !host) {
      return null
    }

    const baseUrl = `${protocol}://${host}`
    const response = await fetch(`${baseUrl}/api/web/auth/me`, {
      headers: {
        cookie: cookieHeader,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data ?? null
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}


