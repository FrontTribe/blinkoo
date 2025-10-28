'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MdSecurity, MdPhoneAndroid, MdTimer } from 'react-icons/md'

export default function VerifyPhonePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    // Send OTP when page loads
    sendOTP()
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  async function sendOTP() {
    try {
      const response = await fetch('/api/web/auth/verify-phone', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        console.error('Failed to send OTP:', data)
        throw new Error(data.error || 'Failed to send OTP')
      }
    } catch (err: any) {
      console.error('OTP send error:', err)
      setError(err.message)
    }
  }

  async function handleResend() {
    setCountdown(60)
    setCanResend(false)
    setError('')
    await sendOTP()
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/web/auth/confirm-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Invalid code')
      }

      router.push('/offers')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 border border-gray-800">
        <div>
          <div className="flex justify-center mb-4">
            <div className="bg-orange-primary p-4 border-2 border-orange-primary">
              <MdSecurity className="text-4xl text-black" />
            </div>
          </div>
          <h2 className="font-heading text-center text-3xl font-bold text-white mb-2">
            Verify Your Phone
          </h2>
          <p className="text-center text-sm text-gray-400">
            We sent a 6-digit code to your phone number
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          {error && (
            <div className="bg-red-900 border border-red-700 p-4 text-red-200 text-sm">
              <p>{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
              Enter verification code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="block w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-orange-primary text-center text-2xl font-mono tracking-wider"
              placeholder="000000"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <MdTimer className="text-lg" />
              <span>{canResend ? "Didn't receive code?" : `Resend in ${countdown}s`}</span>
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className="text-orange-primary hover:text-orange-light disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              Resend Code
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-medium text-white bg-orange-primary hover:bg-orange-light focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              'Verifying...'
            ) : (
              <>
                <MdPhoneAndroid />
                Verify
              </>
            )}
          </button>

          {/* Development Helper */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-yellow-900 border border-yellow-700 text-yellow-200 text-xs">
              <p className="font-bold mb-1">🔧 Development Mode</p>
              <p>Check your server console for the OTP code.</p>
              <p className="mt-1">Look for a message like: 📱 OTP for +38599...</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
