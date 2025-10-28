'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MdEmail, MdLockOutline, MdPerson, MdPhone, MdArrowForward } from 'react-icons/md'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'customer'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-2">
              {role === 'merchant' ? 'Become a Merchant' : 'Create Account'}
            </h2>
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary-hover font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-border p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdPerson className="text-text-tertiary" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:border-primary"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdEmail className="text-text-tertiary" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:border-primary"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdPhone className="text-text-tertiary" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="block w-full pl-10 pr-3 py-3 bg-white border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:border-primary"
                  />
                </div>
                <p className="mt-1 text-xs text-text-tertiary">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdLockOutline className="text-text-tertiary" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 text-base font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                style={{ color: 'white' }}
              >
                {loading
                  ? 'Creating account...'
                  : role === 'merchant'
                    ? 'Create Merchant Account'
                    : 'Create Account'}
                {!loading && <MdArrowForward style={{ color: 'white' }} />}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-text-secondary hover:text-text-primary">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
