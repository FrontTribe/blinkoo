'use client'

import { MdStar } from 'react-icons/md'

type Testimonial = {
  quote: string
  author: string
  role: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Off-Peak helped us fill our 2-4pm slot with 30+ customers daily. Revenue increased by 35% in our slow hours.',
    author: 'Sarah Chen',
    role: 'Owner, Brew & Bites Cafe',
    rating: 5,
  },
  {
    quote:
      'Saved over $200 this month on dining out. The offers are real and redemption is super easy with the QR code.',
    author: 'Marcus Rodriguez',
    role: 'Foodie & Local Explorer',
    rating: 5,
  },
  {
    quote:
      "As a gym owner, our 10am-2pm was dead. Now it's our second busiest time. Off-Peak transformed our business.",
    author: 'Jennifer Park',
    role: 'Owner, FitZone Studio',
    rating: 5,
  },
]

function renderStars(rating: number) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <MdStar key={i} className={i < rating ? 'text-primary' : 'text-[#EBEBEB]'} />
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="py-12 bg-white border-b border-[#EBEBEB]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3">
            What People Are Saying
          </h2>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto text-center">
            Join thousands of happy customers and merchants using Off-Peak
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 border border-[#EBEBEB] hover:border-primary transition-colors"
            >
              <div className="mb-4">{renderStars(testimonial.rating)}</div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                "{testimonial.quote}"
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
