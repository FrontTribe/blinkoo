'use client'

import { useState } from 'react'
import { MdAdd, MdRemove } from 'react-icons/md'

type FAQItem = {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'Kako mogu rezervirati ponudu?',
    answer:
      'Jednostavno pregledajte dostupne ponude, kliknite "Rezerviraj" da rezervirate svoje mjesto i primite jedinstveni QR kod ili 6-znamenkasti kod za iskorištenje. Bez naknada, trenutna potvrda.',
  },
  {
    question: 'Postoji li naknada za korištenje Blinkoo?',
    answer:
      'Blinkoo je potpuno besplatan za kupce. Trgovci plaćaju samo malu proviziju kada se ponude uspješno iskoriste. Bez prethodnih troškova ili pretplata.',
  },
  {
    question: 'Što ako ne mogu stići na vrijeme?',
    answer:
      'Ponude su vremenski ograničene po dizajnu. Ako ne možete stići, vaša rezervacija će isteći i ponuda postaje dostupna drugima. Uvijek provjerite vrijeme isteka prije rezervacije.',
  },
  {
    question: 'Kako trgovci imaju koristi?',
    answer:
      'Trgovci ispunjavaju prazne sate ciljanim kupcima. Kontroliraju zalihe, cijene i vrijeme. Prosječni trgovci vide povećanje prometa od 35-40% u praznim satima bez prethodnih troškova.',
  },
  {
    question: 'Jesu li ponude stvarno ograničene?',
    answer:
      'Da! Svaka ponuda ima ograničenu količinu kako bi stvorila hitnost i ekskluzivnost. Jednom kada je ponuda rezervirana, nestaje. To osigurava da su ponude stvarne i utjecajne.',
  },
  {
    question: 'Kako mogu iskoristiti svoju rezervaciju?',
    answer:
      'Posjetite mjesto tijekom aktivnog vremena ponude, pokažite svoj 6-znamenkasti kod ili QR kod osoblju i uživajte u popustu. Iskorištenje je trenutno i jednostavno.',
  },
  {
    question: 'Mogu li rezervirati više ponuda?',
    answer:
      'Da, možete rezervirati više ponuda od različitih trgovaca. Svaka ponuda ima svoje vremensko ograničenje i proces iskorištenja. Provjerite svoj odjeljak "Moje Rezervacije" da upravljate svima.',
  },
  {
    question: 'Koje vrste poslovanja koriste Blinkoo?',
    answer:
      'Restorani, kafići, teretane, wellness centri, zabavni prostori i više. Bilo koje lokalno poslovanje koje želi privući promet tijekom praznih sati.',
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
            Često Postavljana Pitanja
          </h2>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto text-center">
            Sve što trebate znati o korištenju Blinkoo
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
