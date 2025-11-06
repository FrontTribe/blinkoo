'use client'

import { useState, useEffect, useCallback } from 'react'

type GeolocationState = {
  lat: number | null
  lng: number | null
  loading: boolean
  error: string | null
}

const LOCATION_CACHE_KEY = 'offpeak_user_location'
const LOCATION_CACHE_MAX_AGE = 5 * 60 * 1000 // 5 minutes in milliseconds

type CachedLocation = {
  lat: number
  lng: number
  timestamp: number
}

function getCachedLocation(): CachedLocation | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = sessionStorage.getItem(LOCATION_CACHE_KEY)
    if (!cached) return null

    const location: CachedLocation = JSON.parse(cached)
    const age = Date.now() - location.timestamp

    if (age < LOCATION_CACHE_MAX_AGE) {
      return location
    }

    sessionStorage.removeItem(LOCATION_CACHE_KEY)
    return null
  } catch (error) {
    console.error('Error reading cached location:', error)
    return null
  }
}

function setCachedLocation(lat: number, lng: number): void {
  if (typeof window === 'undefined') return

  try {
    const location: CachedLocation = { lat, lng, timestamp: Date.now() }
    sessionStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location))
  } catch (error) {
    console.error('Error caching location:', error)
  }
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    loading: true,
    error: null,
  })

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ lat: null, lng: null, loading: false, error: 'Geolocation not supported' })
      return
    }

    setState((prev) => ({ ...prev, loading: true }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        
        // Cache the location
        setCachedLocation(coords.lat, coords.lng)

        setState({
          lat: coords.lat,
          lng: coords.lng,
          loading: false,
          error: null,
        })
      },
      (error) => {
        setState({
          lat: null,
          lng: null,
          loading: false,
          error: error.message,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ lat: null, lng: null, loading: false, error: 'Geolocation not supported' })
      return
    }

    // Check for cached location first
    const cached = getCachedLocation()
    if (cached) {
      setState({
        lat: cached.lat,
        lng: cached.lng,
        loading: false,
        error: null,
      })
      return
    }

    requestLocation()
  }, [requestLocation])

  return { ...state, requestLocation }
}
