'use client'

import { useEffect, useState } from 'react'

type ConfettiProps = {
  trigger: boolean
  duration?: number
}

export function Confetti({ trigger, duration = 3000 }: ConfettiProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsActive(true)
      const timer = setTimeout(() => {
        setIsActive(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [trigger, duration])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[90] overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            backgroundColor: i % 3 === 0 ? '#ff385c' : i % 3 === 1 ? '#222222' : '#717171',
            width: '10px',
            height: '10px',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  )
}
