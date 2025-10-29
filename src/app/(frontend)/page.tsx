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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-border mb-6 hover:border-text-primary transition-colors">
              <span className="w-1.5 h-1.5 bg-primary" />
              <span className="font-body text-xs font-medium text-text-primary uppercase tracking-wider">
                {offers.totalDocs} Live Offers Available Now
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-tight text-text-primary">
              Off-Peak
            </h1>

            {/* Subtitle */}
            <p className="font-body text-lg md:text-xl mb-8 text-text-secondary max-w-2xl mx-auto leading-relaxed text-center">
              Turn cold hours into foot traffic. Exclusive time-boxed offers at your favorite local
              spots.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/offers"
                className="inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 text-base font-semibold hover:bg-primary-hover transition-colors"
                style={{ color: 'white' }}
              >
                <span style={{ color: 'white' }}>Start Saving Today</span>
                <MdArrowForward className="text-lg" style={{ color: 'white' }} />
              </Link>
              {!user && (
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 bg-white text-text-primary px-6 py-3 text-base font-semibold border border-text-primary hover:bg-bg-secondary transition-colors"
                >
                  Get Started
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
                Live Offers
              </div>
            </div>
            <div className="text-center border-r border-[#EBEBEB] last:border-r-0">
              <div className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                {categories.totalDocs}+
              </div>
              <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                Categories
              </div>
            </div>
            <div className="text-center border-r border-[#EBEBEB] last:border-r-0">
              <div className="text-3xl md:text-4xl font-bold text-text-primary mb-2">100%</div>
              <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                Free to Use
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">35%</div>
              <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                Avg Savings
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
                  Browse by Category
                </h2>
                <p className="text-sm md:text-base text-text-secondary">
                  Explore offers across different categories
                </p>
              </div>
              <Link
                href="/offers"
                className="hidden md:inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold"
              >
                View All
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
                  Popular Near You
                </h2>
                <p className="text-sm md:text-base text-text-secondary">
                  Most claimed offers in your area
                </p>
              </div>
              <Link
                href="/offers?sortBy=popular"
                className="hidden md:inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold"
              >
                View All
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
                  Trending Offers
                </h2>
                <p className="text-sm md:text-base text-text-secondary">
                  Check out what's hot right now
                </p>
              </div>
              <Link
                href="/offers"
                className="hidden md:inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold"
              >
                View All
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
              How It Works
            </h2>
            <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto text-center">
              Simple, fast, and designed for both customers and merchants
            </p>
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
                    Discover
                  </h3>
                  <div className="text-xs text-text-secondary">Browse live offers</div>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                See exclusive time-boxed offers from local merchants in real-time. Map view or list
                view—your choice.
              </p>
            </div>

            <div className="bg-white p-6 border border-[#EBEBEB] hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 border border-primary/20">
                  <TbBolt className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary mb-0.5">Claim</h3>
                  <div className="text-xs text-text-secondary">Reserve instantly</div>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                One tap to reserve your offer. Get a unique QR code and 6-digit redemption code. No
                fees, no hassle.
              </p>
            </div>

            <div className="bg-white p-6 border border-[#EBEBEB] hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 border border-primary/20">
                  <MdQrCode className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary mb-0.5">
                    Redeem
                  </h3>
                  <div className="text-xs text-text-secondary">Show & save</div>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Visit the venue and show your code to staff. Instant savings, no complicated
                checkout process.
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
              <span style={{ color: 'white' }}>Start Exploring Offers</span>
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
              See It In Action
            </h2>
            <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto text-center">
              Experience Off-Peak across different platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary/10 border border-primary/20">
                <BiSearch className="text-2xl text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                Discover Offers
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Browse live offers on map or list view
              </p>
              <div className="aspect-video bg-gray-200 border border-[#EBEBEB] flex items-center justify-center">
                <span className="text-xs text-text-tertiary">Map View Preview</span>
              </div>
            </div>

            <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary/10 border border-primary/20">
                <MdQrCode className="text-2xl text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                Instant Redemption
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Show QR code or 6-digit code to staff
              </p>
              <div className="aspect-video bg-gray-200 border border-[#EBEBEB] flex items-center justify-center">
                <span className="text-xs text-text-tertiary">QR Code Screen</span>
              </div>
            </div>

            <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary/10 border border-primary/20">
                <BiLineChart className="text-2xl text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                Merchant Dashboard
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Track performance and manage offers
              </p>
              <div className="aspect-video bg-gray-200 border border-[#EBEBEB] flex items-center justify-center">
                <span className="text-xs text-text-tertiary">Analytics Dashboard</span>
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
                  For Merchants
                </span>
              </div>
              <h2
                id="merchant-benefits"
                className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3"
              >
                Fill Your Slow Hours
              </h2>
              <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto text-center">
                Create time-boxed, limited-quantity offers that convert cold hours into customers
              </p>

              {/* ROI Callout */}
              <div className="mt-6 inline-block bg-primary/10 border border-primary/20 px-6 py-3">
                <div className="text-2xl font-bold text-primary mb-1">40%</div>
                <div className="text-xs text-text-secondary uppercase tracking-wider">
                  Average increase in off-peak traffic
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
                  Target Time Slots
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Create offers for specific slow hours. Flash releases or drip releases—you decide.
                </p>
              </div>

              <div className="bg-[#F7F7F7] p-6 border border-[#EBEBEB]">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20 mb-3">
                  <TbUsers className="text-lg text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                  Control Inventory
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Set quantity limits, geofencing, and per-user restrictions to prevent abuse.
                </p>
              </div>

              <div className="bg-[#F7F7F7] p-6 border border-[#EBEBEB]">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20 mb-3">
                  <BiTrendingUp className="text-lg text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                  Track Performance
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Real-time analytics dashboard to see claims, redemptions, and ROI for your offers.
                </p>
              </div>
            </div>

            {/* Merchant CTAs */}
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/signup?role=merchant_owner"
                  className="inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 text-base font-semibold hover:bg-primary-hover transition-colors"
                  style={{ color: 'white' }}
                >
                  <span style={{ color: 'white' }}>Start Filling Tables</span>
                  <MdArrowForward className="text-lg" style={{ color: 'white' }} />
                </Link>
                <Link
                  href="/merchant/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-white text-text-primary px-6 py-3 text-base font-semibold border border-text-primary hover:bg-bg-secondary transition-colors"
                >
                  <BiStore className="text-lg" />
                  Merchant Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Featured Partners */}
      <section className="py-12 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3">
              Trusted by Leading Local Businesses
            </h2>
            <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto text-center">
              Join merchants across industries filling their slow hours
            </p>
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
              Ready to Start Saving?
            </h2>
            <p className="text-base md:text-lg mb-8 opacity-90">
              Join thousands of customers discovering exclusive local offers and helping merchants
              fill their slow hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/offers"
                className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3 text-base font-semibold hover:bg-white/90 transition-colors border border-transparent"
                style={{ color: '#ff385c' }}
              >
                <span style={{ color: '#ff385c' }}>Browse All Offers</span>
                <MdArrowForward className="text-lg" style={{ color: '#ff385c' }} />
              </Link>
              {!user && (
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 bg-transparent px-6 py-3 text-base font-semibold border border-white hover:bg-white/10 transition-colors"
                  style={{ color: 'white' }}
                >
                  <span style={{ color: 'white' }}>Sign Up Free</span>
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
