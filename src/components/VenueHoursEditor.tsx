'use client'

import { useState } from 'react'
import { FiClock } from 'react-icons/fi'

type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

type HoursData = {
  [key in Day]?: {
    open: string
    close: string
    closed: boolean
  }
}

type Props = {
  initialHours?: HoursData
  onChange: (hours: HoursData) => void
}

const DAYS: { key: Day; label: string }[] = [
  { key: 'monday', label: 'Ponedjeljak' },
  { key: 'tuesday', label: 'Utorak' },
  { key: 'wednesday', label: 'Srijeda' },
  { key: 'thursday', label: 'Četvrtak' },
  { key: 'friday', label: 'Petak' },
  { key: 'saturday', label: 'Subota' },
  { key: 'sunday', label: 'Nedjelja' },
]

export function VenueHoursEditor({ initialHours = {}, onChange }: Props) {
  const [hours, setHours] = useState<HoursData>(initialHours)

  function updateDay(day: Day, updates: Partial<HoursData[Day]>) {
    const newHours = {
      ...hours,
      [day]: {
        ...(hours[day] || { open: '09:00', close: '17:00', closed: false }),
        ...updates,
      },
    }
    setHours(newHours)
    onChange(newHours)
  }

  function toggleClosed(day: Day) {
    const currentClosed = hours[day]?.closed || false
    updateDay(day, { closed: !currentClosed })
  }

  function setSameHours() {
    const firstDayHours = hours[DAYS[0].key]
    if (!firstDayHours) return

    const allDays: HoursData = {}
    DAYS.forEach((day) => {
      allDays[day.key] = {
        open: firstDayHours.open,
        close: firstDayHours.close,
        closed: firstDayHours.closed,
      }
    })

    setHours(allDays)
    onChange(allDays)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Radno Vrijeme</h3>
        <button
          type="button"
          onClick={setSameHours}
          className="text-sm text-primary hover:text-primary-hover font-medium"
        >
          Kopiraj prvi dan na sve
        </button>
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => {
          const dayHours = hours[day.key] || { open: '09:00', close: '17:00', closed: false }

          return (
            <div key={day.key} className="flex items-center gap-3">
              <div className="w-24 text-sm font-medium text-text-primary">{day.label}</div>

              {dayHours.closed ? (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-sm text-text-tertiary">Zatvoreno</span>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => updateDay(day.key, { open: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <span className="text-text-secondary">do</span>
                  <div className="relative flex-1">
                    <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="time"
                      value={dayHours.close}
                      onChange={(e) => updateDay(day.key, { close: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => toggleClosed(day.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  dayHours.closed
                    ? 'bg-primary text-white hover:bg-primary-hover'
                    : 'bg-white text-text-primary border border-border hover:border-primary'
                }`}
                style={dayHours.closed ? { color: 'white' } : undefined}
              >
                {dayHours.closed ? 'Otvoreno' : 'Zatvoreno'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => {
            const closedHours: HoursData = {}
            DAYS.forEach((day) => {
              closedHours[day.key] = { open: '09:00', close: '17:00', closed: true }
            })
            setHours(closedHours)
            onChange(closedHours)
          }}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Postavi sve dane na zatvoreno
        </button>
      </div>
    </div>
  )
}
