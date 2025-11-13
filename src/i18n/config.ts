export const locales = ['en', 'hr'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const translations = {
  en: () => import('./messages/en.json').then((module) => module.default),
  hr: () => import('./messages/hr.json').then((module) => module.default),
} as const
