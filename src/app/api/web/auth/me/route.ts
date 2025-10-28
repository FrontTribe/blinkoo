import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/web/auth/me
 * Public endpoint for fetching current authenticated user for the web app
 */
export async function GET() {
  try {
    const config = await configPromise
    const payload = await getPayload({ config })
    const { headers } = await import('next/headers')
    const headersObj = await headers()

    // Convert to proper Headers object
    const headerMap = new Headers()
    const cookieHeader = headersObj.get('cookie')
    if (cookieHeader) {
      headerMap.set('cookie', cookieHeader)
    }

    const userResult = await payload.auth({ headers: headerMap })

    if (!userResult.user) {
      return NextResponse.json(null)
    }

    return NextResponse.json(userResult.user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(null)
  }
}
