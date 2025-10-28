'use client'

import { useState } from 'react'
import { MdAdd, MdRemove } from 'react-icons/md'

type FAQItem = {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'How do I claim an offer?',
    answer:
      'Simply browse available offers, tap "Claim" to reserve your spot, and receive a unique QR code or 6-digit redemption code. No fees, instant confirmation.',
  },
  {
    question: 'Is there a fee to use Blinkoo?',
    answer:
      'Blinkoo is completely free for customers. Merchants only pay a small commission when offers are successfully redeemed. No upfront costs or subscriptions.',
  },
  {
    question: "What if I can't make it in time?",
    answer:
      "Offers are time-limited by design. If you can't make it, your claim will expire and the offer becomes available for others. Always check the expiration time before claiming.",
  },
  {
    question: 'How do merchants benefit?',
    answer:
      'Merchants fill slow hours with targeted customers. They control inventory, pricing, and timing. Average merchants see 35-40% increase in off-peak traffic with no upfront costs.',
  },
  {
    question: 'Are offers really limited?',
    answer:
      "Yes! Each offer has a limited quantity to create urgency and exclusivity. Once an offer slot is claimed, it's gone. This ensures deals are real and impactful.",
  },
  {
    question: 'How do I redeem my claim?',
    answer:
      "Visit the venue during the offer's active window, show your 6-digit code or QR code to staff, and enjoy your discount. Redemption is instant and seamless.",
  },
  {
    question: 'Can I claim multiple offers?',
    answer:
      'Yes, you can claim multiple offers from different merchants. Each offer has its own time limit and redemption process. Check your "My Claims" section to manage them all.',
  },
  {
    question: 'What types of businesses use Blinkoo?',
    answer:
      'Restaurants, cafes, gyms, spas, entertainment venues, and more. Any local business looking to drive traffic during slow hours.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  function toggleQuestion(index: number) {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-12 bg-[#F7F7F7] border-b border-[#EBEBEB]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto text-center">
            Everything you need to know about using Off-Peak
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-[#EBEBEB] hover:border-primary transition-colors"
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
