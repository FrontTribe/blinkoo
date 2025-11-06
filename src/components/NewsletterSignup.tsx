'use client'

import { useState } from 'react'
import { MdEmail, MdArrowForward } from 'react-icons/md'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Placeholder: In production, connect to email service
    console.log('Newsletter signup:', email)
    setSubscribed(true)
    setTimeout(() => {
      setEmail('')
      setSubscribed(false)
    }, 3000)
  }

  return (
    <section className="py-12 bg-white border-b border-[#EBEBEB]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 border border-primary/20 mb-4">
              <MdEmail className="text-xl text-primary" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3">
              Budite Obaviješteni o Novim Ponudama
            </h2>
            <p className="text-base text-text-secondary mb-6">
              Pridružite se više od 2.450 korisnika koji primaju ekskluzivne ponude u vašoj okolini
            </p>

            {subscribed ? (
              <div className="bg-success/10 border border-success/20 p-4 text-success font-medium">
                ✓ Hvala vam! Provjerite svoju e-poštu za potvrdu.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
              >
                <input
                  type="email"
                  placeholder="Unesite svoju e-poštu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 bg-white border border-[#EBEBEB] text-text-primary placeholder-text-tertiary focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 font-semibold hover:bg-primary-hover transition-colors"
                  style={{ color: 'white' }}
                >
                  Pretplatite Se
                  <MdArrowForward className="text-lg" style={{ color: 'white' }} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
