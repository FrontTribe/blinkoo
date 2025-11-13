'use client'

import { MdStar } from 'react-icons/md'
import { useTranslation } from '@/i18n/useTranslation'
import type { Locale } from '@/i18n/config'

function renderStars(rating: number) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <MdStar key={i} className={i < rating ? 'text-primary' : 'text-[#EBEBEB]'} />
      ))}
    </div>
  )
}

export function Testimonials({ locale = 'en' }: { locale?: Locale }) {
  const { t } = useTranslation(locale)

  const testimonialsRaw = t('testimonials.items')
  const testimonials: Array<{
    quote: string
    author: string
    role: string
  }> = Array.isArray(testimonialsRaw) ? testimonialsRaw : []

  return (
    <section className="py-12 bg-white border-b border-[#EBEBEB]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3">
            {t('testimonials.title')}
          </h2>
          <div className="flex justify-center">
            <p className="text-base md:text-lg text-text-secondary max-w-2xl text-center">
              {t('testimonials.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 border border-[#EBEBEB] hover:border-primary transition-colors"
            >
              <div className="mb-4">{renderStars(5)}</div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div>
                <div className="font-semibold text-text-primary text-sm">{testimonial.author}</div>
                <div className="text-xs text-text-secondary">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
