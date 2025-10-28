'use client'

import { useState, useEffect } from 'react'
import { FiClock, FiMapPin, FiCheckCircle, FiArrowRight, FiArrowLeft, FiX } from 'react-icons/fi'

type OnboardingStep = {
  title: string
  content: string
  icon: React.ReactNode
  visual?: React.ReactNode
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to Blinkoo!',
    content:
      'Discover exclusive time-limited offers at local venues near you. Save money and explore your city.',
    icon: <FiCheckCircle className="text-6xl text-primary" />,
  },
  {
    title: 'Limited Time, Limited Quantity',
    content:
      'Each offer has a specific time window and limited slots. Act fast to secure your deal before it expires!',
    icon: <FiClock className="text-6xl text-primary" />,
    visual: (
      <div className="flex items-center gap-4 mt-6 text-sm text-text-secondary">
        <div className="bg-bg-secondary border border-border px-3 py-2">
          <div className="font-semibold text-text-primary">20:00 - 21:30</div>
          <div className="text-xs">Time window</div>
        </div>
        <div className="bg-error text-white px-3 py-2">
          <div className="font-semibold">Only 5 left</div>
          <div className="text-xs opacity-90">Limited slots</div>
        </div>
      </div>
    ),
  },
  {
    title: 'How Claiming Works',
    content:
      'Claim an offer and you get 7 minutes to visit the venue. Show your QR code or 6-digit code to redeem.',
    icon: <FiMapPin className="text-6xl text-primary" />,
    visual: (
      <div className="mt-6 space-y-3">
        <div className="flex items-start gap-3 bg-bg-secondary border border-border p-3">
          <div
            className="bg-primary text-white w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ color: 'white' }}
          >
            1
          </div>
          <div className="flex-1">
            <div className="font-semibold text-text-primary text-sm">Find an offer you like</div>
            <div className="text-xs text-text-secondary mt-0.5">Browse by category or location</div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-bg-secondary border border-border p-3">
          <div
            className="bg-primary text-white w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ color: 'white' }}
          >
            2
          </div>
          <div className="flex-1">
            <div className="font-semibold text-text-primary text-sm">Claim it</div>
            <div className="text-xs text-text-secondary mt-0.5">You get 7 minutes to decide</div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-bg-secondary border border-border p-3">
          <div
            className="bg-primary text-white w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ color: 'white' }}
          >
            3
          </div>
          <div className="flex-1">
            <div className="font-semibold text-text-primary text-sm">Show QR at venue</div>
            <div className="text-xs text-text-secondary mt-0.5">Staff scans or you enter code</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Share Your Experience',
    content:
      'After redeeming, leave a review to help others discover great deals and improve the platform.',
    icon: <FiCheckCircle className="text-6xl text-primary" />,
  },
]

type OnboardingModalProps = {
  isOpen: boolean
  onComplete: () => void
  onSkip?: () => void
}

export function OnboardingModal({ isOpen, onComplete, onSkip }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isClosing, setIsClosing] = useState(false)

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setIsClosing(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsClosing(true)
    setTimeout(() => {
      onComplete()
      setIsClosing(false)
    }, 300)
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    }
    handleComplete()
  }

  const step = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleComplete}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`bg-white border-2 border-border max-w-lg w-full p-8 pointer-events-auto transition-transform duration-300 ${
            isClosing ? 'scale-95' : 'scale-100'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
        >
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors p-2"
            aria-label="Skip tutorial"
          >
            <FiX className="text-xl" />
          </button>

          {/* Progress dots */}
          <div className="flex gap-2 justify-center mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-primary flex-1'
                    : index < currentStep
                      ? 'bg-primary/30 flex-1'
                      : 'bg-border w-4'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">{step.icon}</div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2
              id="onboarding-title"
              className="font-heading text-2xl font-bold text-text-primary mb-3"
            >
              {step.title}
            </h2>
            <p className="text-text-secondary leading-relaxed">{step.content}</p>
            {step.visual && <div className="mt-6">{step.visual}</div>}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!isFirstStep && (
              <button
                onClick={handleBack}
                className="flex-1 bg-white border-2 border-border text-text-primary py-3 px-6 hover:bg-bg-secondary font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <FiArrowLeft />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 bg-text-primary text-white py-3 px-6 hover:bg-text-secondary font-semibold transition-colors flex items-center justify-center gap-2"
              style={{ color: 'white' }}
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <FiArrowRight />}
            </button>
          </div>

          {/* Step indicator */}
          <div className="text-center mt-4 text-xs text-text-tertiary">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>
    </div>
  )
}
