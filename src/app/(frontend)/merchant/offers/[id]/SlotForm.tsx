'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { DatePicker } from '@/components/DatePicker'

type SlotFormProps = {
  offerId: string
  onSlotCreated: () => void
  onCancel: () => void
}

export default function SlotForm({ offerId, onSlotCreated, onCancel }: SlotFormProps) {
  const [formData, setFormData] = useState({
    startsAt: '',
    endsAt: '',
    qtyTotal: '',
    mode: 'flash',
    dripEveryMinutes: '',
    dripQty: '',
  })

  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/merchant/offers/${offerId}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create slot')
      }

      toast.success('Slot created successfully!')
      onSlotCreated()
    } catch (error: any) {
      console.error('Error creating slot:', error)
      toast.error(error.message || 'Failed to create slot')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePicker
          label="Start Date & Time *"
          value={formData.startsAt}
          onChange={(value) => setFormData({ ...formData, startsAt: value })}
          required
        />
        <DatePicker
          label="End Date & Time *"
          value={formData.endsAt}
          onChange={(value) => setFormData({ ...formData, endsAt: value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Total Quantity *
          </label>
          <input
            type="number"
            value={formData.qtyTotal}
            onChange={(e) => setFormData({ ...formData, qtyTotal: e.target.value })}
            className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
            placeholder="100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Release Mode *
          </label>
          <select
            value={formData.mode}
            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
            className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
            required
          >
            <option value="flash">Flash (all at once)</option>
            <option value="drip">Drip (gradual release)</option>
          </select>
        </div>
      </div>

      {formData.mode === 'drip' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Drip Every (minutes)
            </label>
            <input
              type="number"
              value={formData.dripEveryMinutes}
              onChange={(e) => setFormData({ ...formData, dripEveryMinutes: e.target.value })}
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
              value={formData.dripQty}
              onChange={(e) => setFormData({ ...formData, dripQty: e.target.value })}
              className="w-full px-4 py-3 bg-white text-text-primary border border-border focus:outline-none focus:border-primary transition-colors"
              placeholder="10"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#EBEBEB]">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-white text-text-primary border border-border hover:border-primary transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          style={{ color: 'white' }}
        >
          {submitting ? 'Creating...' : 'Create Slot'}
        </button>
      </div>
    </form>
  )
}
