'use client'

import { useState } from 'react'
import { offerTemplates } from '@/utilities/offerTemplates'
import { FiClock, FiTrendingUp, FiInfo } from 'react-icons/fi'

type OfferTemplatesProps = {
  onSelectTemplate: (template: (typeof offerTemplates)[0]) => void
}

export function OfferTemplates({ onSelectTemplate }: OfferTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', ...new Set(offerTemplates.map((t) => t.category))]

  const filteredTemplates =
    selectedCategory === 'all'
      ? offerTemplates
      : offerTemplates.filter((t) => t.category === selectedCategory)

  return (
    <div className="bg-white border border-border p-6">
      <div className="mb-6">
        <h3 className="font-heading text-xl font-bold text-text-primary mb-2">Choose a Template</h3>
        <p className="text-sm text-text-secondary">
          Pre-configured offers based on proven success patterns
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium border transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-secondary border-border hover:border-primary'
            }`}
          >
            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border border-border p-4 hover:border-primary transition-colors cursor-pointer"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-text-primary mb-1">{template.name}</h4>
                <p className="text-sm text-text-secondary">{template.description}</p>
              </div>
              {template.type === 'percent' && (
                <span className="bg-primary text-white px-3 py-1 text-sm font-bold">
                  {template.discountValue}% OFF
                </span>
              )}
              {template.type === 'fixed' && (
                <span className="bg-primary text-white px-3 py-1 text-sm font-bold">
                  €{template.discountValue} OFF
                </span>
              )}
              {template.type === 'bogo' && (
                <span className="bg-primary text-white px-3 py-1 text-sm font-bold">BOGO</span>
              )}
            </div>

            <div className="space-y-2 text-xs text-text-tertiary">
              <div className="flex items-center gap-2">
                <FiClock className="w-3 h-3" />
                <span>{template.suggestedTimes.join(', ')}</span>
              </div>

              {template.tips.length > 0 && (
                <div className="flex items-start gap-2">
                  <FiInfo className="w-3 h-3 mt-0.5" />
                  <span>{template.tips[0]}</span>
                </div>
              )}

              {template.bestFor.length > 0 && (
                <div className="flex items-start gap-2">
                  <FiTrendingUp className="w-3 h-3 mt-0.5" />
                  <span>Best for: {template.bestFor.join(', ')}</span>
                </div>
              )}
            </div>

            <button className="mt-3 w-full text-sm font-semibold text-primary hover:text-primary-hover text-center">
              Use This Template →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
