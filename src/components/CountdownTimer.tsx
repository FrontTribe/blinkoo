'use client'

import { useState, useEffect } from 'react'

type CountdownTimerProps = {
  endDate: string
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    function calculateTimeLeft() {
      const now = new Date()
      const end = new Date(endDate)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const hours = Math.floor(diff / 1000 / 60 / 60)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft({ hours, minutes, seconds })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  if (!timeLeft) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="flex flex-col items-center bg-bg-secondary border border-border px-3 py-2">
          <span className="text-sm font-semibold text-text-tertiary">--</span>
        </div>
      </div>
    )
  }

  if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <div className="inline-flex items-center gap-2 bg-error/10 border border-error px-3 py-1.5">
        <span className="text-sm font-bold text-error uppercase tracking-wide">Ended</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Ends in
        </span>
      </div>
      <div className="flex items-center gap-2">
        {/* Hours */}
        <div className="flex flex-col items-center bg-primary/10 border-2 border-primary px-3 py-2">
          <span className="text-2xl font-bold text-primary tabular-nums leading-none">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-primary font-semibold uppercase tracking-wider mt-1">
            hr
          </span>
        </div>

        {/* Separator */}
        <span className="text-2xl font-bold text-primary">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center bg-primary/10 border-2 border-primary px-3 py-2">
          <span className="text-2xl font-bold text-primary tabular-nums leading-none">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-primary font-semibold uppercase tracking-wider mt-1">
            min
          </span>
        </div>

        {/* Separator */}
        <span className="text-2xl font-bold text-primary">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center bg-primary/10 border-2 border-primary px-3 py-2">
          <span className="text-2xl font-bold text-primary tabular-nums leading-none">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-primary font-semibold uppercase tracking-wider mt-1">
            sec
          </span>
        </div>
      </div>
    </div>
  )
}
