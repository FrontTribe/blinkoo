'use client'

import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type LocationMapProps = {
  center?: [number, number]
  zoom?: number
  onLoad?: (map: mapboxgl.Map) => void
}

export function LocationMap({ center, zoom = 13, onLoad }: LocationMapProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-secondary">
        <p className="text-text-secondary">Mapbox token not found</p>
      </div>
    )
  }

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const centerCoords = center || [15.9819, 45.815]

    mapboxgl.accessToken = mapboxToken

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerCoords[0], centerCoords[1]],
        zoom: zoom,
      })

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      map.current.on('load', () => {
        if (onLoad && map.current) {
          onLoad(map.current)
        }
      })

      return () => {
        if (map.current) {
          map.current.remove()
          map.current = null
        }
      }
    } catch (error) {
      console.error('Failed to initialize map:', error)
    }
  }, [center, zoom, onLoad])

  return <div ref={mapContainer} className="w-full h-full min-h-[256px]" />
}
