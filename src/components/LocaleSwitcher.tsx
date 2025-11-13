'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { FiGlobe } from 'react-icons/fi'
import { type Locale } from '@/i18n/config'

export function LocaleSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  function changeLocale(newLocale: Locale) {
    if (newLocale === locale) return

    // Use next-intl's router to navigate to the same pathname with new locale
    router.replace(pathname, { locale: newLocale })
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
