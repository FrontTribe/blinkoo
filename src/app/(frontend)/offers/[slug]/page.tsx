import { cookies } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Reviews } from './Reviews'
import { OfferMap } from './OfferMap'
import { CountdownTimer } from '@/components/CountdownTimer'
import { FiMapPin, FiClock, FiUsers, FiArrowLeft } from 'react-icons/fi'

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

function getTimeRemaining(endsAt: string): string {
  const now = new Date()
  const end = new Date(endsAt)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Ended'

  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `Ends in ${hours}h ${minutes % 60}m`
  }
  return `Ends in ${minutes}m`
}

export default async function OfferDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getOffer(slug)

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-white">Offer Not Found</h2>
          <Link href="/offers" className="mt-4 text-orange-primary hover:text-orange-light">
            Browse offers
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
      <div className="border-b border-border bg-white sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 text-text-primary hover:text-text-secondary transition-colors text-sm font-medium"
            >
              <FiArrowLeft className="text-base" />
              <span>Back to offers</span>
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
            {/* Photo */}
            {offer.photo && (
              <div className="aspect-[16/9] overflow-hidden bg-white border border-border">
                {typeof offer.photo === 'object' && offer.photo.url ? (
                  <img
                    src={offer.photo.url}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                ) : typeof offer.photo === 'string' ? (
                  <img src={offer.photo} alt={offer.title} className="w-full h-full object-cover" />
                ) : null}
              </div>
            )}

            {/* Header */}
            <div className="bg-white border border-border p-6">
              <h1 className="font-heading text-3xl font-bold text-text-primary mb-3">
                {offer.title}
              </h1>

              {/* Venue Info */}
              <div className="flex items-center gap-2 mb-4">
                <FiMapPin className="text-text-secondary" />
                <span className="text-text-secondary text-sm">{venue.name}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Countdown - Mobile */}
                <div className="bg-bg-secondary border border-border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FiClock className="text-primary text-sm" />
                  </div>
                  <div className="sm:hidden block">
                    <CountdownTimer endDate={slot.endsAt} />
                  </div>
                  <div className="hidden sm:block text-xs text-text-secondary">Time Remaining</div>
                  <div className="hidden sm:block text-sm font-semibold mt-1 text-primary">
                    {getTimeRemaining(slot.endsAt)}
                  </div>
                </div>

                {/* Quantity */}
                <div className="bg-bg-secondary border border-border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FiUsers className="text-primary text-sm" />
                  </div>
                  <div className="text-xs text-text-secondary mb-1">Available</div>
                  <div className="text-sm font-semibold text-text-primary">
                    {slot.qtyRemaining} left
                  </div>
                </div>

                {/* Total */}
                <div className="bg-bg-secondary border border-border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FiUsers className="text-text-secondary text-sm" />
                  </div>
                  <div className="text-xs text-text-secondary mb-1">Total</div>
                  <div className="text-sm font-semibold text-text-primary">{slot.qtyTotal}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-border p-6">
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                About this offer
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                {offer.description || 'No description available'}
              </p>
            </div>

            {/* Terms */}
            {offer.terms && (
              <div className="bg-white border border-border p-6">
                <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">
                  Terms & Conditions
                </h2>
                <p className="text-text-secondary text-sm whitespace-pre-line leading-relaxed">
                  {offer.terms}
                </p>
              </div>
            )}

            {/* Venue Map */}
            {venue.lat && venue.lng && (
              <div className="bg-white border border-border p-6">
                <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
                  Where you'll go
                </h2>
                <div className="h-64 overflow-hidden border border-border bg-bg-secondary">
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
                <p className="mt-3 text-sm text-text-secondary">{venue.address}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white border border-border p-6">
              <Reviews offerId={offer.id} />
            </div>
          </div>

          {/* Right Column - Sticky Booking Card */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white border border-border p-6">
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-text-primary">Free</span>
                </div>
                <div className="pt-4 border-t border-border">
                  <Link
                    href={`/offers/${slug}/claim`}
                    className="block w-full text-center bg-text-primary text-white py-4 px-6 hover:bg-text-secondary font-semibold text-base transition-colors"
                    style={{ color: 'white' }}
                  >
                    Claim This Offer
                  </Link>
                </div>
                <p className="text-xs text-center text-text-tertiary">Terms and conditions apply</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
