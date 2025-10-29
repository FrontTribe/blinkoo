'use client'

import useSWR from 'swr'

const fetcher = async (url: string) => {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

export function useClaims() {
  const { data, error, isLoading, mutate } = useSWR('/api/web/my-claims', fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  })

  return {
    claims: data?.claims || [],
    loading: isLoading,
    error,
    mutate,
  }
}
