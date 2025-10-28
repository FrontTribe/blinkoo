'use client'

import dynamic from 'next/dynamic'

const MapComponent = dynamic(
  () => import('@/components/Map').then((mod) => ({ default: mod.MapComponent })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center bg-[#F7F7F7]">
        <p className="text-text-secondary">Loading map...</p>
      </div>
    ),
  },
)

type OfferMapProps = {
  markers: Array<{
    id: string
    lat: number
    lng: number
    offerTitle: string
    venueName: string
    remaining: number
  }>
  center: [number, number]
  zoom: number
}

export function OfferMap({ markers, center, zoom }: OfferMapProps) {
  return <MapComponent markers={markers} center={center} zoom={zoom} />
}
