'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type Venue = {
  id: string
  name: string
  address: string
  lat?: number
  lng?: number
}

type Offer = {
  slot: {
    id: string
    qtyRemaining: number
    qtyTotal: number
  }
  offer: {
    id: string
    title: string
    type: string
    discountValue: number
  }
  venue: Venue
}

type MapViewProps = {
  offers: Offer[]
}

export default function MapView({ offers }: MapViewProps) {
  const router = useRouter()
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [mapError, setMapError] = useState<string | null>(() => {
    return mapboxToken ? null : 'Mapbox token not configured'
  })

  // Calculate initial viewport
  const venuesWithCoords = offers.filter((item) => item.venue.lat && item.venue.lng)

  // Calculate center point for initial view
  const calculateCenter = () => {
    if (venuesWithCoords.length === 0) {
      return { lng: 0, lat: 0, zoom: 2 }
    }

    if (venuesWithCoords.length === 1) {
      const venue = venuesWithCoords[0].venue
      return { lng: venue.lng!, lat: venue.lat!, zoom: 12 }
    }

    // Calculate center from all venues
    const avgLng =
      venuesWithCoords.reduce((sum, item) => sum + item.venue.lng!, 0) / venuesWithCoords.length
    const avgLat =
      venuesWithCoords.reduce((sum, item) => sum + item.venue.lat!, 0) / venuesWithCoords.length

    return { lng: avgLng, lat: avgLat, zoom: 10 }
  }

  function getOfferLabel(type: string, value: number): string {
    switch (type) {
      case 'percent':
        return `${value}% off`
      case 'fixed':
        return `€${value} off`
      case 'bogo':
        return 'BOGO'
      case 'addon':
        return 'Free Add-on'
      default:
        return 'Special'
    }
  }

  // Initialize map
  useEffect(() => {
    if (!mapboxToken) {
      setMapError('Mapbox token not configured')
      return
    }
    if (!mapContainer.current || map.current) return

    // Check if running in browser environment
    if (typeof window === 'undefined') return

    // Check WebGL support
    const canvas = document.createElement('canvas')
    const webgl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!webgl) {
      setMapError('WebGL is not supported in your browser')
      return
    }

    try {
      const center = calculateCenter()

      mapboxgl.accessToken = mapboxToken

      // Add try-catch around map initialization
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [center.lng, center.lat],
        zoom: center.zoom,
        antialias: false, // Disable antialiasing to avoid WebGL issues
        failIfMajorPerformanceCaveat: false, // Don't fail if WebGL is unavailable
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Add markers
      map.current.on('load', () => {
        updateMarkers()
      })

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        setMapError('Map failed to load')
      })
    } catch (error) {
      console.error('Failed to initialize map:', error)
      setMapError('Failed to initialize map. WebGL may not be supported in your browser.')
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
      // Clear markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [])

  // Function to update markers
  const updateMarkers = () => {
    if (!map.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add new markers
    venuesWithCoords.forEach((item) => {
      const el = document.createElement('div')
      el.className = 'marker'
      el.innerHTML = `
        <button class="bg-primary text-white px-3 py-2 text-xs font-semibold border border-white hover:bg-primary-hover transition-colors cursor-pointer" style="max-width: 120px; text-align: left;">
          <div class="font-bold truncate">${item.offer.title}</div>
          <div class="text-xs opacity-90 truncate">${item.venue.name}</div>
          <div class="text-xs mt-1">${getOfferLabel(item.offer.type, item.offer.discountValue || 0)}</div>
        </button>
      `

      el.addEventListener('click', () => {
        router.push(`/offers/${item.offer.id}`)
      })

      const marker = new mapboxgl.Marker(el)
        .setLngLat([item.venue.lng!, item.venue.lat!])
        .addTo(map.current!)

      markersRef.current.push(marker)
    })

    // Fit map to bounds if there are multiple markers
    if (venuesWithCoords.length > 1) {
      const bounds = new mapboxgl.LngLatBounds()
      venuesWithCoords.forEach((item) => {
        bounds.extend([item.venue.lng!, item.venue.lat!])
      })
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 12,
      })
    } else if (venuesWithCoords.length === 1) {
      const venue = venuesWithCoords[0].venue
      map.current.flyTo({
        center: [venue.lng!, venue.lat!],
        zoom: 12,
      })
    }
  }

  // Update markers when offers change
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      updateMarkers()
    }
  }, [offers])

  // Handle map error state
  const errorDisplay = mapError ? (
    <div className="w-full h-full flex items-center justify-center bg-[#F7F7F7] border-l border-[#EBEBEB]">
      <div className="text-center p-6 max-w-md">
        <p className="text-text-secondary font-semibold mb-2">Map Unavailable</p>
        <p className="text-xs text-text-tertiary mb-4">{mapError}</p>
        <p className="text-xs text-text-tertiary">
          Please try refreshing the page or use the list view instead.
        </p>
      </div>
    </div>
  ) : (
    <div ref={mapContainer} className="w-full h-full" />
  )

  return errorDisplay
}
