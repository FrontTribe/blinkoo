'use client'

import { useMemo, useState, useEffect } from 'react'
import { translations, type Locale, defaultLocale } from './config'

// Simple in-memory cache for translations
const translationCache: Record<string, any> = {}
const loadingPromises: Record<string, Promise<any> | undefined> = {}

export function useTranslation(locale: Locale = defaultLocale) {
  const [messages, setMessages] = useState<any>(translationCache[locale] || null)

  useEffect(() => {
    if (translationCache[locale]) {
      setMessages(translationCache[locale])
      return
    }

    // If already loading, wait for that promise
    if (loadingPromises[locale]) {
      loadingPromises[locale].then((msgs) => {
        translationCache[locale] = msgs
        setMessages(msgs)
      })
      return
    }

    // Start loading
    const promise = translations[locale]().then((msgs) => {
      translationCache[locale] = msgs
      setMessages(msgs)
      return msgs
    })
    loadingPromises[locale] = promise
  }, [locale])

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      if (!messages) {
        // Return undefined if messages not loaded yet (components should handle this)
        return undefined
      }
      const keys = key.split('.')
      let value: any = messages
      for (const k of keys) {
        if (value === null || value === undefined) {
          return undefined
        }
        value = value[k]
      }

      // If value is undefined, return undefined (not the key)
      if (value === undefined || value === null) {
        return undefined
      }

      // Handle string interpolation
      if (typeof value === 'string' && params) {
        return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
          return params[paramKey]?.toString() || ''
        })
      }

      // Return the actual value (could be string, array, object, etc.)
      return value
    }
  }, [messages])

  return { t, locale }
}
