'use client'

import useSWR from 'swr'

type OfferFilters = {
  category?: string
  distance?: string
  timeFilter?: string
  discountTypes?: string
  sortBy?: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export function useOffers(filters: OfferFilters = {}) {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.distance) params.set('distance', filters.distance)
  if (filters.timeFilter) params.set('timeFilter', filters.timeFilter)
  if (filters.discountTypes) params.set('discountTypes', filters.discountTypes)
  if (filters.sortBy) params.set('sortBy', filters.sortBy)

  const { data, error, isLoading, mutate } = useSWR(
    `/api/web/offers?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    },
  )

  return {
    offers: data?.offers || [],
    loading: isLoading,
    error,
    mutate,
  }
}
