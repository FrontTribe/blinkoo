'use client'

import { useTranslation } from '@/i18n/useTranslation'
import type { Locale } from '@/i18n/config'

export function Footer({ locale = 'en' }: { locale?: Locale }) {
  const { t } = useTranslation(locale)

  return (
    <footer className="bg-text-primary text-white border-t border-[#333]">
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="font-heading text-xl font-bold mb-2">Blinkoo</h3>
            <p className="text-sm text-gray-300">{t('footer.description')}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <a href="/privacy" className="hover:text-white transition-colors">
              {t('footer.privacy')}
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-white transition-colors">
              {t('footer.terms')}
            </a>
            <span>•</span>
            <a href="/contact" className="hover:text-white transition-colors">
              {t('footer.contact')}
            </a>
          </div>
        </div>
        <div className="border-t border-[#333] mt-6 pt-6 text-center text-sm text-gray-400">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  )
}
