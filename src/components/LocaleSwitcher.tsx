'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FiGlobe } from 'react-icons/fi'
import { locales, type Locale } from '@/i18n/config'

export function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [locale, setLocale] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get locale from cookie
    const cookieLocale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('locale='))
      ?.split('=')[1] as Locale | undefined

    if (cookieLocale && locales.includes(cookieLocale)) {
      setLocale(cookieLocale)
    } else {
      // Check URL params
      const urlLocale = searchParams.get('locale')
      if (urlLocale && locales.includes(urlLocale as Locale)) {
        setLocale(urlLocale as Locale)
      }
    }
  }, [searchParams])

  function changeLocale(newLocale: Locale) {
    if (newLocale === locale) return

    // Set cookie
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000` // 1 year
    setLocale(newLocale)

    // Update URL with locale param
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('locale', newLocale)

    // Reload page to apply new locale
    window.location.href = currentUrl.toString()
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <FiGlobe className="w-4 h-4 text-text-tertiary" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 relative">
      <FiGlobe className="w-4 h-4 text-text-tertiary" />
      <select
        value={locale}
        onChange={(e) => changeLocale(e.target.value as Locale)}
        className="text-xs px-2 py-1.5 bg-white border border-border text-text-primary rounded focus:outline-none focus:border-primary cursor-pointer appearance-none pr-6"
        aria-label="Select language"
      >
        <option value="en">EN</option>
        <option value="hr">HR</option>
      </select>
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-3 h-3 text-text-tertiary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
