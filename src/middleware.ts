import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  // Handle i18n routing first
  const response = intlMiddleware(request)

  // Add any additional middleware logic here if needed
  // For now, we're just using next-intl for locale handling
  return response
}

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Static files (with file extensions)
  // - Next.js internals
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)'],
}
