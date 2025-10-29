'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

// OneSignal SDK (loaded dynamically)
declare global {
  interface Window {
    OneSignal?: any
  }
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if OneSignal is loaded
    const checkOneSignal = () => {
      if (window.OneSignal) {
        setIsSupported(true)
        setIsReady(true)

        // Check current subscription status
        window.OneSignal.isPushNotificationsEnabled((enabled: boolean) => {
          setIsSubscribed(enabled)
        })

        // Check permission
        if ('Notification' in window) {
          setPermission(Notification.permission)
        }
      } else {
        // Retry after a short delay
        setTimeout(checkOneSignal, 100)
      }
    }

    // OneSignal SDK should be loaded via script tag in layout
    // Initialize when it's available
    if (process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
      const initOneSignal = () => {
        if (window.OneSignal) {
          window.OneSignal = window.OneSignal || []
          window.OneSignal.push(function () {
            window.OneSignal.init({
              appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
              safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID,
              notifyButton: {
                enable: false, // We'll use our own UI
              },
              allowLocalhostAsSecureOrigin: true,
            })

            checkOneSignal()
          })
        } else {
          // SDK not loaded yet, retry
          setTimeout(initOneSignal, 100)
        }
      }

      initOneSignal()
    }

    return () => {
      // Cleanup if needed
    }
  }, [])

  async function requestPermission() {
    if (!isSupported || !isReady) {
      toast.error('OneSignal is not ready. Please wait a moment.')
      return false
    }

    try {
      // OneSignal will handle permission request
      window.OneSignal?.registerForPushNotifications()

      // Wait a moment and check status
      setTimeout(() => {
        window.OneSignal?.isPushNotificationsEnabled((enabled: boolean) => {
          setIsSubscribed(enabled)
          if (enabled) {
            setPermission('granted')
            toast.success('Notifications enabled!')
          } else {
            setPermission('denied')
            toast.error('Notification permission denied')
          }
        })
      }, 1000)

      return true
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast.error('Failed to request notification permission')
      return false
    }
  }

  async function subscribe() {
    if (!isReady) {
      await requestPermission()
      return
    }

    try {
      window.OneSignal?.registerForPushNotifications()

      // Update subscription status
      setTimeout(() => {
        window.OneSignal?.isPushNotificationsEnabled((enabled: boolean) => {
          setIsSubscribed(enabled)
          if (enabled) {
            // Get player ID and send to server
            window.OneSignal?.getUserId((userId: string) => {
              if (userId) {
                fetch('/api/web/notifications/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ playerId: userId }),
                  credentials: 'include',
                })
              }
            })
            toast.success('Push notifications enabled!')
          }
        })
      }, 1000)
    } catch (error: any) {
      console.error('Error subscribing to push:', error)
      toast.error(error.message || 'Failed to enable push notifications')
    }
  }

  async function unsubscribe() {
    if (!isReady) return

    try {
      window.OneSignal?.setSubscription(false)

      // Notify server
      await fetch('/api/web/notifications/unsubscribe', {
        method: 'POST',
        credentials: 'include',
      })

      setIsSubscribed(false)
      toast.success('Push notifications disabled')
    } catch (error) {
      console.error('Error unsubscribing:', error)
      toast.error('Failed to disable push notifications')
    }
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    requestPermission,
    isReady,
  }
}

// Default export for compatibility
export default usePushNotifications
