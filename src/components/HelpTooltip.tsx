'use client'

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
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent',
  }

  return (
    <div className={`relative inline-flex items-center group ${className}`}>
      <span className="text-text-tertiary hover:text-primary transition-colors cursor-help">
        {children || <FiHelpCircle className="w-4 h-4" />}
      </span>
      
      <div
        className={`absolute z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none ${positionClasses[position]}`}
        role="tooltip"
      >
        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs min-w-[200px] shadow-xl">
          <p className="leading-relaxed whitespace-normal">{content}</p>
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      </div>
    </div>
  )
}
