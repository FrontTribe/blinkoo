'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiShoppingCart, FiCheckCircle, FiAlertCircle, FiCamera, FiMic, FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'
import { QRScanner } from '@/components/QRScanner'
import { VoiceInputButton } from './VoiceInputButton'

export default function StaffRedeemPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/users/me', { credentials: 'include' })
        if (response.ok) {
          const user = await response.json()
          // Check if user is staff, merchant_owner, or admin
          if (user.role === 'staff' || user.role === 'merchant_owner' || user.role === 'admin') {
            setAuthenticated(true)
          } else {
            router.push('/auth/login?redirect=/staff/redeem')
          }
        } else {
          router.push('/auth/login?redirect=/staff/redeem')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/auth/login?redirect=/staff/redeem')
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [router])

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

  if (authLoading || !authenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-secondary text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/merchant/dashboard"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FiShoppingCart className="text-primary text-3xl" />
            </div>
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
                Staff Redemption
              </h1>
              <p className="mt-1 text-sm md:text-base text-text-secondary">
                Verify and redeem customer claims
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-border rounded-lg p-6 md:p-8 space-y-6">
          {/* Result Message */}
          {result && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                result.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-error/10 border border-error'
              }`}
            >
              {result.type === 'success' ? (
                <FiCheckCircle className="text-2xl text-green-600 flex-shrink-0" />
              ) : (
                <FiAlertCircle className="text-2xl text-error flex-shrink-0" />
              )}
              <p className={`font-semibold ${result.type === 'success' ? 'text-green-800' : 'text-error'}`}>
                {result.message}
              </p>
            </div>
          )}

          {/* Scanner and Voice Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowScanner(true)}
              className="bg-white border-2 border-primary text-primary py-4 px-4 hover:bg-primary/5 transition-colors font-semibold flex items-center justify-center gap-2 text-sm rounded-lg"
            >
              <FiCamera className="w-5 h-5" />
              Scan QR Code
            </button>
            <button
              onClick={() => setShowVoiceInput(true)}
              className="bg-white border-2 border-primary text-primary py-4 px-4 hover:bg-primary/5 transition-colors font-semibold flex items-center justify-center gap-2 text-sm rounded-lg"
            >
              <FiMic className="w-5 h-5" />
              Voice Input
            </button>
          </div>

          {/* Input Field */}
          <div className="space-y-3">
            <label htmlFor="code" className="block text-sm font-semibold text-text-primary">
              Or Enter Code Manually
            </label>
            <div className="border-2 border-primary rounded-lg overflow-hidden">
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
                className="w-full px-6 py-4 bg-white focus:border-primary focus:outline-none text-2xl md:text-3xl font-mono tracking-widest text-text-primary text-center uppercase transition-colors"
                placeholder="ENTER CODE"
                maxLength={64}
                disabled={loading}
                autoFocus={!showScanner}
                autoComplete="off"
                inputMode="numeric"
              />
            </div>
            <p className="text-xs text-text-secondary text-center">
              Customer can show QR code or enter the code manually
            </p>
          </div>

          {/* Redeem Button */}
          <button
            onClick={handleRedeem}
            disabled={loading || !code}
            className="w-full bg-primary text-white py-4 px-6 hover:bg-primary-hover transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded-lg"
            style={{ color: 'white' }}
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
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FiCheckCircle className="w-5 h-5" />
                <span>Redeem Claim</span>
              </>
            )}
          </button>

          {/* Help Text */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium">
              <strong>How it works:</strong> Customers will show you their QR code or 6-digit code. Enter
              the code above to verify and redeem their claim. Make sure the customer is present at your
              venue before redeeming.
            </p>
          </div>
        </div>

        {/* Quick Stats or Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white border border-border rounded-lg p-4 hover:border-primary transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Quick Access
                </p>
                <p className="text-lg font-bold text-text-primary">Scan & Redeem</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-4 hover:border-primary transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FiMic className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Voice Input
                </p>
                <p className="text-lg font-bold text-text-primary">Hands-Free</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-4 hover:border-primary transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <FiShoppingCart className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Secure
                </p>
                <p className="text-lg font-bold text-text-primary">Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={(scannedCode) => {
            setCode(scannedCode)
            setShowScanner(false)
            handleRedeem()
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Voice Input */}
      {showVoiceInput && (
        <VoiceInputButton
          onResult={(result) => {
            setCode(result)
            setShowVoiceInput(false)
            // Auto-redeem if code looks valid
            if (result.length >= 6) {
              setTimeout(() => handleRedeem(), 500)
            }
          }}
          onCancel={() => setShowVoiceInput(false)}
        />
      )}
    </div>
  )
}
