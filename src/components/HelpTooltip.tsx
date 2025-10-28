'use client'

import { useState, useRef, useEffect } from 'react'
import { FiHelpCircle } from 'react-icons/fi'

type Position = 'top' | 'bottom' | 'left' | 'right'

type HelpTooltipProps = {
  content: string
  position?: Position
  children?: React.ReactNode
  className?: string
}

export function HelpTooltip({
  content,
  position = 'top',
  children,
  className = '',
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false)
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div className={`relative inline-block ${className}`} ref={tooltipRef}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="text-primary hover:text-primary-hover transition-colors"
        aria-label="Show help"
        type="button"
      >
        {children || <FiHelpCircle className="text-base" />}
      </button>

      {isVisible && (
        <div
          className={`absolute z-50 bg-white border border-border p-3 max-w-xs text-sm text-text-primary ${positionClasses[position]} pointer-events-auto`}
          role="tooltip"
        >
          <div className="mb-1 font-semibold">{content}</div>
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 ${position === 'top' ? 'top-full border-t-border' : position === 'bottom' ? 'bottom-full border-b-border' : position === 'left' ? 'left-full border-l-border' : 'right-full border-r-border'}`}
            style={{
              ...(position === 'top' && {
                borderTopColor: '#DDDDDD',
                borderBottomColor: 'transparent',
                borderWidth: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
              }),
              ...(position === 'bottom' && {
                borderBottomColor: '#DDDDDD',
                borderTopColor: 'transparent',
                borderWidth: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
              }),
              ...(position === 'left' && {
                borderLeftColor: '#DDDDDD',
                borderRightColor: 'transparent',
                borderWidth: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
              }),
              ...(position === 'right' && {
                borderRightColor: '#DDDDDD',
                borderLeftColor: 'transparent',
                borderWidth: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
              }),
            }}
          />
        </div>
      )}

      {/* Overlay to close on click outside */}
      {isVisible && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsVisible(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
