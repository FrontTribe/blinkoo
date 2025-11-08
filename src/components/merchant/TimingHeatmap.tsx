'use client'

import { FiCalendar, FiClock } from 'react-icons/fi'

type HourlyData = {
  hour: number
  count: number
}

type DailyData = {
  day: number
  dayName: string
  count: number
}

interface TimingHeatmapProps {
  hourlyData: HourlyData[]
  dailyData: DailyData[]
  coldHours: number[]
}

export function TimingHeatmap({ hourlyData, dailyData, coldHours }: TimingHeatmapProps) {
  const maxCount = Math.max(...hourlyData.map((h) => h.count), 1)

  function getIntensity(count: number): string {
    if (count === 0) return 'bg-gray-100 text-gray-400'
    const percentage = (count / maxCount) * 100
    if (percentage < 20) return 'bg-blue-100 text-blue-700'
    if (percentage < 40) return 'bg-blue-200 text-blue-700'
    if (percentage < 60) return 'bg-blue-300 text-blue-700'
    if (percentage < 80) return 'bg-blue-400 text-blue-700'
    return 'bg-blue-500 text-white'
  }

  return (
    <div className="space-y-6">
      {/* Hourly Heatmap */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FiClock className="text-primary text-lg" />
          <h3 className="font-heading text-lg font-semibold text-text-primary">Po satima u danu</h3>
        </div>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {hourlyData.map(({ hour, count }) => (
            <div
              key={hour}
              className={`text-center p-2 rounded border ${getIntensity(count)} ${
                coldHours.includes(hour) ? 'ring-2 ring-red-300' : ''
              }`}
            >
              <div className="text-xs font-medium">{hour}:00</div>
              <div className="text-sm font-bold mt-1">{count}</div>
              {coldHours.includes(hour) && <div className="text-xs mt-1 opacity-75">Slabo</div>}
            </div>
          ))}
        </div>
        <p className="text-xs text-text-secondary mt-2">
          <span className="inline-block w-3 h-3 bg-gray-100 mr-1" />
          Nema aktivnosti,
          <span className="inline-block w-3 h-3 bg-blue-100 mr-1 ml-2" />
          Niska,
          <span className="inline-block w-3 h-3 bg-blue-300 mr-1 ml-2" />
          Srednja,
          <span className="inline-block w-3 h-3 bg-blue-500 mr-1 ml-2" />
          Visoka
        </p>
      </div>

      {/* Daily Heatmap */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar className="text-primary text-lg" />
          <h3 className="font-heading text-lg font-semibold text-text-primary">Po danima u tjednu</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {dailyData.map(({ day, dayName, count }) => (
            <div key={day} className={`text-center p-3 rounded border ${getIntensity(count)}`}>
              <div className="text-xs font-medium mb-1">{dayName.substring(0, 3)}</div>
              <div className="text-lg font-bold">{count}</div>
              <div className="text-xs mt-1">rezervacija</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
