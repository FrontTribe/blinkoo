'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight, FiShoppingBag, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') || 'customer'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState(initialRole)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  function checkPasswordStrength(password: string) {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Step 1: Create the user
      const signupResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          role: role as string,
        }),
        credentials: 'include',
      })

      if (!signupResponse.ok) {
        const data = await signupResponse.json()
        throw new Error(data.errors?.[0]?.message || 'Signup failed')
      }

      // Step 2: Login the user immediately to create session
      const loginResponse = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!loginResponse.ok) {
        throw new Error('Failed to login after signup')
      }

      // Redirect to phone verification
      router.push('/auth/verify-phone')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isMerchant = role === 'merchant_owner' || role === 'merchant'

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <FiShoppingBag className="text-primary text-3xl" />
            </div>
          </div>
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
            {isMerchant ? 'Postanite Trgovac' : 'Kreirajte Račun'}
          </h1>
          <p className="text-sm text-text-secondary">
            Pridružite se Blinkoo i počnite otkrivati odlične ponude
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-border rounded-lg p-8 space-y-5">
          {error && (
            <div className="bg-error/10 border border-error rounded-lg p-4 flex items-start gap-3">
              <FiAlertCircle className="text-error text-xl flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              Registrirajte se kao:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  role === 'customer'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold text-text-primary mb-1">Kupac</div>
                  <div className="text-xs text-text-secondary">
                    Otkrijte ekskluzivne ponude i uštedite
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole('merchant_owner')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  role === 'merchant_owner'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold text-text-primary mb-1">Trgovac</div>
                  <div className="text-xs text-text-secondary">
                    Ispunite prazne sate i privucite kupce
                  </div>
                </div>
              </button>
            </div>
          </div>

          {isMerchant && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <FiCheckCircle className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Trgovački Račun</p>
                <p className="text-xs text-blue-800">Registrirate se kao trgovac kako biste nudili ponude</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-2">
                Ime i Prezime
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-white border border-border text-text-primary placeholder:text-text-tertiary rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                E-pošta
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-white border border-border text-text-primary placeholder:text-text-tertiary rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-text-primary mb-2">
                Broj Telefona
              </label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+385 XX XXX XXXX"
                  className="block w-full pl-12 pr-4 py-3 bg-white border border-border text-text-primary placeholder:text-text-tertiary rounded-lg focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <p className="mt-1 text-xs text-text-tertiary">Uključite pozivni broj (npr. +385 za Hrvatsku)</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
                Lozinka
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    checkPasswordStrength(e.target.value)
                  }}
                  className="block w-full pl-12 pr-4 py-3 bg-white border border-border text-text-primary placeholder:text-text-tertiary rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="Kreirajte jaku lozinku"
                />
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i <= passwordStrength
                            ? passwordStrength <= 2
                              ? 'bg-red-500'
                              : passwordStrength <= 4
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">
                    {passwordStrength <= 2
                      ? 'Slaba lozinka'
                      : passwordStrength <= 4
                        ? 'Srednja snaga'
                        : 'Jaka lozinka'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 border-border text-primary focus:ring-primary rounded"
              />
              <label className="text-xs text-text-secondary">
                Slažem se s{' '}
                <Link href="/terms" className="text-primary hover:text-primary-hover font-medium">
                  Uvjetima Korištenja
                </Link>{' '}
                i{' '}
                <Link href="/privacy" className="text-primary hover:text-primary-hover font-medium">
                  Politikom Privatnosti
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Kreiranje računa...</span>
                </>
              ) : (
                <>
                  <span>{isMerchant ? 'Kreiraj Trgovački Račun' : 'Kreiraj Račun'}</span>
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-text-secondary">Već imate račun?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            href="/auth/login"
            className="block w-full text-center py-3 px-4 border-2 border-border text-text-secondary hover:border-primary hover:text-primary font-semibold rounded-lg transition-colors"
          >
            Prijava
          </Link>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <FiArrowRight className="w-4 h-4 rotate-180" />
            Natrag na početnu
          </Link>
        </div>

        {/* Additional Info */}
        <div className="text-center text-xs text-text-tertiary space-y-1">
          <p>Registrirajte se besplatno i počnite štedjeti danas</p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
