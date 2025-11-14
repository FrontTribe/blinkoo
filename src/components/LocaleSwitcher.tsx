'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { FiGlobe, FiChevronDown, FiCheck } from 'react-icons/fi'
import { type Locale } from '@/i18n/config'

type Language = {
  code: Locale
  label: string
  flag: string
}

const languages: Language[] = [
  { code: 'hr', label: 'Hrvatski', flag: '🇭🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export function LocaleSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  function changeLocale(newLocale: Locale) {
    if (newLocale === locale) {
      setIsOpen(false)
      return
    }

    // Use next-intl's router to navigate to the same pathname with new locale
    router.replace(pathname, { locale: newLocale })
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border hover:border-primary transition-all rounded-lg text-sm font-medium text-text-primary hover:bg-bg-secondary"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
        <FiChevronDown
          className={`w-4 h-4 text-text-tertiary transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-border shadow-lg rounded-lg overflow-hidden z-50 transition-all duration-200 ease-out">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLocale(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  locale === language.code
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="flex-1 text-left">{language.label}</span>
                {locale === language.code && (
                  <FiCheck className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
