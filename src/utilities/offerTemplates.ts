export type OfferTemplate = {
  id: string
  name: string
  description: string
  category: string
  type: 'percent' | 'fixed' | 'bogo' | 'addon'
  discountValue: number
  suggestedTimes: string[]
  suggestedDuration: number
  tips: string[]
  bestFor: string[]
}

export const offerTemplates: OfferTemplate[] = [
  {
    id: 'lunch-rush',
    name: 'Lunch Rush',
    description: 'Boost weekday lunch traffic',
    category: 'food',
    type: 'percent',
    discountValue: 20,
    suggestedTimes: ['11:00', '11:30', '12:00'],
    suggestedDuration: 120,
    tips: ['Best for Mon-Fri', 'Set Qty to attract office workers', 'Expires after lunch hours'],
    bestFor: ['Restaurants', 'Fast Food', 'Cafes'],
  },
  {
    id: 'happy-hour',
    name: 'Happy Hour Special',
    description: 'Increase evening foot traffic',
    category: 'drinks',
    type: 'percent',
    discountValue: 30,
    suggestedTimes: ['17:00', '18:00'],
    suggestedDuration: 180,
    tips: [
      'Best for Wed-Fri',
      'Create multiple slots for staggered entry',
      'Limit to bar snacks/apps',
    ],
    bestFor: ['Bars', 'Restaurants', 'Breweries'],
  },
  {
    id: 'late-night',
    name: 'Late Night Special',
    description: 'Drive late evening customers',
    category: 'food',
    type: 'fixed',
    discountValue: 5,
    suggestedTimes: ['21:00', '22:00'],
    suggestedDuration: 120,
    tips: ['Best for Fri-Sat', 'Target nightlife crowds', 'Combine with local events'],
    bestFor: ['Late Night Dining', 'Fast Food', 'Delivery'],
  },
  {
    id: 'weekend-brunch',
    name: 'Weekend Brunch',
    description: 'Capture weekend brunch crowd',
    category: 'food',
    type: 'bogo',
    discountValue: 0,
    suggestedTimes: ['10:00', '11:00', '12:00'],
    suggestedDuration: 180,
    tips: [
      'Best for Sat-Sun',
      'Offer BOGO on popular items',
      'Set longer expiration for redemptions',
    ],
    bestFor: ['Brunch Spots', 'Cafes', 'Restaurants'],
  },
  {
    id: 'slow-days',
    name: 'Slow Day Booster',
    description: 'Fill empty slots',
    category: 'general',
    type: 'percent',
    discountValue: 25,
    suggestedTimes: ['14:00', '15:00', '16:00'],
    suggestedDuration: 120,
    tips: [
      'Monitor your slowest hours',
      'Test different discount levels',
      'Track redemption vs baseline traffic',
    ],
    bestFor: ['All Venues'],
  },
  {
    id: 'first-time',
    name: 'First Timer Special',
    description: 'Attract new customers',
    category: 'general',
    type: 'fixed',
    discountValue: 10,
    suggestedTimes: ['All Day'],
    suggestedDuration: 480,
    tips: [
      'Use as recurring weekly offer',
      'Highlight in marketing',
      'Track new customer conversion',
    ],
    bestFor: ['New Venues', 'Launch Promotions'],
  },
]
