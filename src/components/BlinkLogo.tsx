'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type BlinkLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  as?: 'div' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  href?: string
}

const sizeClasses = {
  sm: {
    text: 'text-lg',
    eye: 'w-3 h-3',
    pupil: 'w-1 h-1',
    gap: 'gap-2',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    text: 'text-2xl',
    eye: 'w-4 h-4',
    pupil: 'w-1.5 h-1.5',
    gap: 'gap-2.5',
    dot: 'w-2 h-2',
  },
  lg: {
    text: 'text-3xl',
    eye: 'w-5 h-5',
    pupil: 'w-2 h-2',
    gap: 'gap-3',
    dot: 'w-2.5 h-2.5',
  },
  xl: {
    text: 'text-4xl',
    eye: 'w-6 h-6',
    pupil: 'w-2.5 h-2.5',
    gap: 'gap-3.5',
    dot: 'w-3 h-3',
  },
}

function Eye({ isBlinking, size }: { isBlinking: boolean; size: 'sm' | 'md' | 'lg' | 'xl' }) {
  const { eye, pupil } = sizeClasses[size]

  return (
    <div className={`relative ${eye} flex items-center justify-center`}>
      <div
        className={`${eye} rounded-full bg-[#ff385c] transition-all duration-150 flex items-center justify-center ${
          isBlinking ? 'h-0.5' : ''
        }`}
      >
        {!isBlinking && <div className={`${pupil} rounded-full bg-black absolute`} />}
      </div>
    </div>
  )
}

export function BlinkLogo({
  size = 'md',
  className = '',
  as: Component = 'div',
  href,
}: BlinkLogoProps) {
  const [isBlinking, setIsBlinking] = useState(false)
  const { text, gap, dot } = sizeClasses[size]

  useEffect(() => {
    // Random blink intervals between 2-5 seconds
    const blink = () => {
      setIsBlinking(true)
      setTimeout(() => {
        setIsBlinking(false)
      }, 150) // Blink duration

      const nextBlink = Math.random() * 3000 + 2000 // 2-5 seconds
      setTimeout(blink, nextBlink)
    }

    // Initial delay before first blink
    const initialDelay = Math.random() * 2000 + 1000
    const timeoutId = setTimeout(blink, initialDelay)

    return () => clearTimeout(timeoutId)
  }, [])

  const content = (
    <Component
      className={`inline-flex items-center gap-0.5 font-heading font-bold text-text-primary ${text} ${className}`}
    >
      <span className="relative inline-flex items-center">
        <span>Blink</span>
      </span>
      <div className="flex items-center gap-0">
        <Eye isBlinking={isBlinking} size={size} />
        <Eye isBlinking={isBlinking} size={size} />
      </div>
    </Component>
  )

  if (href) {
    return (
      <a href={href} className="inline-block hover:opacity-80 transition-opacity">
        {content}
      </a>
    )
  }

  return content
}
