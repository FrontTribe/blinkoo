'use client'

import { useState, useEffect } from 'react'
import { FiClock, FiMapPin, FiCheckCircle, FiArrowRight, FiArrowLeft, FiX } from 'react-icons/fi'
import { useTranslations, useLocale } from 'next-intl'

type OnboardingStep = {
  key: string
  icon: React.ReactNode
  visual?: (t: any) => React.ReactNode
}

type OnboardingModalProps = {
  isOpen: boolean
  onComplete: () => void
  onSkip?: () => void
}

const stepKeys = ['welcome', 'limitedTime', 'howItWorks', 'shareExperience'] as const

export function OnboardingModal({ isOpen, onComplete, onSkip }: OnboardingModalProps) {
  const t = useTranslations('onboarding')
  const locale = useLocale()
  const [currentStep, setCurrentStep] = useState(0)
  const [isClosing, setIsClosing] = useState(false)

  const getStepIcon = (key: string) => {
    switch (key) {
      case 'welcome':
      case 'shareExperience':
        return <FiCheckCircle className="text-6xl text-primary" />
      case 'limitedTime':
        return <FiClock className="text-6xl text-primary" />
      case 'howItWorks':
        return <FiMapPin className="text-6xl text-primary" />
      default:
        return <FiCheckCircle className="text-6xl text-primary" />
    }
  }

  const getStepVisual = (key: string) => {
    if (key === 'limitedTime') {
      return (
        <div className="flex items-center gap-4 mt-6 text-sm text-text-secondary">
          <div className="bg-bg-secondary border border-border px-3 py-2 rounded-lg">
            <div className="font-semibold text-text-primary">20:00 - 21:30</div>
            <div className="text-xs">{t('steps.limitedTime.timeWindow')}</div>
          </div>
          <div className="bg-error text-white px-3 py-2 rounded-lg">
            <div className="font-semibold">{t('steps.limitedTime.onlyLeft', { count: 5 })}</div>
            <div className="text-xs opacity-90">{t('steps.limitedTime.limitedSlots')}</div>
          </div>
        </div>
      )
    }
    if (key === 'howItWorks') {
      return (
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3 bg-bg-secondary border border-border p-3 rounded-lg">
            <div
              className="bg-primary text-white w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 rounded-lg"
              style={{ color: 'white' }}
            >
              1
            </div>
            <div className="flex-1">
              <div className="font-semibold text-text-primary text-sm">
                {t('steps.howItWorks.step1.title')}
              </div>
              <div className="text-xs text-text-secondary mt-0.5">
                {t('steps.howItWorks.step1.description')}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-bg-secondary border border-border p-3 rounded-lg">
            <div
              className="bg-primary text-white w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 rounded-lg"
              style={{ color: 'white' }}
            >
              2
            </div>
            <div className="flex-1">
              <div className="font-semibold text-text-primary text-sm">
                {t('steps.howItWorks.step2.title')}
              </div>
              <div className="text-xs text-text-secondary mt-0.5">
                {t('steps.howItWorks.step2.description')}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-bg-secondary border border-border p-3 rounded-lg">
            <div
              className="bg-primary text-white w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 rounded-lg"
              style={{ color: 'white' }}
            >
              3
            </div>
            <div className="flex-1">
              <div className="font-semibold text-text-primary text-sm">
                {t('steps.howItWorks.step3.title')}
              </div>
              <div className="text-xs text-text-secondary mt-0.5">
                {t('steps.howItWorks.step3.description')}
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

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
    if (currentStep < stepKeys.length - 1) {
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

  const currentStepKey = stepKeys[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === stepKeys.length - 1

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
            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg"
            aria-label={t('buttons.skip')}
          >
            <FiX className="text-xl" />
          </button>

          {/* Progress dots */}
          <div className="flex gap-2 justify-center mb-8">
            {stepKeys.map((_, index) => (
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
          <div className="flex justify-center mb-6">{getStepIcon(currentStepKey)}</div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2
              id="onboarding-title"
              className="font-heading text-2xl font-bold text-text-primary mb-3"
            >
              {t(`steps.${currentStepKey}.title`)}
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {t(`steps.${currentStepKey}.content`)}
            </p>
            {getStepVisual(currentStepKey) && (
              <div className="mt-6">{getStepVisual(currentStepKey)}</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!isFirstStep && (
              <button
                onClick={handleBack}
                className="flex-1 bg-white border-2 border-border text-text-primary py-3 px-6 hover:bg-bg-secondary font-semibold transition-colors flex items-center justify-center gap-2 rounded-lg"
              >
                <FiArrowLeft />
                {t('buttons.back')}
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 bg-text-primary text-white py-3 px-6 hover:bg-text-secondary font-semibold transition-colors flex items-center justify-center gap-2 rounded-lg"
              style={{ color: 'white' }}
            >
              {isLastStep ? t('buttons.getStarted') : t('buttons.next')}
              {!isLastStep && <FiArrowRight />}
            </button>
          </div>

          {/* Step indicator */}
          <div className="text-center mt-4 text-xs text-text-tertiary">
            {t('stepIndicator', { current: currentStep + 1, total: stepKeys.length })}
          </div>
        </div>
      </div>
    </div>
  )
}
