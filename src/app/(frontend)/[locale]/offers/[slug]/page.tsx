import { cookies } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import Image from 'next/image'
import { Reviews } from './Reviews'
import { OfferMap } from './OfferMap'
import { CountdownTimer } from '@/components/CountdownTimer'
import { OfferDetailsClient, OfferBookingCard } from './OfferDetailsClient'
import { RecommendedOffers } from '@/components/RecommendedOffers'
import { TrackViewWrapper } from './TrackViewWrapper'
import { FiArrowLeft } from 'react-icons/fi'
import { getTranslation } from '@/i18n/getTranslation'
import { getLocale } from '@/i18n/getLocale'

async function getOffer(idOrSlug: string) {
  const cookieStore = await cookies()
  const config = await configPromise
  const payload = await getPayload({ config })

  try {
    // First try to fetch as an offer by ID
    try {
      const offer = await payload.findByID({
        collection: 'offers',
        id: idOrSlug,
        depth: 2,
      })

      if (offer) {
        // Find a live slot for this offer
        const slots = await payload.find({
          collection: 'offer-slots',
          where: {
            offer: { equals: offer.id },
            state: { equals: 'live' },
            qtyRemaining: { greater_than: 0 },
          },
          limit: 1,
          depth: 2,
        })

        if (slots.docs.length > 0) {
          return { slot: slots.docs[0], offer }
        }
      }
    } catch (error) {
      console.log('Not an offer ID, trying as slot ID')
    }

    // Try to fetch as a slot by ID
    const slot = await payload.findByID({
      collection: 'offer-slots',
      id: idOrSlug,
      depth: 3,
    })

    if (!slot) return null

    const slotData = slot as any
    return slotData
  } catch (error) {
    console.error('Error fetching offer:', error)
    return null
  }
}

export default async function OfferDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const shouldShowReview = resolvedSearchParams.review === 'true'
  const data = await getOffer(slug)

  // Get locale and translations
  const locale = await getLocale(resolvedSearchParams)
  const t = await getTranslation(locale)

  // Get user for recommendations
  const cookieStore = await cookies()
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: cookieStore as any })

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-white">
            {t('offers.detail.offerNotFound')}
          </h2>
          <Link href="/offers" className="mt-4 text-orange-primary hover:text-orange-light">
            {t('offers.detail.browseOffers')}
          </Link>
        </div>
      </div>
    )
  }

  // Handle the case where we got {slot, offer}
  let slot, offer
  if ('slot' in data && 'offer' in data) {
    slot = data.slot
    offer = data.offer
  } else {
    slot = data as any
    offer = slot.offer
  }

  const venue = offer?.venue

  if (!offer || !venue) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header Bar - Back & Countdown */}
      <div className="border-b border-border bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 text-text-primary hover:text-text-secondary transition-colors text-sm font-medium"
            >
              <FiArrowLeft className="text-base" />
              <span>{t('offers.detail.backToOffers')}</span>
            </Link>

            <div className="hidden sm:block">
              <CountdownTimer endDate={slot.endsAt} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Track View */}
            <TrackViewWrapper offer={offer} />

            {/* Header with Location-Aware Info - Now First */}
            <OfferDetailsClient
              slug={slug}
              offer={offer}
              venue={venue}
              slot={slot}
              geofenceKm={offer.geofenceKm}
              locale={locale}
            />

            {/* Photo */}
            {offer.photo && (
              <div className="aspect-[16/9] overflow-hidden bg-white border border-border relative">
                {typeof offer.photo === 'object' && offer.photo.url ? (
                  <Image
                    src={offer.photo.url}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 66vw"
                    priority
                  />
                ) : typeof offer.photo === 'string' ? (
                  <Image
                    src={offer.photo}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 66vw"
                    priority
                  />
                ) : null}
              </div>
            )}

            {/* Description */}
            <div className="bg-white border border-border p-8">
              <h2 className="font-heading text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <span className="h-1 w-1 bg-primary" />
                {t('offers.detail.aboutThisOffer')}
              </h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                {offer.description || t('offers.detail.noDescription')}
              </p>
            </div>

            {/* Terms */}
            {offer.terms && (
              <div className="bg-amber-50 border border-amber-200 p-8">
                <h2 className="font-heading text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <span className="h-1 w-1 bg-amber-600" />
                  {t('offers.detail.termsAndConditions')}
                </h2>
                <p className="text-text-secondary text-sm whitespace-pre-line leading-relaxed">
                  {offer.terms}
                </p>
              </div>
            )}

            {/* Venue Map */}
            {venue.lat && venue.lng && (
              <div className="bg-white border border-border p-8">
                <h2 className="font-heading text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                  <span className="h-1 w-1 bg-primary" />
                  {t('offers.detail.whereYoullGo')}
                </h2>
                <div className="h-80 overflow-hidden border border-border bg-bg-secondary">
                  <OfferMap
                    markers={[
                      {
                        id: venue.id,
                        lat: venue.lat,
                        lng: venue.lng,
                        offerTitle: offer.title,
                        venueName: venue.name,
                        remaining: slot.qtyRemaining,
                      },
                    ]}
                    center={[venue.lng, venue.lat]}
                    zoom={14}
                  />
                </div>
                <p className="mt-4 text-text-secondary font-medium">{venue.address}</p>
              </div>
            )}

            {/* Reviews */}
            <div id="reviews-section" className="bg-white border border-border p-8">
              <Reviews offerId={offer.id} autoOpenForm={shouldShowReview} locale={locale} />
            </div>

            {/* Recommended Offers */}
            {venue?.lat && venue?.lng && (
              <div className="mt-6">
                <RecommendedOffers
                  currentOfferId={offer.id}
                  userId={user?.id?.toString()}
                  lat={venue.lat}
                  lng={venue.lng}
                />
              </div>
            )}
          </div>

          {/* Right Column - Sticky Booking Card */}
          <div className="lg:col-span-1">
            <OfferBookingCard
              slug={slug}
              offerId={offer.id}
              venue={venue}
              geofenceKm={offer.geofenceKm}
              slot={slot}
              offer={offer}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
