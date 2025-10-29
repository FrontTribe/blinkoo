'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import { useDebouncedCallback } from 'use-debounce'

type SearchBarProps = {
  placeholder?: string
  onSearch: (query: string) => void
  initialValue?: string
  className?: string
}

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  initialValue = '',
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      onSearch(value)
    },
    300, // 300ms delay
  )

  useEffect(() => {
    // Call search immediately if query is empty (to clear filters)
    if (query === '') {
      onSearch('')
    } else {
      debouncedSearch(query)
    }
  }, [query, debouncedSearch, onSearch])

  function handleClear() {
    setQuery('')
    onSearch('')
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary pointer-events-none">
        <FiSearch className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 border border-border focus:border-primary focus:outline-none text-text-primary bg-white"
        aria-label={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleClear()
          }
        }}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Clear search"
        >
          <FiX className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
