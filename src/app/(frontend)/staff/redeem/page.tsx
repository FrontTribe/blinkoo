'use client'

import { useState } from 'react'

export default function StaffRedeemPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  async function handleRedeem() {
    if (!code) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/web/claims/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ type: 'success', message: 'Claim redeemed successfully! ✓' })
        setCode('')
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to redeem claim' })
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Failed to redeem claim' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-black border border-gray-800">
          <div className="border-b border-gray-800 p-8 bg-orange-primary/10">
            <h1 className="font-heading text-3xl font-bold text-white text-center">
              Staff Redemption
            </h1>
            <p className="mt-2 text-gray-400 text-center">Verify and redeem claims</p>
          </div>

          <div className="p-8">
            {result && (
              <div
                className={`mb-6 p-4 border ${
                  result.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                <p className="font-medium">{result.message}</p>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="code" className="block text-sm font-medium text-gray-400 mb-2">
                Enter 6-Digit Code or QR Token
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-white/20 focus:border-orange-primary focus:outline-none text-lg font-mono tracking-wider text-white"
                placeholder="123456"
                maxLength={6}
                disabled={loading}
              />
            </div>

            <button
              onClick={handleRedeem}
              disabled={loading || !code}
              className="w-full bg-orange-primary text-white py-4 px-6 hover:bg-orange-light transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Redeem Claim'}
            </button>

            <p className="mt-6 text-center text-sm text-gray-500">
              Or use the QR scanner to scan customer QR codes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
