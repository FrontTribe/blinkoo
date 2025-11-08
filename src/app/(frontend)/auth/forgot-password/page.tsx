'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiArrowRight, FiShoppingBag, FiAlertCircle, FiCheckCircle, FiArrowLeft } from 'react-icons/fi'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send reset email')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">Zaboravili Ste Lozinku?</h1>
          <p className="text-sm text-text-secondary">
            Bez brige! Poslat ćemo vam upute za resetiranje
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-border rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-error/10 border border-error rounded-lg p-4 flex items-start gap-3">
              <FiAlertCircle className="text-error text-xl flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <FiCheckCircle className="text-green-600 text-3xl" />
                </div>
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-text-primary mb-2">Provjerite Svoju E-poštu</h2>
                <p className="text-sm text-text-secondary">
                  Poslali smo upute za resetiranje lozinke na <strong>{email}</strong>
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <Link
                  href="/auth/login"
                  className="block w-full text-center py-3 px-4 bg-primary text-white hover:bg-primary-hover font-semibold rounded-lg transition-colors"
                >
                  Natrag na Prijavu
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <FiCheckCircle className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  Unesite svoju e-poštu i poslat ćemo vam link za resetiranje lozinke.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                      <span>Slanje...</span>
                    </>
                  ) : (
                    <>
                      <span>Pošalji Link za Resetiranje</span>
                      <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to Login */}
        {!success && (
          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        )}

        {/* Help Text */}
        {!success && (
          <div className="text-center text-xs text-text-tertiary space-y-1">
            <p>Sjećate se svoje lozinke?</p>
            <Link href="/auth/login" className="text-primary hover:text-primary-hover font-medium">
              Prijavite se umjesto toga
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

