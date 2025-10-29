'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiFilter } from 'react-icons/fi'

type FilterPanelProps = {
  isOpen: boolean
  onClose: () => void
  filters: {
    distance: number | null
    timeFilter: 'ending-soon' | 'all-day' | null
    discountTypes: string[]
    sortBy: 'nearest' | 'ending-soon' | 'newest' | 'best-discount'
  }
  onFiltersChange: (filters: {
    distance: number | null
    timeFilter: 'ending-soon' | 'all-day' | null
    discountTypes: string[]
    sortBy: 'nearest' | 'ending-soon' | 'newest' | 'best-discount'
  }) => void
}

export function FilterPanel({ isOpen, onClose, filters, onFiltersChange }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const distanceOptions = [
    { value: 1, label: '1 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
  ]

  const [customDistance, setCustomDistance] = useState(5)

  const timeFilterOptions = [
    { value: 'ending-soon', label: 'Ending soon (< 1hr)' },
    { value: 'all-day', label: 'All day' },
  ]

  const discountTypeOptions = [
    { value: 'percent', label: 'Percent off' },
    { value: 'fixed', label: 'Fixed amount' },
    { value: 'bogo', label: 'BOGO' },
    { value: 'addon', label: 'Free add-on' },
  ]

  const sortByOptions = [
    { value: 'nearest', label: 'Nearest first' },
    { value: 'ending-soon', label: 'Ending soon' },
    { value: 'newest', label: 'Newest' },
    { value: 'best-discount', label: 'Best discount' },
  ]

  const handleDistanceChange = (distance: number | null) => {
    setLocalFilters({ ...localFilters, distance })
  }

  const handleTimeFilterChange = (timeFilter: 'ending-soon' | 'all-day' | null) => {
    setLocalFilters({ ...localFilters, timeFilter })
  }

  const handleDiscountTypeToggle = (type: string) => {
    const currentTypes = localFilters.discountTypes || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type]
    setLocalFilters({ ...localFilters, discountTypes: newTypes })
  }

  const handleSortByChange = (sortBy: typeof localFilters.sortBy) => {
    setLocalFilters({ ...localFilters, sortBy })
  }

  const handleClear = () => {
    const emptyFilters = {
      distance: null,
      timeFilter: null,
      discountTypes: [],
      sortBy: 'nearest' as const,
    }
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const countActiveFilters = () => {
    let count = 0
    if (localFilters.distance) count++
    if (localFilters.timeFilter) count++
    if (localFilters.discountTypes && localFilters.discountTypes.length > 0) count++
    return count
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur Overlay */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/20 z-[60]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{
              x: '100%',
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: '100%',
            }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className="fixed right-0 top-0 h-full bg-white z-[70] w-full md:w-[400px] border-l border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-bg-secondary transition-colors"
                aria-label="Close filters"
              >
                <FiX className="text-lg text-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-140px)] px-6 py-6 space-y-6">
              {/* Distance Filter */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">
                  Distance
                </h3>
                <div className="space-y-3">
                  {/* Quick Select Chips */}
                  <div className="flex flex-wrap gap-2">
                    {distanceOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleDistanceChange(option.value)
                          setCustomDistance(option.value)
                        }}
                        className={`px-3 py-2 text-sm font-medium transition-colors border border-border ${
                          localFilters.distance === option.value
                            ? 'bg-text-primary text-white border-text-primary'
                            : 'bg-white text-text-primary hover:bg-bg-secondary'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Distance Slider */}
                  <div className="pt-3">
                    <div className="flex justify-between text-sm text-text-secondary mb-3">
                      <span>Custom: {localFilters.distance || customDistance} km</span>
                      <button
                        onClick={() => handleDistanceChange(null)}
                        className="hover:text-text-primary"
                      >
                        Any distance
                      </button>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      step="1"
                      value={localFilters.distance || customDistance}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        setCustomDistance(value)
                        handleDistanceChange(value)
                      }}
                      className="w-full h-1 bg-bg-secondary accent-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Time Filter */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">
                  Time
                </h3>
                <div className="space-y-2">
                  {timeFilterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleTimeFilterChange(
                          localFilters.timeFilter === option.value
                            ? null
                            : (option.value as 'ending-soon' | 'all-day'),
                        )
                      }
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors border border-border ${
                        localFilters.timeFilter === option.value
                          ? 'bg-text-primary text-white border-text-primary'
                          : 'bg-white text-text-primary hover:bg-bg-secondary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Type Filter */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">
                  Discount
                </h3>
                <div className="flex flex-wrap gap-2">
                  {discountTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleDiscountTypeToggle(option.value)}
                      className={`px-3 py-2 text-sm font-medium transition-colors border border-border ${
                        localFilters.discountTypes?.includes(option.value)
                          ? 'bg-text-primary text-white border-text-primary'
                          : 'bg-white text-text-primary hover:bg-bg-secondary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">
                  Sort
                </h3>
                <div className="space-y-2">
                  {sortByOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortByChange(option.value as typeof localFilters.sortBy)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors border border-border ${
                        localFilters.sortBy === option.value
                          ? 'bg-text-primary text-white border-text-primary'
                          : 'bg-white text-text-primary hover:bg-bg-secondary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 left-0 right-0 px-6 py-5 bg-white border-t border-border">
              <div className="flex gap-3">
                <button
                  onClick={handleClear}
                  className="flex-1 py-3 text-text-secondary font-medium hover:text-text-primary transition-colors text-sm border border-border"
                  aria-label="Clear all filters"
                >
                  Clear all
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 py-3 bg-text-primary text-white font-semibold hover:bg-text-secondary transition-colors text-sm"
                  style={{ color: 'white' }}
                  aria-label={`Apply filters${countActiveFilters() > 0 ? ` (${countActiveFilters()} active)` : ''}`}
                >
                  Show results {countActiveFilters() > 0 && `(${countActiveFilters()})`}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
