'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = {
  id: number
  title: string
  description: string
}

const STEPS: Step[] = [
  { id: 1, title: 'Business Details', description: 'Tell us about your business' },
  { id: 2, title: 'First Venue', description: 'Add your location' },
  { id: 3, title: 'Operating Hours', description: 'Set your hours' },
]

export default function MerchantOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Business Details
  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [logo, setLogo] = useState<File | null>(null)

  // Step 2: Venue Details
  const [venueName, setVenueName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  // Step 3: Hours
  const [hours, setHours] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setError('')

    try {
      // Create venue first
      const venueResponse = await fetch('/api/merchant/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: venueName,
          address,
          city,
          country: 'USA',
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          openHours: hours,
        }),
        credentials: 'include',
      })

      if (!venueResponse.ok) {
        throw new Error('Failed to create venue')
      }

      // Mark onboarding as complete
      const onboardingResponse = await fetch('/api/merchant/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 3, completed: true }),
        credentials: 'include',
      })

      if (!onboardingResponse.ok) {
        throw new Error('Failed to complete onboarding')
      }

      router.push('/merchant/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Setup</h1>
            <span className="text-sm text-gray-500">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>
          <div className="flex gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-1 h-2 rounded ${
                  step.id <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{STEPS[0].title}</h2>
                <p className="text-gray-600 mb-6">{STEPS[0].description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{STEPS[1].title}</h2>
                <p className="text-gray-600 mb-6">{STEPS[1].description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name *</label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="40.7128"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="-74.0060"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Tip: Use Google Maps to find exact coordinates for your location
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{STEPS[2].title}</h2>
                <p className="text-gray-600 mb-6">{STEPS[2].description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operating Hours (JSON format)
                </label>
                <textarea
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  rows={8}
                  placeholder='{"monday": "9:00-17:00", "tuesday": "9:00-17:00", ...}'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter your operating hours in JSON format. This can be configured later.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Completing...' : currentStep === STEPS.length ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
