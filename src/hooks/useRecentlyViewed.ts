'use client'

import { useState, useEffect, useCallback } from 'react'

type RecentlyViewedOffer = {
  id: string
  slug: string
  title: string
  photo?: string | { url: string }
  viewedAt: number
}

const STORAGE_KEY = 'recently_viewed_offers'
const MAX_ITEMS = 10
const EXPIRY_DAYS = 7

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedOffer[]>([])

  useEffect(() => {
    loadRecentlyViewed()
  }, [])

  function loadRecentlyViewed() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const items = JSON.parse(stored) as RecentlyViewedOffer[]
        const now = Date.now()
        const validItems = items.filter(
          (item) => now - item.viewedAt < EXPIRY_DAYS * 24 * 60 * 60 * 1000,
        )
        setRecentlyViewed(validItems)
        if (validItems.length !== items.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validItems))
        }
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error)
    }
  }

  const addRecentlyViewed = useCallback((offer: Omit<RecentlyViewedOffer, 'viewedAt'>) => {
    if (typeof window === 'undefined') return

    try {
      const now = Date.now()
      setRecentlyViewed((prev) => {
        const items = prev.filter((item) => item.id !== offer.id)
        const updated = [{ ...offer, viewedAt: now }, ...items.slice(0, MAX_ITEMS - 1)]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error('Error adding recently viewed:', error)
    }
  }, [])

  function clearRecentlyViewed() {
    if (typeof window === 'undefined') return

    setRecentlyViewed([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    recentlyViewed,
    addRecentlyViewed,
    clearRecentlyViewed,
  }
}
