'use client'

import { useState } from 'react'
import { FiShoppingCart, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

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
        setResult({ type: 'success', message: 'Claim redeemed successfully!' })
        setCode('')
        // Clear result after 3 seconds
        setTimeout(() => setResult(null), 3000)
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to redeem claim' })
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Failed to redeem claim' })
    } finally {
      setLoading(false)
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !loading && code) {
      handleRedeem()
    }
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white border-2 border-border">
          {/* Header */}
          <div className="border-b-2 border-border p-10 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="bg-primary/20 border-2 border-primary p-4">
                <FiShoppingCart className="text-primary text-5xl" />
              </div>
              <h1 className="font-heading text-4xl font-bold text-text-primary">
                Staff Redemption
              </h1>
            </div>
            <p className="text-text-secondary text-center font-medium">
              Verify and redeem customer claims
            </p>
          </div>

          <div className="p-10">
            {/* Result Message */}
            {result && (
              <div
                className={`mb-8 p-5 border-2 flex items-center gap-4 ${
                  result.type === 'success' ? 'bg-success border-success' : 'bg-error border-error'
                }`}
              >
                {result.type === 'success' ? (
                  <FiCheckCircle className="text-3xl text-white flex-shrink-0" />
                ) : (
                  <FiAlertCircle className="text-3xl text-white flex-shrink-0" />
                )}
                <p className="font-bold text-white text-lg">{result.message}</p>
              </div>
            )}

            {/* Input Field */}
            <div className="mb-8">
              <label
                htmlFor="code"
                className="block text-base font-bold text-text-primary mb-3 uppercase tracking-wider"
              >
                Enter 6-Digit Code or QR Token
              </label>
              <div className="border-2 border-primary">
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    // Only allow numbers and letters
                    const value = e.target.value.replace(/[^A-Za-z0-9]/g, '')
                    setCode(value)
                    // Clear any previous result when typing
                    if (result) setResult(null)
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full px-6 py-5 bg-white border-2 border-primary focus:border-primary focus:outline-none text-3xl font-mono tracking-widest text-text-primary text-center uppercase transition-colors"
                  placeholder="123456"
                  maxLength={64}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <p className="mt-3 text-sm text-text-secondary text-center font-medium">
                Customer can show QR code or enter the code manually
              </p>
            </div>

            {/* Redeem Button */}
            <button
              onClick={handleRedeem}
              disabled={loading || !code}
              className="w-full bg-primary text-white py-5 px-6 hover:bg-primary-hover transition-colors font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-2 border-primary"
              style={{ color: 'white' }}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6 text-white"
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
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-6 h-6" />
                  <span>Redeem Claim</span>
                </>
              )}
            </button>

            {/* Help Text */}
            <div className="mt-8 p-5 bg-bg-secondary border-2 border-border">
              <p className="text-sm text-text-secondary text-center leading-relaxed font-medium">
                <span className="font-bold text-text-primary uppercase tracking-wider">
                  How it works:
                </span>{' '}
                Customers will show you their QR code or 6-digit code. Enter the code above to
                verify and redeem their claim. Make sure the customer is present at your venue
                before redeeming.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
