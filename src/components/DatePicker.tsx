'use client'

import { useState, useEffect } from 'react'
import DatePickerLib from 'react-datepicker'
import './DatePicker.css'

interface DatePickerProps {
  label: string
  value: string
  onChange: (date: string) => void
  error?: string
  required?: boolean
}

export function DatePicker({ label, value, onChange, error, required }: DatePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(value ? new Date(value) : null)

  useEffect(() => {
    setStartDate(value ? new Date(value) : null)
  }, [value])

  const handleChange = (date: Date | null) => {
    setStartDate(date)
    if (date) {
      // Format as datetime-local string
      const formatted = date.toISOString().slice(0, 16)
      console.log('DatePicker onChange:', formatted)
      onChange(formatted)
    } else {
      console.log('DatePicker onChange: null date')
      onChange('')
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
      <div
        className={`w-full border ${
          error ? 'border-red-200' : 'border-border'
        } focus-within:border-primary transition-colors`}
      >
        <DatePickerLib
          selected={startDate}
          onChange={handleChange}
          showTimeSelect
          timeIntervals={15}
          dateFormat="yyyy-MM-dd HH:mm"
          className="w-full"
          required={required}
          placeholderText="Select date and time"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
