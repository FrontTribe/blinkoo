'use client'

import { FiCalendar, FiClock, FiTrendingUp } from 'react-icons/fi'

type SuggestedSlot = {
  day: number
  dayName: string
  hour: number
  hourLabel: string
  confidence: number
}

interface SuggestedTimeslotsProps {
  slots: SuggestedSlot[]
}

export function SuggestedTimeslots({ slots }: SuggestedTimeslotsProps) {
  if (slots.length === 0) {
    return (
      <div className="bg-white border border-border p-6 text-center">
        <p className="text-text-secondary text-sm">
          Not enough data yet. Start running offers to get timing suggestions.
        </p>
      </div>
    )
  }

  // Sort by confidence
  const sortedSlots = [...slots].sort((a, b) => b.confidence - a.confidence)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <FiTrendingUp className="text-primary text-lg" />
        <h3 className="font-heading text-lg font-semibold text-text-primary">
          Suggested Time Slots
        </h3>
      </div>

      <div className="grid gap-3">
        {sortedSlots.slice(0, 5).map((slot, index) => (
          <div
            key={`${slot.day}-${slot.hour}`}
            className="bg-white border border-border p-4 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <span className="text-lg">#{index + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiCalendar className="text-text-secondary" />
                    <span className="font-medium text-text-primary">{slot.dayName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <FiClock className="text-text-secondary" />
                    <span className="text-text-secondary">{slot.hourLabel}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-tertiary mb-1">Confidence</div>
                <div className="text-lg font-bold text-primary">
                  {Math.round(slot.confidence * 100)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Based on your last 30 days of data. These times have shown the most
          customer engagement.
        </p>
      </div>
    </div>
  )
}
