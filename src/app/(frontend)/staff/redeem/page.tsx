'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiShoppingCart, FiCheckCircle, FiAlertCircle, FiCamera, FiMic } from 'react-icons/fi'
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
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center pb-20 md:pb-4">
        <p className="text-text-primary">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4 pb-20 md:pb-4">
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

            {/* QR Scanner and Voice Input Buttons */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowScanner(true)}
                className="bg-primary/10 border-2 border-primary text-primary py-4 px-4 hover:bg-primary/20 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
              >
                <FiCamera className="w-5 h-5" />
                Scan QR
              </button>
              <button
                onClick={() => setShowVoiceInput(true)}
                className="bg-primary/10 border-2 border-primary text-primary py-4 px-4 hover:bg-primary/20 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
              >
                <FiMic className="w-5 h-5" />
                Voice
              </button>
            </div>

            {/* Input Field */}
            <div className="mb-8">
              <label
                htmlFor="code"
                className="block text-base font-bold text-text-primary mb-3 uppercase tracking-wider"
              >
                Or Enter Code Manually
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
                  className="w-full px-6 py-6 md:py-5 bg-white border-2 border-primary focus:border-primary focus:outline-none text-2xl md:text-3xl font-mono tracking-widest text-text-primary text-center uppercase transition-colors"
                  placeholder="123456"
                  maxLength={64}
                  disabled={loading}
                  autoFocus={!showScanner}
                  autoComplete="off"
                  inputMode="numeric"
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
