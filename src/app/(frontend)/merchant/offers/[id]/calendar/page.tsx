'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiCalendar, FiClock } from 'react-icons/fi'

export default function SlotsCalendarPage() {
  const params = useParams()
  const router = useRouter()
  const offerId = params.id as string
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    async function fetchSlots() {
      try {
        const response = await fetch(`/api/merchant/offers/${offerId}/slots`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setSlots(data.slots || [])
        }
      } catch (error) {
        console.error('Error fetching slots:', error)
      } finally {
        setLoading(false)
      }
    }

    if (offerId) {
      fetchSlots()
    }
  }, [offerId])

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (Date | null)[] = []

    // Add empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  function getSlotsForDate(date: Date | null) {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return slots.filter((slot: any) => {
      const slotDate = new Date(slot.startsAt).toISOString().split('T')[0]
      return slotDate === dateStr
    })
  }

  function previousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  function today() {
    setCurrentMonth(new Date())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-primary">Učitavanje kalendara...</p>
      </div>
    )
  }

  const days = getDaysInMonth(currentMonth)
  const monthNames = [
    'Siječanj',
    'Veljača',
    'Ožujak',
    'Travanj',
    'Svibanj',
    'Lipanj',
    'Srpanj',
    'Kolovoz',
    'Rujan',
    'Listopad',
    'Studeni',
    'Prosinac',
  ]
  const dayNames = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub']

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href={`/merchant/offers/${offerId}`}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <FiArrowLeft />
          Natrag na ponudu
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold text-text-primary">Kalendar Ponude</h1>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="px-4 py-2 bg-white border border-border hover:border-primary transition-colors font-medium"
            >
              ← Prethodno
            </button>
            <button
              onClick={today}
              className="px-4 py-2 bg-white border border-border hover:border-primary transition-colors font-medium"
            >
              Danas
            </button>
            <button
              onClick={nextMonth}
              className="px-4 py-2 bg-white border border-border hover:border-primary transition-colors font-medium"
            >
              Sljedeće →
            </button>
          </div>
        </div>

        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-text-primary">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
        </div>

        <div className="bg-white border border-border">
          <div className="grid grid-cols-7 border-b border-border">
            {dayNames.map((day) => (
              <div key={day} className="p-4 text-center text-sm font-medium text-text-secondary">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              const daySlots = getSlotsForDate(date)
              const isToday = date && date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-r border-b border-border ${
                    !date ? 'bg-[#F7F7F7]' : 'bg-white hover:bg-[#F7F7F7]'
                  } ${isToday ? 'bg-primary/5' : ''}`}
                >
                  {date && (
                    <>
                      <div
                        className={`text-sm font-semibold mb-1 ${
                          isToday ? 'text-primary' : 'text-text-primary'
                        }`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {daySlots.slice(0, 2).map((slot: any) => {
                          const startTime = new Date(slot.startsAt).toLocaleTimeString('hr-HR', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: false,
                          })
                          const fillPercent =
                            slot.qtyTotal > 0
                              ? ((slot.qtyRemaining / slot.qtyTotal) * 100).toFixed(0)
                              : 0

                          return (
                            <div
                              key={slot.id}
                              className={`text-xs p-1 rounded truncate ${
                                slot.state === 'live'
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : slot.state === 'scheduled'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : slot.state === 'ended'
                                      ? 'bg-gray-100 text-gray-600 border border-gray-300'
                                      : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                              }`}
                              title={`${startTime} - ${fillPercent}% preostalo`}
                            >
                              <div className="flex items-center gap-1">
                                <FiClock className="text-[10px]" />
                                <span className="truncate">{startTime}</span>
                              </div>
                              <div className="text-[10px] opacity-75">
                                {slot.qtyRemaining}/{slot.qtyTotal}
                              </div>
                            </div>
                          )
                        })}
                        {daySlots.length > 2 && (
                          <div className="text-xs text-text-tertiary px-1">
                            +{daySlots.length - 2} više
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white border border-border p-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">Legenda</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm text-text-secondary">Aktivno</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-sm text-text-secondary">Zakazano</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span className="text-sm text-text-secondary">Pauzirano</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-sm text-text-secondary">Završeno</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="bg-white border border-border p-6">
            <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase">Ukupno Slotova</h3>
            <p className="font-heading text-3xl font-bold text-text-primary">{slots.length}</p>
          </div>
          <div className="bg-white border border-border p-6">
            <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase">Aktivno Sada</h3>
            <p className="font-heading text-3xl font-bold text-green-600">
              {slots.filter((s: any) => s.state === 'live').length}
            </p>
          </div>
          <div className="bg-white border border-border p-6">
            <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase">Zakazano</h3>
            <p className="font-heading text-3xl font-bold text-blue-600">
              {slots.filter((s: any) => s.state === 'scheduled').length}
            </p>
          </div>
          <div className="bg-white border border-border p-6">
            <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase">Ovaj Mjesec</h3>
            <p className="font-heading text-3xl font-bold text-text-primary">
              {
                slots.filter((slot: any) => {
                  const slotDate = new Date(slot.startsAt)
                  return (
                    slotDate.getMonth() === currentMonth.getMonth() &&
                    slotDate.getFullYear() === currentMonth.getFullYear()
                  )
                }).length
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
