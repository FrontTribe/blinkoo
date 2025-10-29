'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { MdArrowBack, MdAdd } from 'react-icons/md'

type Pattern = {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  qtyTotal: string
  mode: string
  dripEveryMinutes: string
  dripQty: string
  daysOfWeek: string[]
}

export default function BulkSlotsPage() {
  const router = useRouter()
  const params = useParams()
  const offerId = params.id as string

  const [patterns, setPatterns] = useState<Pattern[]>([
    {
      startDate: '',
      endDate: '',
      startTime: '14:00',
      endTime: '17:00',
      qtyTotal: '50',
      mode: 'flash',
      dripEveryMinutes: '',
      dripQty: '',
      daysOfWeek: [],
    },
  ])

  const [submitting, setSubmitting] = useState(false)

  function addPattern() {
    setPatterns([
      ...patterns,
      {
        startDate: '',
        endDate: '',
        startTime: '14:00',
        endTime: '17:00',
        qtyTotal: '50',
        mode: 'flash',
        dripEveryMinutes: '',
        dripQty: '',
        daysOfWeek: [],
      },
    ])
  }

  function removePattern(index: number) {
    setPatterns(patterns.filter((_, i) => i !== index))
  }

  function updatePattern(index: number, field: keyof Pattern, value: any) {
    const updated = [...patterns]
    updated[index] = { ...updated[index], [field]: value }
    setPatterns(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/merchant/offers/${offerId}/bulk-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ offerId, patterns }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create bulk slots')
      }

      const data = await response.json()
      toast.success(`Successfully created ${data.created} slots!`)

      setTimeout(() => {
        router.push(`/merchant/offers/${offerId}`)
      }, 1000)
    } catch (error: any) {
      console.error('Error creating bulk slots:', error)
      toast.error(error.message || 'Failed to create bulk slots')
    } finally {
      setSubmitting(false)
    }
  }

  const weekDays = [
    { label: 'Mon', value: 'monday' },
    { label: 'Tue', value: 'tuesday' },
    { label: 'Wed', value: 'wednesday' },
    { label: 'Thu', value: 'thursday' },
    { label: 'Fri', value: 'friday' },
    { label: 'Sat', value: 'saturday' },
    { label: 'Sun', value: 'sunday' },
  ]

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/merchant/offers/${offerId}`}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <MdArrowBack />
          Back to offer
        </Link>

        <div className="bg-white border border-border p-8 md:p-10">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-2">
            Create Bulk Slots
          </h1>
          <p className="text-sm text-text-secondary mb-8">
            Create multiple time slots at once using date ranges and patterns
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {patterns.map((pattern, index) => (
              <div key={index} className="border border-border p-6 bg-[#F7F7F7]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-lg font-semibold text-text-primary">
                    Pattern {index + 1}
                  </h3>
                  {patterns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePattern(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={pattern.startDate}
                        onChange={(e) => updatePattern(index, 'startDate', e.target.value)}
                        className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={pattern.endDate}
                        onChange={(e) => updatePattern(index, 'endDate', e.target.value)}
                        className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={pattern.startTime}
                        onChange={(e) => updatePattern(index, 'startTime', e.target.value)}
                        className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={pattern.endTime}
                        onChange={(e) => updatePattern(index, 'endTime', e.target.value)}
                        className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Days of Week
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            const newDays = pattern.daysOfWeek.includes(day.value)
                              ? pattern.daysOfWeek.filter((d) => d !== day.value)
                              : [...pattern.daysOfWeek, day.value]
                            updatePattern(index, 'daysOfWeek', newDays)
                          }}
                          className={`px-3 py-2 text-sm font-medium border transition-colors ${
                            pattern.daysOfWeek.includes(day.value)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-text-primary border-border hover:border-primary'
                          }`}
                          style={
                            pattern.daysOfWeek.includes(day.value)
                              ? { backgroundColor: '#3B82F6', color: 'white' }
                              : undefined
                          }
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-text-tertiary mt-2">
                      Leave empty to create slots for all days
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Quantity per Slot *
                      </label>
                      <input
                        type="number"
                        value={pattern.qtyTotal}
                        onChange={(e) => updatePattern(index, 'qtyTotal', e.target.value)}
                        className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                        placeholder="50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Release Mode *
                      </label>
                      <select
                        value={pattern.mode}
                        onChange={(e) => updatePattern(index, 'mode', e.target.value)}
                        className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                        required
                      >
                        <option value="flash">Flash (all at once)</option>
                        <option value="drip">Drip (gradual release)</option>
                      </select>
                    </div>
                  </div>

                  {pattern.mode === 'drip' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Drip Every (minutes)
                        </label>
                        <input
                          type="number"
                          value={pattern.dripEveryMinutes}
                          onChange={(e) => updatePattern(index, 'dripEveryMinutes', e.target.value)}
                          className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                          placeholder="15"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Drip Quantity
                        </label>
                        <input
                          type="number"
                          value={pattern.dripQty}
                          onChange={(e) => updatePattern(index, 'dripQty', e.target.value)}
                          className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
                          placeholder="10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addPattern}
              className="w-full py-3 border border-dashed border-border hover:border-primary transition-colors text-text-primary flex items-center justify-center gap-2 font-medium"
            >
              <MdAdd className="text-xl" />
              Add Another Pattern
            </button>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-[#EBEBEB]">
              <Link
                href={`/merchant/offers/${offerId}`}
                className="px-6 py-3 bg-white text-text-primary border border-border hover:border-primary transition-colors font-semibold text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                style={{ color: 'white' }}
              >
                {submitting ? 'Creating Slots...' : 'Create All Slots'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
