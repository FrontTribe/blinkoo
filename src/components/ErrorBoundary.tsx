'use client'

import React, { Component, ReactNode } from 'react'
import { FiAlertCircle } from 'react-icons/fi'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-border p-8 text-center">
            <FiAlertCircle className="text-error text-5xl mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-2">
              Something went wrong
            </h2>
            <p className="text-text-secondary mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="bg-primary text-white px-6 py-3 hover:bg-primary-hover transition-colors font-semibold"
              style={{ color: 'white' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
