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
      'Blinkoo nam je pomogao ispuniti naš termin od 14-16h s više od 30 kupaca dnevno. Prihod se povećao za 35% u našim praznim satima.',
    author: 'Sarah Chen',
    role: 'Vlasnica, Brew & Bites Cafe',
    rating: 5,
  },
  {
    quote:
      'Uštedio sam više od 200$ ovaj mjesec na izlascima. Ponude su stvarne i iskorištenje je super jednostavno s QR kodom.',
    author: 'Marcus Rodriguez',
    role: 'Gurman i Lokalni Istraživač',
    rating: 5,
  },
  {
    quote:
      'Kao vlasnik teretane, naš termin od 10-14h bio je mrtav. Sada je to naše drugo najprometnije vrijeme. Blinkoo je transformirao naše poslovanje.',
    author: 'Jennifer Park',
    role: 'Vlasnica, FitZone Studio',
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
            Što Ljudi Kažu
          </h2>
          <div className="flex justify-center">
            <p className="text-base md:text-lg text-text-secondary max-w-2xl text-center">
              Pridružite se tisućama zadovoljnih kupaca i trgovaca koji koriste Blinkoo
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 border border-[#EBEBEB] hover:border-primary transition-colors"
            >
              <div className="mb-4">{renderStars(testimonial.rating)}</div>
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
