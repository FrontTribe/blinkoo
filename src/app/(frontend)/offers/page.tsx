import OffersContent from './OffersContent'
import { RecentlyViewed } from '@/components/RecentlyViewed'

type Props = {
  searchParams: Promise<{
    category?: string
    distance?: string
    timeFilter?: string
    discountTypes?: string
    sortBy?: string
  }>
}

async function fetchOffers(filters: {
  category?: string
  distance?: string
  timeFilter?: string
  discountTypes?: string
  sortBy?: string
}) {
  const params = new URLSearchParams({
    lat: '0',
    lng: '0',
    radius: '50',
    filter: 'live',
  })

  if (filters.category) {
    params.append('category', filters.category)
  }
  if (filters.distance) {
    params.append('distance', filters.distance)
  }
  if (filters.timeFilter) {
    params.append('timeFilter', filters.timeFilter)
  }
  if (filters.discountTypes) {
    params.append('discountTypes', filters.discountTypes)
  }
  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy)
  }

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/web/offers?${params.toString()}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return { results: [], total: 0 }
  }

  return response.json()
}

export default async function OffersPage({ searchParams }: Props) {
  const filters = await searchParams
  console.log('Server: Received filters:', filters)
  const offersData = await fetchOffers(filters)
  console.log('Server: Fetched offers count:', offersData.results?.length || 0)

  return (
    <div className="h-screen w-screen bg-white overflow-hidden">
      <OffersContent initialFilters={filters} initialOffers={offersData.results || []} />
    </div>
  )
}
