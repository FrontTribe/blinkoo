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
      <div className="inline-flex items-center gap-2 text-primary">
        <span className="text-xs font-medium">Loading...</span>
      </div>
    )
  }

  if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <div className="inline-flex items-center gap-2 text-error">
        <span className="text-xs font-medium">Offer Ended</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-text-secondary uppercase tracking-wider">Ends in</span>
      </div>
      <div className="flex items-center gap-1.5">
        {/* Hours */}
        <div className="flex flex-col items-center bg-white border border-border px-2 py-1">
          <span className="text-sm font-bold text-text-primary tabular-nums">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[8px] text-text-secondary uppercase tracking-wider">h</span>
        </div>

        {/* Separator */}
        <span className="text-lg font-bold text-text-primary">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center bg-white border border-border px-2 py-1">
          <span className="text-sm font-bold text-text-primary tabular-nums">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[8px] text-text-secondary uppercase tracking-wider">m</span>
        </div>

        {/* Separator */}
        <span className="text-lg font-bold text-text-primary">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center bg-white border border-border px-2 py-1">
          <span className="text-sm font-bold text-text-primary tabular-nums">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[8px] text-text-secondary uppercase tracking-wider">s</span>
        </div>
      </div>
    </div>
  )
}
