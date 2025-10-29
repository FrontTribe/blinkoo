'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { FiMap, FiList, FiFilter, FiGrid } from 'react-icons/fi'
import { DynamicIcon } from '@/components/DynamicIcon'
import { FavoriteButton } from '@/components/FavoriteButton'
import { SavedButton } from '@/components/SavedButton'
import { FilterPanel } from '@/components/FilterPanel'
import { OnboardingModal } from '@/components/OnboardingModal'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useOfferUpdates } from '@/hooks/useOfferUpdates'
import { OfferCardSkeleton, SkeletonLoader } from '@/components/SkeletonLoader'
import { EmptyState } from '@/components/EmptyState'
import { SearchBar } from '@/components/SearchBar'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

// Dynamically import MapView to avoid SSR issues with mapbox-gl
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F7F7F7] border-l border-[#EBEBEB]">
      <p className="text-text-secondary">Loading map...</p>
    </div>
  ),
})

type Offer = {
  slot: {
    id: string
    startsAt: string
    endsAt: string
    qtyRemaining: number
    qtyTotal: number
  }
  offer: {
    id: string
    title: string
    description: string
    type: string
    discountValue: number
    photo?: string
  }
  venue: {
    id: string
    name: string
    address: string
    distance: number | null
    lat?: number
    lng?: number
    category?: {
      id: string
      name: string
      slug: string
      icon: string
    }
  }
}

type Category = {
  id: string
  name: string
  slug: string
  icon: string
}

const defaultCategories: Category[] = [{ id: 'all', name: 'All', slug: 'all', icon: 'FiGrid' }]

function getTimeRemaining(endsAt: string): string {
  const now = new Date()
  const end = new Date(endsAt)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Ended'

  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `Ends in ${hours}h ${minutes % 60}m`
  }
  return `Ends in ${minutes}m`
}

