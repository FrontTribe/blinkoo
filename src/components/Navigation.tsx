import Link from 'next/link'
import { cookies } from 'next/headers'
import { MdLogout, MdAccountCircle } from 'react-icons/md'
import configPromise from '@/payload.config'
import { getPayload } from 'payload'

async function getUser() {
  try {
    const config = await configPromise
    const payload = await getPayload({ config })
    const cookieStore = await cookies()
    const headers = cookieStore as any
    const { user } = await payload.auth({ headers })

    return user
  } catch {
    return null
  }
}

export async function Navigation() {
  const user = await getUser()

  return (
    <nav className="bg-black border-b-2 border-orange-primary sticky top-0 z-50 backdrop-blur-sm bg-black/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link
              href="/"
              className="font-heading text-3xl font-bold text-orange-primary hover:text-orange-light transition-colors duration-300"
            >
              Off-Peak
            </Link>
            <div className="hidden md:ml-12 md:flex md:space-x-6">
              <Link
                href="/offers"
                className="font-body text-gray-300 hover:text-orange-primary px-4 py-2 text-sm font-medium transition-colors duration-300 relative group"
              >
                Explore Offers
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-primary group-hover:w-full transition-all duration-300" />
              </Link>
              {user && (
                <>
                  {user.role === 'customer' && (
                    <>
                      <Link
                        href="/my-claims"
                        className="font-body text-gray-300 hover:text-orange-primary px-4 py-2 text-sm font-medium transition-colors duration-300 relative group"
                      >
                        My Claims
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-primary group-hover:w-full transition-all duration-300" />
                      </Link>
                      <Link
                        href="/saved-offers"
                        className="font-body text-gray-300 hover:text-orange-primary px-4 py-2 text-sm font-medium transition-colors duration-300 relative group"
                      >
                        Saved
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-primary group-hover:w-full transition-all duration-300" />
                      </Link>
                    </>
                  )}
                  {(user.role === 'merchant_owner' || user.role === 'admin') && (
                    <>
                      <Link
                        href="/merchant/dashboard"
                        className="font-body text-gray-300 hover:text-orange-primary px-4 py-2 text-sm font-medium transition-colors duration-300 relative group"
                      >
                        Dashboard
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-primary group-hover:w-full transition-all duration-300" />
                      </Link>
                      <Link
                        href="/merchant/offers"
                        className="font-body text-gray-300 hover:text-orange-primary px-4 py-2 text-sm font-medium transition-colors duration-300 relative group"
                      >
                        Offers
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-primary group-hover:w-full transition-all duration-300" />
                      </Link>
                      <Link
                        href="/merchant/venues"
                        className="font-body text-gray-300 hover:text-orange-primary px-4 py-2 text-sm font-medium transition-colors duration-300 relative group"
                      >
                        Venues
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-primary group-hover:w-full transition-all duration-300" />
                      </Link>
                      <Link
                        href="/merchant/analytics"
                        className="font-body text-gray-300 hover:text-orange-primary px-4 py-2 text-sm font-medium transition-colors duration-300 relative group"
                      >
                        Analytics
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-primary group-hover:w-full transition-all duration-300" />
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm font-body text-gray-400">
                  <MdAccountCircle className="text-xl text-orange-primary" />
                  <span>{user.name || user.email}</span>
                </div>
                <Link
                  href="/api/auth/logout"
                  className="group flex items-center gap-2 bg-gray-900 text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-all duration-300 border-2 border-transparent hover:border-gray-700"
                >
                  <MdLogout className="transform group-hover:translate-x-1 transition-transform" />
                  Logout
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="font-body text-gray-300 hover:text-orange-primary px-4 py-2 text-sm font-medium transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="group bg-orange-primary text-white px-6 py-2.5 text-sm font-medium border-2 border-orange-primary hover:bg-orange-light hover:border-orange-light transition-all duration-300 inline-flex items-center gap-2"
                >
                  Sign Up
                  <span className="transform group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
