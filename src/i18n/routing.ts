import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // All supported locales
  locales: ['en', 'hr'],

  // Default locale
  defaultLocale: 'hr',

  // Show locale prefix only when needed (default locale has no prefix)
  // So: / (hr), /en/... (en)
  localePrefix: 'as-needed',
})
