'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiFilter, FiCheck } from 'react-icons/fi'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const url =
        filter === 'unread'
          ? '/api/merchant/notifications?unreadOnly=true&limit=100'
          : '/api/merchant/notifications?limit=100'
      
      const response = await fetch(url, {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const response = await fetch('/api/merchant/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          notificationIds: [notificationId],
          read: true,
        }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
        )
        toast.success('Marked as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark as read')
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return

    try {
      const response = await fetch('/api/merchant/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          notificationIds: unreadIds,
          read: true,
        }),
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        toast.success('All notifications marked as read')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'kyc_approved':
        return '✅'
      case 'kyc_rejected':
        return '⚠️'
      case 'offer_claimed':
        return '🎫'
      case 'offer_expiring':
        return '⏰'
      default:
        return '🔔'
    }
  }

  function getNotificationColor(type: string) {
    switch (type) {
      case 'kyc_approved':
        return 'bg-green-50 border-green-200'
      case 'kyc_rejected':
        return 'bg-red-50 border-red-200'
      case 'offer_claimed':
        return 'bg-blue-50 border-blue-200'
      case 'offer_expiring':
        return 'bg-amber-50 border-amber-200'
      default:
        return 'bg-bg-secondary border-border'
    }
  }

  return (
    <div className="min-h-screen bg-white py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/merchant/dashboard"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4"
            >
              <FiArrowLeft />
              Back to Dashboard
            </Link>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
              Notifications
            </h1>
            <p className="mt-2 text-sm md:text-base text-text-secondary">
              View and manage your account notifications
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-primary text-lg" />
            <h2 className="font-heading text-lg font-bold text-text-primary">Filters</h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-semibold border transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-semibold border transition-colors ${
                filter === 'unread'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary'
              }`}
            >
              Unread Only
            </button>
            {notifications.filter((n) => !n.read).length > 0 && (
              <button
                onClick={markAllAsRead}
                className="ml-auto px-4 py-2 text-sm font-semibold bg-white text-text-secondary border border-border hover:border-primary transition-colors flex items-center gap-2"
              >
                <FiCheck />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
            <h2 className="font-heading text-lg font-bold text-text-primary">
              Your Notifications ({notifications.length})
            </h2>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-text-secondary text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-bg-secondary flex items-center justify-center mb-4">
                <span className="text-3xl">🔔</span>
              </div>
              <p className="text-text-tertiary font-medium">No notifications</p>
              <p className="text-text-tertiary text-sm mt-1">
                {filter === 'unread' ? 'You have no unread notifications' : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-bg-secondary transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className={`font-semibold text-lg ${
                            !notification.read ? 'text-text-primary' : 'text-text-secondary'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-text-secondary text-sm mb-3 whitespace-pre-line">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-tertiary">
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <div className="flex items-center gap-3">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
                            >
                              <FiCheck className="w-4 h-4" />
                              Mark read
                            </button>
                          )}
                          {notification.link && (
                            <Link
                              href={notification.link}
                              className="text-xs font-semibold text-primary hover:text-primary-hover"
                            >
                              View →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
