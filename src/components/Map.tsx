'use client'

import { useCallback, useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type MarkerData = {
  id: string
  lat: number
  lng: number
  offerTitle: string
  venueName: string
  remaining: number
}

type MapProps = {
  markers?: MarkerData[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (markerId: string) => void
}

export function MapComponent({ markers = [], center, zoom = 12, onMarkerClick }: MapProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      if (onMarkerClick) {
        onMarkerClick(markerId)
      }
    },
    [onMarkerClick],
  )

  useEffect(() => {
    if (!mapboxToken) return
    if (!mapContainer.current || map.current) return

    const centerCoords = center || [-74.5, 40]

    mapboxgl.accessToken = mapboxToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerCoords[0], centerCoords[1]],
      zoom: zoom,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      if (!map.current) return

      markers.forEach((marker) => {
        const el = document.createElement('div')
        el.className = 'cursor-pointer'
        el.innerHTML = `
          <button class="bg-white px-2 py-1 border border-primary hover:bg-primary hover:text-white transition-colors text-xs" style="cursor: pointer;">
            <div class="font-bold">${marker.offerTitle}</div>
            <div class="text-gray-600">${marker.venueName}</div>
          </button>
        `

        el.addEventListener('click', () => handleMarkerClick(marker.id))

        new mapboxgl.Marker(el).setLngLat([marker.lng, marker.lat]).addTo(map.current!)
      })
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [markers, handleMarkerClick, center, zoom])

  return <div ref={mapContainer} className="w-full h-full min-h-[400px]" />
}
