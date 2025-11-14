'use client'

import { MdWarning } from 'react-icons/md'

type Props = {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-black border border-gray-800 p-8 max-w-md w-full mx-4 rounded-lg">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-orange-primary/20 p-3 border border-orange-primary/30 rounded-lg">
            <MdWarning className="text-orange-primary text-2xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-transparent text-gray-300 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all rounded-lg"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-orange-primary text-white hover:bg-orange-light transition-colors rounded-lg"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
