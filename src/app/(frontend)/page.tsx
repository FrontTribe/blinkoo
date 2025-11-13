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
import { getTranslation } from '@/i18n/getTranslation'
import { getLocale } from '@/i18n/getLocale'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Get locale and translations
  const resolvedSearchParams = await searchParams
  const locale = await getLocale(resolvedSearchParams)
  const t = await getTranslation(locale)

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
                  {t('home.hero.activeOffersBadge', { count: offers.totalDocs })}
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 leading-tight text-text-primary text-center">
              {t('home.hero.title')}
            </h1>

            {/* Subtitle */}
            <div className="flex justify-center mb-12">
              <p className="font-body text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed text-center">
                {t('home.hero.subtitle')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/offers"
                className="inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 text-base font-semibold hover:bg-primary-hover transition-colors"
                style={{ color: 'white' }}
              >
                <span style={{ color: 'white' }}>{t('home.hero.browseOffers')}</span>
                <MdArrowForward className="text-lg" style={{ color: 'white' }} />
              </Link>
              {!user && (
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 bg-white text-text-primary px-6 py-3 text-base font-semibold border border-text-primary hover:bg-bg-secondary transition-colors"
                >
                  {t('home.hero.signUpFree')}
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
                {t('home.stats.activeOffers')}
              </div>
            </div>
            <div className="text-center border-r border-[#EBEBEB] last:border-r-0">
              <div className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                {categories.totalDocs}+
              </div>
              <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                {t('home.stats.categories')}
              </div>
            </div>
            <div className="text-center border-r border-[#EBEBEB] last:border-r-0">
              <div className="text-3xl md:text-4xl font-bold text-text-primary mb-2">100%</div>
              <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                {t('home.stats.freeToUse')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">35%</div>
              <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                {t('home.stats.averageSavings')}
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
                  {t('home.categories.title')}
                </h2>
                <p className="text-sm md:text-base text-text-secondary">
                  {t('home.categories.subtitle')}
                </p>
              </div>
              <Link
                href="/offers"
                className="hidden md:inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold"
              >
                {t('home.categories.viewAll')}
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
                  {t('home.popular.title')}
                </h2>
                <p className="text-sm md:text-base text-text-secondary">
                  {t('home.popular.subtitle')}
                </p>
              </div>
              <Link
                href="/offers?sortBy=popular"
                className="hidden md:inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold"
              >
                {t('home.popular.viewAll')}
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
                  locale={locale}
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
                  {t('home.liveOffers.title')}
                </h2>
                <p className="text-sm md:text-base text-text-secondary">
                  {t('home.liveOffers.subtitle')}
                </p>
              </div>
              <Link
                href="/offers"
                className="hidden md:inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold"
              >
                {t('home.liveOffers.viewAll')}
                <MdArrowForward />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sampleOffers.docs.slice(0, 4).map((slot: any) => (
                <LiveOfferPreview key={slot.id} offer={slot.offer} slot={slot} locale={locale} />
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
              {t('home.howItWorks.title')}
            </h2>
            <div className="flex justify-center">
              <p className="text-base md:text-lg text-text-secondary max-w-2xl text-center">
                {t('home.howItWorks.subtitle')}
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
                    {t('home.howItWorks.discover.title')}
                  </h3>
                  <div className="text-xs text-text-secondary">
                    {t('home.howItWorks.discover.subtitle')}
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t('home.howItWorks.discover.description')}
              </p>
            </div>

            <div className="bg-white p-6 border border-[#EBEBEB] hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 border border-primary/20">
                  <TbBolt className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary mb-0.5">
                    {t('home.howItWorks.reserve.title')}
                  </h3>
                  <div className="text-xs text-text-secondary">
                    {t('home.howItWorks.reserve.subtitle')}
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t('home.howItWorks.reserve.description')}
              </p>
            </div>

            <div className="bg-white p-6 border border-[#EBEBEB] hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 border border-primary/20">
                  <MdQrCode className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary mb-0.5">
                    {t('home.howItWorks.redeem.title')}
                  </h3>
                  <div className="text-xs text-text-secondary">
                    {t('home.howItWorks.redeem.subtitle')}
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t('home.howItWorks.redeem.description')}
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
              <span style={{ color: 'white' }}>{t('home.howItWorks.cta')}</span>
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
              {t('home.visualExamples.title')}
            </h2>
            <div className="flex justify-center">
              <p className="text-base md:text-lg text-text-secondary max-w-2xl text-center">
                {t('home.visualExamples.subtitle')}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary/10 border border-primary/20">
                <BiSearch className="text-2xl text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                {t('home.visualExamples.discoverOffers.title')}
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                {t('home.visualExamples.discoverOffers.description')}
              </p>
              <div className="aspect-video bg-gray-200 border border-[#EBEBEB] flex items-center justify-center">
                <span className="text-xs text-text-tertiary">
                  {t('home.visualExamples.discoverOffers.placeholder')}
                </span>
              </div>
            </div>

            <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary/10 border border-primary/20">
                <MdQrCode className="text-2xl text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                {t('home.visualExamples.instantRedeem.title')}
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                {t('home.visualExamples.instantRedeem.description')}
              </p>
              <div className="aspect-video bg-gray-200 border border-[#EBEBEB] flex items-center justify-center">
                <span className="text-xs text-text-tertiary">
                  {t('home.visualExamples.instantRedeem.placeholder')}
                </span>
              </div>
            </div>

            <div className="bg-[#F7F7F7] border border-[#EBEBEB] p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary/10 border border-primary/20">
                <BiLineChart className="text-2xl text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                {t('home.visualExamples.merchantDashboard.title')}
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                {t('home.visualExamples.merchantDashboard.description')}
              </p>
              <div className="aspect-video bg-gray-200 border border-[#EBEBEB] flex items-center justify-center">
                <span className="text-xs text-text-tertiary">
                  {t('home.visualExamples.merchantDashboard.placeholder')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials locale={locale} />

      {/* For Merchants Section */}
      <section className="py-12 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 mb-3">
                <BiStore className="text-sm text-primary" />
                <span className="font-body text-xs font-medium text-primary uppercase tracking-wider">
                  {t('home.forMerchants.badge')}
                </span>
              </div>
              <h2
                id="merchant-benefits"
                className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3"
              >
                {t('home.forMerchants.title')}
              </h2>
              <div className="flex justify-center">
                <p className="text-base md:text-lg text-text-secondary max-w-2xl text-center">
                  {t('home.forMerchants.subtitle')}
                </p>
              </div>

              {/* ROI Callout */}
              <div className="mt-6 inline-block bg-primary/10 border border-primary/20 px-6 py-3">
                <div className="text-2xl font-bold text-primary mb-1">
                  {t('home.forMerchants.roi.value')}
                </div>
                <div className="text-xs text-text-secondary uppercase tracking-wider">
                  {t('home.forMerchants.roi.label')}
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
                  {t('home.forMerchants.targetedSlots.title')}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {t('home.forMerchants.targetedSlots.description')}
                </p>
              </div>

              <div className="bg-[#F7F7F7] p-6 border border-[#EBEBEB]">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20 mb-3">
                  <TbUsers className="text-lg text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                  {t('home.forMerchants.controlInventory.title')}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {t('home.forMerchants.controlInventory.description')}
                </p>
              </div>

              <div className="bg-[#F7F7F7] p-6 border border-[#EBEBEB]">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20 mb-3">
                  <BiTrendingUp className="text-lg text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
                  {t('home.forMerchants.trackPerformance.title')}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {t('home.forMerchants.trackPerformance.description')}
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
                <span style={{ color: 'white' }}>{t('home.forMerchants.cta')}</span>
                <MdArrowForward className="text-lg" style={{ color: 'white' }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSignup locale={locale} />

      {/* Final CTA - For Customers */}
      <section className="py-16 bg-primary text-white border-b border-primary-hover">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
              {t('home.finalCta.title')}
            </h2>
            <p className="text-base md:text-lg mb-12 opacity-90">{t('home.finalCta.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/offers"
                className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3 text-base font-semibold hover:bg-white/90 transition-colors border border-transparent"
                style={{ color: '#ff385c' }}
              >
                <span style={{ color: '#ff385c' }}>{t('home.finalCta.browseAll')}</span>
                <MdArrowForward className="text-lg" style={{ color: '#ff385c' }} />
              </Link>
              {!user && (
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 bg-transparent px-6 py-3 text-base font-semibold border border-white hover:bg-white/10 transition-colors"
                  style={{ color: 'white' }}
                >
                  <span style={{ color: 'white' }}>{t('home.finalCta.signUpFree')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer locale={locale} />
    </div>
  )
}
