'use client'

import { useState } from 'react'
import { MdAdd, MdRemove } from 'react-icons/md'
import { useTranslation } from '@/i18n/useTranslation'
import type { Locale } from '@/i18n/config'

export function FAQ({ locale = 'en' }: { locale?: Locale }) {
  const { t } = useTranslation(locale)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  function toggleQuestion(index: number) {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqsRaw = t('faq.items')
  const faqs: Array<{
    question: string
    answer: string
  }> = Array.isArray(faqsRaw) ? faqsRaw : []

  return (
    <section className="py-12 bg-[#F7F7F7] border-b border-[#EBEBEB]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3">
            {t('faq.title')}
          </h2>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto text-center">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-[#EBEBEB] hover:border-primary transition-colors rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-semibold text-text-primary text-sm md:text-base">
                  {faq.question}
                </span>
                <div className="text-primary">
                  {openIndex === index ? (
                    <MdRemove className="text-xl" />
                  ) : (
                    <MdAdd className="text-xl" />
                  )}
                </div>
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