function getMinutesRemaining(endsAt: string): number {
  const now = new Date()
  const end = new Date(endsAt)
  const diff = end.getTime() - now.getTime()
  return Math.floor(diff / 1000 / 60)
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

type OffersContentProps = {
  initialFilters?: {
    category?: string
    distance?: string
    timeFilter?: string
    discountTypes?: string
    sortBy?: string
  }
  initialOffers?: Offer[]
}

export default function OffersContent({
  initialFilters = {},
  initialOffers = [],
}: OffersContentProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [offers, setOffers] = useState<Offer[]>(initialOffers)
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>(initialOffers)
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Onboarding
  const { showOnboarding, setShowOnboarding, completeOnboarding, skipOnboarding } = useOnboarding()
  const [showFilters, setShowFilters] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Parse filter params from URL
  const selectedCategory = initialFilters.category || 'all'
  const filters = {
    distance: initialFilters.distance ? parseInt(initialFilters.distance) : null,
    timeFilter: (initialFilters.timeFilter as 'ending-soon' | 'all-day' | null) || null,
    discountTypes: initialFilters.discountTypes?.split(',') || [],
    sortBy:
      (initialFilters.sortBy as 'nearest' | 'ending-soon' | 'newest' | 'best-discount') ||
      'nearest',
  }

  console.log('Client: Initial filters:', initialFilters)
  console.log('Client: Parsed filters:', filters)
  console.log('Client: Selected category:', selectedCategory)
  console.log('Client: Initial offers count:', initialOffers.length)

  // Get view mode from localStorage for client-side only
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  // Real-time updates
  const { updates } = useOfferUpdates({
    enabled: viewMode === 'list',
    interval: 30000,
    onUpdate: (updates) => {
      // Update offers with real-time data
      setOffers((prev) => {
        return prev.map((offer) => {
          const update = updates.find((u: any) => u.slotId === offer.slot.id)
          if (update) {
            return {
              ...offer,
              slot: {
                ...offer.slot,
                qtyRemaining: update.qtyRemaining,
                state: update.state,
              },
            }
          }
          return offer
        })
      })
    },
  })

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('offers-view-preference')
    if (savedView === 'map') {
      setViewMode('map')
    }

    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Save view preference to localStorage
  useEffect(() => {
    localStorage.setItem('offers-view-preference', viewMode)
  }, [viewMode])

  // No need to fetch offers - we get them from server-side props

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.distance) count++
    if (filters.timeFilter) count++
    if (filters.discountTypes && filters.discountTypes.length > 0) count++
    if (filters.sortBy !== 'nearest') count++
    return count
  }

  // Update offers when initialOffers changes (when filters change)
  useEffect(() => {
    setOffers(initialOffers)
    setFilteredOffers(initialOffers)
    console.log('Client: Offers updated from server:', initialOffers.length)
  }, [initialOffers])

  // Filter offers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOffers(offers)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = offers.filter((item) => {
      const title = item.offer.title?.toLowerCase() || ''
      const description = item.offer.description?.toLowerCase() || ''
      const venueName = item.venue.name?.toLowerCase() || ''

      return title.includes(query) || description.includes(query) || venueName.includes(query)
    })
    setFilteredOffers(filtered)
  }, [searchQuery, offers])

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoriesResponse = await fetch('/api/web/categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories([...defaultCategories, ...categoriesData.categories])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'f',
      ctrl: true,
      action: () => setShowFilters(true),
      description: 'Open filters',
    },
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]',
        ) as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: 'Focus search',
    },
    {
      key: 'Escape',
      action: () => {
        if (showFilters) setShowFilters(false)
      },
      description: 'Close filters',
    },
  ])

  if (loading) {
    return (
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        {/* Categories Skeleton */}
        <div className="overflow-x-auto border-b border-border shrink-0">
          <div className="flex gap-2 px-4 py-2.5">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonLoader key={i} className="w-20 h-8" />
            ))}
          </div>
        </div>
        {/* Offers Grid Skeleton */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <OfferCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white flex">
      {/* Left Column - 40% */}
      <div className="w-2/5 border-r border-border flex flex-col overflow-hidden">
        {/* Header Row */}
        <div className="flex items-center justify-between h-14 px-4 shrink-0 border-b border-border">
          <h4 className="text-base font-semibold text-text-primary">
            {filteredOffers.length} {filteredOffers.length === 1 ? 'offer' : 'offers'}
            {searchQuery && offers.length !== filteredOffers.length && (
              <span className="text-text-tertiary text-sm ml-1">
                (filtered from {offers.length})
              </span>
            )}
          </h4>
          <button
            onClick={() => setShowFilters(true)}
            className={`relative h-8 px-3 text-sm font-medium border border-border transition-colors ${
              getActiveFilterCount() > 0
                ? 'text-primary border-primary bg-primary/5'
                : 'text-text-secondary hover:border-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <FiFilter className="text-sm" />
              <span className="text-xs">Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="bg-primary text-white text-[10px] px-1.5 py-0.5">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <SearchBar
            placeholder="Search offers by title, venue, or description..."
            onSearch={setSearchQuery}
            className="w-full"
          />
        </div>

        {/* Categories Row */}
        <div className="overflow-x-auto border-b border-border shrink-0">
          <div className="flex gap-2 px-4 py-2.5">
            {categories.map((category) => {
              const isActive =
                selectedCategory === (category.slug === 'all' ? 'all' : category.slug)
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    const newCategory = category.slug === 'all' ? 'all' : category.slug
                    const params = new URLSearchParams(window.location.search)
                    if (newCategory === 'all') {
                      params.delete('category')
                    } else {
                      params.set('category', newCategory)
                    }
                    router.push(`${pathname}?${params.toString()}`)
                  }}
                  className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-colors border border-border ${
                    isActive
                      ? 'bg-text-primary text-white border-text-primary'
                      : 'bg-white text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  {category.slug === 'all' ? (
                    <span className="flex items-center gap-1.5">
                      <FiGrid className="text-sm" />
                      <span className="text-sm">{category.name}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <DynamicIcon iconName={category.icon} className="text-sm" />
                      <span className="text-sm">{category.name}</span>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Offers List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4">
            {filteredOffers.length === 0 ? (
              <EmptyState
                title={searchQuery ? 'No offers match your search' : 'No offers found'}
                description={
                  searchQuery
                    ? `Try a different search term or clear the search to see all offers`
                    : 'Try adjusting your filters or check back later for new offers'
                }
                action={
                  searchQuery
                    ? {
                        label: 'Clear Search',
                        href: '#',
                        onClick: () => setSearchQuery(''),
                      }
                    : {
                        label: 'Clear Filters',
                        href: pathname || '/offers',
                      }
                }
                illustration={
                  searchQuery ? (
                    <div className="w-24 h-24 rounded-full bg-bg-secondary flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-text-tertiary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredOffers.map((item) => (
                  <Link
                    key={item.slot.id}
                    href={`/offers/${item.offer.id}`}
                    className="group relative overflow-hidden border border-border hover:border-text-primary transition-all bg-white"
                    aria-label={`View offer: ${item.offer.title} at ${item.venue.name}`}
                  >
                    {/* Action Buttons */}
                    <div
                      className="absolute top-2 right-2 z-10 flex gap-1"
                      onClick={(e) => e.preventDefault()}
                    >
                      <SavedButton offerId={item.offer.id} />
                      <FavoriteButton offerId={item.offer.id} />
                    </div>

                    {/* Image */}
                    <div className="aspect-square bg-bg-secondary relative overflow-hidden">
                      {item.offer.photo ? (
                        <Image
                          src={
                            typeof item.offer.photo === 'object' && item.offer.photo.url
                              ? item.offer.photo.url
                              : item.offer.photo
                          }
                          alt={item.offer.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 33vw"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-bg-secondary text-text-tertiary text-sm">
                          No Image
                        </div>
                      )}

                      {/* Discount Badge */}
                      <div className="absolute top-2 left-2 bg-text-primary text-white px-2.5 py-1 text-xs font-semibold uppercase tracking-wider">
                        {getOfferLabel(item.offer.type, item.offer.discountValue || 0)}
                      </div>

                      {/* Quantity Badge */}
                      {item.slot.qtyRemaining < 10 && (
                        <div className="absolute bottom-2 left-2 bg-error text-white px-2.5 py-1 text-xs font-semibold">
                          Only {item.slot.qtyRemaining} left
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Offer Title */}
                      <h3 className="text-sm font-semibold text-text-primary line-clamp-2 mb-2">
                        {item.offer.title}
                      </h3>

                      {/* Venue Name */}
                      <p className="text-xs text-text-secondary mb-2 line-clamp-1 !my-0">
                        {item.venue.name}
                      </p>

                      {/* Meta Info */}
                      <div className="space-y-1.5">
                        {/* Time Remaining */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-secondary">Ends in</span>
                          <span className="text-sm font-semibold text-primary">
                            {getTimeRemaining(item.slot.endsAt)}
                          </span>
                        </div>

                        {/* Additional Info */}
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          {item.venue.category && (
                            <>
                              <DynamicIcon
                                iconName={item.venue.category.icon}
                                className="text-xs"
                              />
                              <span className="capitalize">{item.venue.category.name}</span>
                              <span>•</span>
                            </>
                          )}
                          {item.venue.distance !== null && (
                            <span>{item.venue.distance.toFixed(1)} km away</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Map 60% */}
      <div className="w-3/5 relative bg-bg-secondary">
        <MapView offers={filteredOffers} />
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={(newFilters) => {
          const params = new URLSearchParams(window.location.search)

          if (newFilters.distance) {
            params.set('distance', newFilters.distance.toString())
          } else {
            params.delete('distance')
          }

          if (newFilters.timeFilter) {
            params.set('timeFilter', newFilters.timeFilter)
          } else {
            params.delete('timeFilter')
          }

          if (newFilters.discountTypes && newFilters.discountTypes.length > 0) {
            params.set('discountTypes', newFilters.discountTypes.join(','))
          } else {
            params.delete('discountTypes')
          }

          if (newFilters.sortBy) {
            params.set('sortBy', newFilters.sortBy)
          } else {
            params.delete('sortBy')
          }

          router.push(`${pathname}?${params.toString()}`)
        }}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
    </div>
  )
}
