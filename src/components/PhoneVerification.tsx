'use client'

import { useState, useEffect } from 'react'

type Props = {
  onVerify: (code: string) => Promise<void>
  canResend?: boolean
}

export function PhoneVerification({ onVerify, canResend = true }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResendCode, setCanResendCode] = useState(canResend)

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResendCode(true)
    }
  }, [countdown])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onVerify(code)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setCountdown(60)
    setCanResendCode(false)
    // Implement resend logic
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
          Enter verification code
        </label>
        <input
          id="code"
          type="text"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-wider"
          placeholder="000000"
        />
      </div>

      {canResendCode && (
        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Resend Code
          </button>
        </div>
      )}

      {!canResendCode && countdown > 0 && (
        <p className="text-center text-sm text-gray-600">Resend in {countdown}s</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || code.length !== 6}
        className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </div>
  )
}
