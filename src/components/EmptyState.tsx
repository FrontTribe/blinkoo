'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href: string
    onClick?: () => void
  }
  illustration?: ReactNode
}

export function EmptyState({ icon, title, description, action, illustration }: EmptyStateProps) {
  return (
    <div className="bg-white border border-border p-12 text-center">
      {illustration || (
        <div className="mb-6 flex justify-center">
          {icon || (
            <div className="w-24 h-24 rounded-full bg-bg-secondary flex items-center justify-center">
              <svg
                className="w-12 h-12 text-text-tertiary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
          )}
        </div>
      )}
      <h3 className="font-heading text-xl font-semibold text-text-primary mb-2">{title}</h3>
      {description && <p className="text-text-secondary mb-6">{description}</p>}
      {action &&
        (action.onClick ? (
          <button
            onClick={action.onClick}
            className="inline-block bg-primary text-white px-6 py-3 hover:bg-primary-hover transition-colors font-semibold"
            style={{ color: 'white' }}
          >
            {action.label}
          </button>
        ) : (
          <Link
            href={action.href}
            className="inline-block bg-primary text-white px-6 py-3 hover:bg-primary-hover transition-colors font-semibold"
            style={{ color: 'white' }}
          >
            {action.label}
          </Link>
        ))}
    </div>
  )
}
