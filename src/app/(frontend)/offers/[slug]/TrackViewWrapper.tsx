'use client'

import dynamic from 'next/dynamic'

const TrackView = dynamic(() => import('./TrackView').then((mod) => ({ default: mod.TrackView })), {
  ssr: false,
})

export function TrackViewWrapper({
  offer,
}: {
  offer: { id: string; slug: string; title: string; photo?: any }
}) {
  return <TrackView offer={offer} />
}
