import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute =
    path.startsWith('/merchant/') || path.startsWith('/staff/') || path.includes('/claim')

  // Allow public access to home, offers list, and offer details
  const isPublicRoute =
    path === '/' ||
    path.startsWith('/offers') ||
    path.startsWith('/auth') ||
    path.startsWith('/api') ||
    path.startsWith('/admin')

  // Don't protect API routes, admin panel, or public routes
  // NOTE: KYC enforcement is handled in API routes for merchant pages
  // since most merchant pages are client components
  if (isPublicRoute || path.includes('/offers/[id]/') || !isProtectedRoute) {
    return NextResponse.next()
  }

  // For protected routes, we'll check auth in the page component
  // since Payload auth requires server-side context
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/graphql|api/rest).*)'],
}
