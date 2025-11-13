import { cookies, headers } from 'next/headers'
import { defaultLocale, type Locale, locales } from './config'

export async function getLocale(searchParams?: {
  [key: string]: string | string[] | undefined
}): Promise<Locale> {
  // Try to get locale from URL search params first
  if (searchParams?.locale) {
    const urlLocale = Array.isArray(searchParams.locale)
      ? searchParams.locale[0]
      : searchParams.locale
    if (locales.includes(urlLocale as Locale)) {
      return urlLocale as Locale
    }
  }

  // Try to get locale from cookie
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('locale')?.value

  if (localeCookie && locales.includes(localeCookie as Locale)) {
    return localeCookie as Locale
  }

  // Try to get from Accept-Language header
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language')

  if (acceptLanguage) {
    // Check if Croatian is preferred
    if (acceptLanguage.includes('hr') || acceptLanguage.includes('cro')) {
      return 'hr'
    }
  }

  return defaultLocale
}
