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
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const [mapError, setMapError] = useState<string | null>(() => {
    return mapboxToken ? null : 'Mapbox token not configured'
  })

  // Calculate initial viewport
  const venuesWithCoords = offers.filter((item) => item.venue.lat && item.venue.lng)

  // Create GeoJSON from offers with clustering support
  const createGeoJSON = () => {
    // Group offers by venue (same lat/lng)
    const venueGroups = new Map<string, typeof venuesWithCoords>()
    
    venuesWithCoords.forEach((item) => {
      const key = `${item.venue.lat?.toFixed(6)},${item.venue.lng?.toFixed(6)}`
      if (!venueGroups.has(key)) {
        venueGroups.set(key, [])
      }
      venueGroups.get(key)!.push(item)
    })

    // Create features - one per offer for clustering
    const features = venuesWithCoords.map((item) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [item.venue.lng!, item.venue.lat!],
      },
      properties: {
        id: item.slot.id,
        offerId: item.offer.id,
        offerTitle: item.offer.title,
        venueName: item.venue.name,
        offerType: item.offer.type,
        discountValue: item.offer.discountValue || 0,
        venueKey: `${item.venue.lat?.toFixed(6)},${item.venue.lng?.toFixed(6)}`,
      },
    }))

    return {
      type: 'FeatureCollection' as const,
      features,
    }
  }

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

      // Add clustering layers when map loads
      map.current.on('load', () => {
        setupClustering()
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
      if (popupRef.current) {
        popupRef.current.remove()
      }
      if (map.current) {
        // Remove event listeners and sources before removing map
        if (map.current.getSource('offers-cluster')) {
          map.current.removeLayer('clusters')
          map.current.removeLayer('cluster-count')
          map.current.removeLayer('unclustered-point')
          map.current.removeSource('offers-cluster')
        }
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Setup clustering
  const setupClustering = () => {
    if (!map.current) return

    const geoJSON = createGeoJSON()

    // Add source for clustering
    if (map.current.getSource('offers-cluster')) {
      (map.current.getSource('offers-cluster') as mapboxgl.GeoJSONSource).setData(geoJSON)
      return
    }

    map.current.addSource('offers-cluster', {
      type: 'geojson',
      data: geoJSON,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points
    })

    // Add cluster circles
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'offers-cluster',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#fbbf24', // Yellow for small clusters
          10,
          '#f59e0b', // Orange for medium clusters
          30,
          '#ef4444', // Red for large clusters
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20, // Small cluster size
          10,
          30, // Medium cluster size
          30,
          40, // Large cluster size
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    })

    // Add cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'offers-cluster',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#ffffff',
      },
    })

    // Add unclustered point layer (individual offers)
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'offers-cluster',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#ef4444',
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    })

    // Click on cluster to zoom in
    map.current.on('click', 'clusters', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      })
      const clusterId = features[0].properties!.cluster_id
      const source = map.current!.getSource('offers-cluster') as mapboxgl.GeoJSONSource
      
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return

        map.current!.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom,
        })
      })
    })

    // Click on unclustered point to navigate to offer
    map.current.on('click', 'unclustered-point', (e) => {
      const coordinates = (e.features![0].geometry as any).coordinates.slice()
      const properties = e.features![0].properties!

      // Close existing popup
      if (popupRef.current) {
        popupRef.current.remove()
      }

      // Create popup
      const popupHTML = `
        <div style="padding: 8px; min-width: 150px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${properties.offerTitle}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 6px;">${properties.venueName}</div>
          <div style="font-size: 12px; color: #ef4444; font-weight: 600;">${getOfferLabel(properties.offerType, properties.discountValue)}</div>
        </div>
      `

      popupRef.current = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupHTML)
        .addTo(map.current!)

      // Navigate to offer on click
      router.push(`/offers/${properties.offerId}`)
    })

    // Change cursor on hover
    map.current.on('mouseenter', 'clusters', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer'
      }
    })

    map.current.on('mouseleave', 'clusters', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = ''
      }
    })

    map.current.on('mouseenter', 'unclustered-point', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer'
      }
    })

    map.current.on('mouseleave', 'unclustered-point', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = ''
      }
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

  // Update clustering when offers change
  const updateClustering = () => {
    if (!map.current || !map.current.loaded()) return
    if (!map.current.getSource('offers-cluster')) {
      setupClustering()
      return
    }

    const geoJSON = createGeoJSON()
    const source = map.current.getSource('offers-cluster') as mapboxgl.GeoJSONSource
    source.setData(geoJSON)
  }

  // Update clustering when offers change
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      updateClustering()
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
