import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import { MdQrCode, MdArrowForward, MdLocationOn, MdPhoneIphone } from 'react-icons/md'
import { BiTrendingUp, BiSearch, BiStore, BiLineChart } from 'react-icons/bi'
import { TbBolt, TbUsers, TbCalendarTime } from 'react-icons/tb'
import Link from 'next/link'
import config from '@/payload.config'
import './styles.css'
import { DynamicIcon } from '@/components/DynamicIcon'
import { Testimonials } from '@/components/Testimonials'
import { FAQ } from '@/components/FAQ'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { LiveOfferPreview } from '@/components/LiveOfferPreview'
import { Footer } from '@/components/Footer'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Fetch categories
  const categories = await payload.find({
    collection: 'categories',
    limit: 6,
  })

  // Fetch live offers count and sample offers
  const now = new Date()
  const offers = await payload.find({
    collection: 'offer-slots',
    where: {
      and: [
        { state: { equals: 'live' } },
        { qtyRemaining: { greater_than: 0 } },
        { startsAt: { less_than: now.toISOString() } },
        { endsAt: { greater_than: now.toISOString() } },
      ],
    },
    limit: 0,
  })

  // Fetch sample live offers for preview
  const sampleOffers = await payload.find({
    collection: 'offer-slots',
    where: {
      and: [
        { state: { equals: 'live' } },
        { qtyRemaining: { greater_than: 0 } },
        { startsAt: { less_than: now.toISOString() } },
        { endsAt: { greater_than: now.toISOString() } },
      ],
    },
    depth: 2,
    limit: 4,
  })

  // Fetch popular offers (those with most claims)
  const popularOffers = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/web/offers?sortBy=popular&limit=4`,
    {
      cache: 'no-store',
    },
  )
    .then((res) => res.json())
    .catch(() => ({ results: [] }))

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#F7F7F7] py-16 border-b border-[#EBEBEB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-border hover:border-text-primary transition-colors">
                <span className="w-1.5 h-1.5 bg-primary" />
                <span className="font-body text-xs font-medium text-text-primary uppercase tracking-wider">
                  {offers.totalDocs} Aktivnih Ponuda Dostupno Sada
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-tight text-text-primary text-center">
              Otkrijte Ekskluzivne Ponude u Vašoj Okolini
            </h1>

            {/* Subtitle */}
            <div className="flex justify-center mb-12">
              <p className="font-body text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed text-center">
                Uštedite do 50% na restoranima, kafićima, teretanama i više. Ekskluzivne vremenski ograničene ponude u vašoj okolini.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/offers"
                className="inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 text-base font-semibold hover:bg-primary-hover transition-colors"
                style={{ color: 'white' }}
              >
                <span style={{ color: 'white' }}>Pregledaj Ponude</span>
                <MdArrowForward className="text-lg" style={{ color: 'white' }} />
              </Link>
              {!user && (
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 bg-white text-text-primary px-6 py-3 text-base font-semibold border border-text-primary hover:bg-bg-secondary transition-colors"
                >
                  Registrirajte Se Besplatno
                  <BiTrendingUp className="text-lg" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center border-r border-[#EBEBEB] last:border-r-0">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {offers.totalDocs}+
              </div>
              <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                Aktivne Ponude
              </div>
            </div>
            <div className="text-center border-r border-[#EBEBEB] last:border-r-0">
              <div className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                {categories.totalDocs}+
              </div>
              <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                Kategorije
              </div>
            </div>
            <div className="text-center border-r border-[#EBEBEB] last:border-r-0">
              <div className="text-3xl md:text-4xl font-bold text-text-primary mb-2">100%</div>
              <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                Besplatno za Korištenje
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">35%</div>
              <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                Prosječna Ušteda
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.docs.length > 0 && (
        <section className="py-12 bg-white border-b border-[#EBEBEB]">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-1">
                  Pronađite Ponude po Kategorijama
                </h2>
                <p className="text-sm md:text-base text-text-secondary">
                  Otkrijte najbolje ponude u vašim omiljenim kategorijama
                </p>
              </div>
              <Link
                href="/offers"
                className="hidden md:inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold"
              >
                Pogledaj Sve
                <MdArrowForward />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.docs.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/offers?category=${category.slug}`}
                  className="bg-white p-6 border border-[#EBEBEB] hover:border-primary transition-colors text-center group"
                >
                  <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <DynamicIcon iconName={category.icon} className="text-2xl text-primary" />
                  </div>
                  <div className="text-sm font-semibold text-text-primary">{category.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Near You */}
      {popularOffers.results && popularOffers.results.length > 0 && (
        <section className="py-12 bg-white border-b border-[#EBEBEB]">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-1">
                  Najpopularnije Ponude u Vašoj Blizini
                </h2>
                <p className="text-sm md:text-base text-text-secondary">
                  Ponude koje drugi kupci najviše koriste
                </p>
              </div>
              <Link
                href="/offers?sortBy=popular"
                className="hidden md:inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold"
              >
                Pogledaj Sve
                <MdArrowForward />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularOffers.results.slice(0, 4).map((item: any) => (
                <LiveOfferPreview
                  key={item.slot.id}
                  offer={item.offer}
                  slot={item.slot}
                  venue={item.venue}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Live Offers Preview */}
      {sampleOffers.docs.length > 0 && (
        <section className="py-12 bg-white border-b border-[#EBEBEB]">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-1">
                  Trenutno Aktualne Ponude
                </h2>
                <p className="text-sm md:text-base text-text-secondary">
                  Najnovije i najtraženije ponude koje ne smijete propustiti
                </p>
              </div>
              <Link
                href="/offers"
                className="hidden md:inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold"
              >
                Pogledaj Sve
                <MdArrowForward />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sampleOffers.docs.slice(0, 4).map((slot: any) => (
                <LiveOfferPreview key={slot.id} offer={slot.offer} slot={slot} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works - For Customers */}
      <section id="how-it-works" className="py-12 bg-[#F7F7F7] border-b border-[#EBEBEB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3">
              Kako Funkcionira
            </h2>
            <div className="flex justify-center">
              <p className="text-base md:text-lg text-text-secondary max-w-2xl text-center">
                Jednostavno, brzo i dizajnirano za kupce i trgovce
              </p>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 border border-[#EBEBEB] hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 border border-primary/20">
                  <BiSearch className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary mb-0.5">
                    Otkrijte
                  </h3>
                  <div className="text-xs text-text-secondary">Pregledajte aktivne ponude</div>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Vidite ekskluzivne vremenski ograničene ponude lokalnih trgovaca u stvarnom vremenu. Pregled karte ili popis—vaš izbor.
              </p>
            </div>

            <div className="bg-white p-6 border border-[#EBEBEB] hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 border border-primary/20">
                  <TbBolt className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary mb-0.5">Rezervirajte</h3>
                  <div className="text-xs text-text-secondary">Rezervirajte odmah</div>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Jedan klik za rezervaciju vaše ponude. Dobijte jedinstveni QR kod i 6-znamenkasti kod za iskorištenje. Bez naknada, bez komplikacija.
              </p>
            </div>

            <div className="bg-white p-6 border border-[#EBEBEB] hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 border border-primary/20">
                  <MdQrCode className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary mb-0.5">
                    Iskoristite
                  </h3>
                  <div className="text-xs text-text-secondary">Pokažite i uštedite</div>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Posjetite mjesto i pokažite svoj kod osoblju. Trenutna ušteda, bez kompliciranog procesa naplate.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link
              href="/offers"
              className="inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 text-base font-semibold hover:bg-primary-hover transition-colors"
              style={{ color: 'white' }}
            >
              <span style={{ color: 'white' }}>Pregledaj Sve Ponude</span>
              <MdArrowForward className="text-lg" style={{ color: 'white' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* Visual Examples Section */}
      <section className="py-12 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3">
              Vidite u Akciji
            </h2>
            <div className="flex justify-center">
              <p className="text-base md:text-lg text-text-secondary max-w-2xl text-center">
                Iskusite Blinkoo na različitim platformama
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary/10 border border-primary/20">
                <BiSearch className="text-2xl text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                Otkrijte Ponude
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Pregledajte aktivne ponude na karti ili popisu
              </p>
              <div className="aspect-video bg-gray-200 border border-[#EBEBEB] flex items-center justify-center">
                <span className="text-xs text-text-tertiary">Pregled Karte</span>
              </div>
            </div>

            <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary/10 border border-primary/20">
                <MdQrCode className="text-2xl text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                Trenutno Iskorištenje
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Pokažite QR kod ili 6-znamenkasti kod osoblju
              </p>
              <div className="aspect-video bg-gray-200 border border-[#EBEBEB] flex items-center justify-center">
                <span className="text-xs text-text-tertiary">QR Kod Ekran</span>
              </div>
            </div>

            <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary/10 border border-primary/20">
                <BiLineChart className="text-2xl text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                Trgovački Nadzorni Panel
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Pratite performanse i upravljajte ponudama
              </p>
              <div className="aspect-video bg-gray-200 border border-[#EBEBEB] flex items-center justify-center">
                <span className="text-xs text-text-tertiary">Analitički Nadzorni Panel</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* For Merchants Section */}
      <section className="py-12 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 mb-3">
                <BiStore className="text-sm text-primary" />
                <span className="font-body text-xs font-medium text-primary uppercase tracking-wider">
                  Za Trgovce
                </span>
              </div>
              <h2
                id="merchant-benefits"
                className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3"
              >
                Ispunite Svoje Prazne Sate
              </h2>
              <div className="flex justify-center">
                <p className="text-base md:text-lg text-text-secondary max-w-2xl text-center">
                  Kreirajte vremenski ograničene ponude s ograničenom količinom koje pretvaraju prazne sate u kupce
                </p>
              </div>

              {/* ROI Callout */}
              <div className="mt-6 inline-block bg-primary/10 border border-primary/20 px-6 py-3">
                <div className="text-2xl font-bold text-primary mb-1">40%</div>
                <div className="text-xs text-text-secondary uppercase tracking-wider">
                  Prosječno povećanje prometa u praznim satima
                </div>
              </div>
            </div>

            {/* Merchant Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-[#F7F7F7] p-6 border border-[#EBEBEB]">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20 mb-3">
                  <MdLocationOn className="text-lg text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                  Ciljni Vremenski Slotovi
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Kreirajte ponude za određene prazne sate. Brza objava ili postupna objava—vi odlučujete.
                </p>
              </div>

              <div className="bg-[#F7F7F7] p-6 border border-[#EBEBEB]">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20 mb-3">
                  <TbUsers className="text-lg text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                  Kontrolirajte Zalihe
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Postavite ograničenja količine, geofencing i ograničenja po korisniku kako biste spriječili zlouporabu.
                </p>
              </div>

              <div className="bg-[#F7F7F7] p-6 border border-[#EBEBEB]">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20 mb-3">
                  <BiTrendingUp className="text-lg text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                  Pratite Performanse
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Analitički nadzorni panel u stvarnom vremenu za praćenje rezervacija, iskorištenja i ROI vaših ponuda.
                </p>
              </div>
            </div>

            {/* Merchant CTAs */}
            <div className="text-center">
              <Link
                href="/auth/signup?role=merchant_owner"
                className="inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 text-base font-semibold hover:bg-primary-hover transition-colors"
                style={{ color: 'white' }}
              >
                <span style={{ color: 'white' }}>Postanite Trgovac</span>
                <MdArrowForward className="text-lg" style={{ color: 'white' }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Partners */}
      <section className="py-12 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3">
              Povjerenje Vodećih Lokalnih Poslovanja
            </h2>
            <div className="flex justify-center">
              <p className="text-base md:text-lg text-text-secondary max-w-2xl text-center">
                Otkrijte ponude od provjerenih lokalnih trgovaca u vašoj okolini
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              'Brew & Bites Cafe',
              'FitZone Studio',
              'The Corner Restaurant',
              'Spa Serenity',
              'Cinema Club',
              'Tech Hub Co-Work',
            ].map((name, i) => (
              <div
                key={i}
                className="bg-[#F7F7F7] border border-[#EBEBEB] p-8 text-center hover:border-primary transition-colors"
              >
                <div className="text-sm font-semibold text-text-primary">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSignup />

      {/* Final CTA - For Customers */}
      <section className="py-16 bg-primary text-white border-b border-primary-hover">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
              Spremni Početi Štedjeti?
            </h2>
            <p className="text-base md:text-lg mb-12 opacity-90">
              Pridružite se tisućama kupaca koji već štede na restoranima, kafićima, teretanama i više. Besplatna registracija, trenutne uštede.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/offers"
                className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3 text-base font-semibold hover:bg-white/90 transition-colors border border-transparent"
                style={{ color: '#ff385c' }}
              >
                <span style={{ color: '#ff385c' }}>Pregledaj Sve Ponude</span>
                <MdArrowForward className="text-lg" style={{ color: '#ff385c' }} />
              </Link>
              {!user && (
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 bg-transparent px-6 py-3 text-base font-semibold border border-white hover:bg-white/10 transition-colors"
                  style={{ color: 'white' }}
                >
                  <span style={{ color: 'white' }}>Registrirajte Se Besplatno</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
