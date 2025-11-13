import type { CollectionConfig } from 'payload'

export const Offers: CollectionConfig = {
  slug: 'offers',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return true // Allow updates for now
    },
  },
  fields: [
    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'venues',
      required: true,
      label: 'Venue',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: false,
      label: 'Category',
      admin: {
        description: 'Auto-populated from venue',
        readOnly: true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      localized: true,
    },
    {
      name: 'terms',
      type: 'textarea',
      label: 'Terms & Conditions',
      localized: true,
    },
    {
      name: 'type',
      type: 'select',
      label: 'Offer Type',
      required: true,
      options: [
        { label: 'Percentage Discount', value: 'percent' },
        { label: 'Fixed Price', value: 'fixed' },
        { label: 'Buy One Get One', value: 'bogo' },
        { label: 'Free Add-on', value: 'addon' },
      ],
    },
    {
      name: 'discountValue',
      type: 'number',
      label: 'Discount Value',
      admin: {
        description: 'Percentage (0-100) for percent type, or fixed amount for fixed type',
      },
    },
    {
      name: 'priceFloor',
      type: 'number',
      label: 'Price Floor',
      admin: {
        description: 'Minimum price for price-drop mechanics',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo',
    },
    {
      name: 'visibleFrom',
      type: 'date',
      label: 'Visible From',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'visibleTo',
      type: 'date',
      label: 'Visible To',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'perUserLimit',
      type: 'number',
      label: 'Per User Limit',
      defaultValue: 1,
      admin: {
        description: 'How many times a user can claim this offer',
      },
    },
    {
      name: 'cooldownMinutes',
      type: 'number',
      label: 'Cooldown (minutes)',
      defaultValue: 0,
      admin: {
        description: 'Cooldown period between user claims',
      },
    },
    {
      name: 'geofenceKm',
      type: 'number',
      label: 'Geofence (km)',
      defaultValue: 0,
      admin: {
        description: 'Distance requirement to claim (0 = no restriction)',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'active',
      required: true,
    },
    // Computed fields for reviews
    {
      name: 'averageRating',
      type: 'number',
      label: 'Average Rating',
      admin: {
        readOnly: true,
        description: 'Calculated average from reviews',
      },
      defaultValue: 0,
    },
    {
      name: 'totalReviews',
      type: 'number',
      label: 'Total Reviews',
      admin: {
        readOnly: true,
        description: 'Total number of reviews',
      },
      defaultValue: 0,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        // Log locale context for debugging
        console.log('BeforeChange - Operation:', operation)
        console.log('BeforeChange - Locale:', req.locale)
        console.log('BeforeChange - Data keys:', Object.keys(data))

        if (operation === 'create' && data.venue) {
          // Fetch the venue to get its category
          // data.venue can be a number, string, or object with id property
          let venueId: number | string

          if (typeof data.venue === 'number' || typeof data.venue === 'string') {
            venueId = data.venue
          } else if (typeof data.venue === 'object' && data.venue !== null && 'id' in data.venue) {
            venueId = data.venue.id
          } else {
            console.log('BeforeChange - Invalid venue data type:', typeof data.venue)
            return data
          }

          console.log('BeforeChange - venueId from data:', venueId, 'type:', typeof venueId)

          // Convert venueId to number if it's coming as string
          const numericId = typeof venueId === 'string' ? parseInt(venueId, 10) : venueId
          console.log('BeforeChange - numericId:', numericId, 'type:', typeof numericId)

          // Fetch venue with locale context
          const venue = await req.payload.findByID({
            collection: 'venues',
            id: numericId,
            locale: req.locale || 'hr', // Use request locale or fallback to default
          })
          console.log('BeforeChange - venue found:', venue.id, venue.name)

          if (venue.category) {
            data.category =
              typeof venue.category === 'string'
                ? venue.category
                : typeof venue.category === 'object' &&
                    venue.category !== null &&
                    'id' in venue.category
                  ? venue.category.id
                  : null
            console.log('BeforeChange - category set to:', data.category)
          }
        }

        return data
      },
    ],
  },
}
