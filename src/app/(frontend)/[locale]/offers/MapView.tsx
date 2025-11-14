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

    // Create features with slight offset for offers at same location
    const features: Array<{
      type: 'Feature'
      geometry: { type: 'Point'; coordinates: [number, number] }
      properties: any
    }> = []

    venueGroups.forEach((group, venueKey) => {
      const baseLng = group[0].venue.lng!
      const baseLat = group[0].venue.lat!

      // All offers at same location use exact same coordinates
      // This ensures they cluster together and show as one pin
      group.forEach((item, index) => {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [baseLng, baseLat],
          },
          properties: {
            id: item.slot.id,
            offerId: item.offer.id,
            offerTitle: item.offer.title,
            venueName: item.venue.name,
            offerType: item.offer.type,
            discountValue: item.offer.discountValue || 0,
            venueKey: venueKey,
            originalLng: baseLng,
            originalLat: baseLat,
            hasMultipleOffers: group.length > 1,
            offerIndex: index,
            totalOffers: group.length,
          },
        })
      })
    })

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

    // Add custom CSS for popup close button to match design system
    if (!document.getElementById('mapbox-popup-styles')) {
      const style = document.createElement('style')
      style.id = 'mapbox-popup-styles'
      style.textContent = `
        .mapboxgl-popup-close-button {
          font-size: 20px;
          padding: 6px 8px;
          color: #717171 !important;
          background: transparent !important;
          border: none !important;
          border-radius: 6px;
          transition: all 0.2s ease;
          cursor: pointer;
          right: 8px;
          top: 8px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .mapboxgl-popup-close-button:hover {
          color: #222222 !important;
          background: #f7f7f7 !important;
        }
        .mapboxgl-popup-close-button:active {
          background: #f0f0f0 !important;
        }
        .mapboxgl-popup {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
          max-width: none;
        }
        .mapboxgl-popup-content {
          border-radius: 8px;
          padding: 0;
          box-shadow: none;
        }
        .mapboxgl-popup-tip {
          border-top-color: #ffffff;
        }
      `
      document.head.appendChild(style)
    }

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
      clusterMaxZoom: 16, // Max zoom to cluster points on - increased to show individual offers sooner
      clusterRadius: 50, // Radius of each cluster when clustering points
    })

    // Add cluster circles - styled to match design system
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'offers-cluster',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#ff385c', // Primary color for small clusters
          5,
          '#ff5a8c', // Primary light for medium clusters
          15,
          '#e61e4d', // Primary hover (darker) for large clusters
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          24, // Small cluster size
          5,
          32, // Medium cluster size
          15,
          40, // Large cluster size
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.95,
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

    // Add unclustered point layer (individual offers) - styled to match design system
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'offers-cluster',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#ff385c', // Primary color
        'circle-radius': 10,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.95,
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
        if (err || zoom === null || zoom === undefined) return

        map.current!.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom as number,
        })
      })
    })

    // Click on unclustered point to show popup (tooltip)
    map.current.on('click', 'unclustered-point', (e) => {
      const clickedPoint = e.features![0]
      const coordinates = (clickedPoint.geometry as any).coordinates.slice()
      const properties = clickedPoint.properties!

      // Close existing popup
      if (popupRef.current) {
        popupRef.current.remove()
      }

      // If there are multiple offers at this location, show all of them
      if (properties.hasMultipleOffers) {
        // Find all offers at the same venue
        const source = map.current!.getSource('offers-cluster') as mapboxgl.GeoJSONSource
        const allFeatures = (source._data as any).features.filter((f: any) => 
          f.properties.venueKey === properties.venueKey
        )

        // Create popup with all offers - styled to match design system
        const offersList = allFeatures.map((feature: any) => {
          const props = feature.properties
          return `
            <div style="padding: 10px 12px; border-bottom: 1px solid #dddddd; cursor: pointer; transition: background-color 0.2s; border-radius: 4px;" 
                 onmouseover="this.style.backgroundColor='#f7f7f7'" 
                 onmouseout="this.style.backgroundColor='transparent'"
                 onclick="window.location.href='/offers/${props.offerId}'">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #222222;">${props.offerTitle}</div>
              <div style="font-size: 12px; color: #717171; margin-bottom: 4px;">${props.venueName}</div>
              <div style="font-size: 12px; color: #ff385c; font-weight: 600;">${getOfferLabel(props.offerType, props.discountValue)}</div>
            </div>
          `
        }).join('')

        const popupHTML = `
          <div style="min-width: 220px; max-height: 320px; overflow-y: auto; border-radius: 8px;">
            <div style="padding: 12px; font-weight: bold; font-size: 15px; border-bottom: 2px solid #ff385c; margin-bottom: 4px; color: #222222; background: #ffffff;">
              ${properties.totalOffers} Offers at ${properties.venueName}
            </div>
            <div style="padding: 4px;">
              ${offersList}
            </div>
          </div>
        `

        // Use original coordinates (not offset) for popup
        popupRef.current = new mapboxgl.Popup({ closeOnClick: true })
          .setLngLat([properties.originalLng, properties.originalLat])
          .setHTML(popupHTML)
          .addTo(map.current!)
      } else {
        // Single offer - show simple popup styled to match design system
        const popupHTML = `
          <div style="padding: 12px; min-width: 180px; border-radius: 8px; background: #ffffff;">
            <div style="font-weight: bold; font-size: 15px; margin-bottom: 6px; color: #222222;">${properties.offerTitle}</div>
            <div style="font-size: 13px; color: #717171; margin-bottom: 8px;">${properties.venueName}</div>
            <div style="font-size: 13px; color: #ff385c; font-weight: 600; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #dddddd;">${getOfferLabel(properties.offerType, properties.discountValue)}</div>
            <a href="/offers/${properties.offerId}" style="font-size: 13px; color: #ff385c; text-decoration: none; font-weight: 500; cursor: pointer; display: inline-block; padding: 4px 0; transition: color 0.2s;" onmouseover="this.style.color='#e61e4d'" onmouseout="this.style.color='#ff385c'">View Details →</a>
          </div>
        `

        popupRef.current = new mapboxgl.Popup({ closeOnClick: true })
          .setLngLat(coordinates)
          .setHTML(popupHTML)
        .addTo(map.current!)
      }
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
