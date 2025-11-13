import { translations, type Locale, defaultLocale } from './config'

// Server-side translation function
let translationCache: Record<string, any> = {}

export async function getTranslation(locale: Locale = defaultLocale) {
  if (translationCache[locale]) {
    return createTFunction(translationCache[locale])
  }

  const messages = await translations[locale]()
  translationCache[locale] = messages
  return createTFunction(messages)
}

function createTFunction(messages: any) {
  return (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.')
    let value: any = messages
    for (const k of keys) {
      if (value === null || value === undefined) {
        return undefined
      }
      value = value[k]
    }

    // If value is undefined, return undefined
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
}
