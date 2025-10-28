import type { CollectionConfig } from 'payload'

export const OfferSlots: CollectionConfig = {
  slug: 'offer-slots',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        offer: {
          venue: {
            merchant: {
              owner: {
                equals: user.id,
              },
            },
          },
        },
      }
    },
  },
  fields: [
    {
      name: 'offer',
      type: 'relationship',
      relationTo: 'offers',
      required: true,
      label: 'Offer',
    },
    {
      name: 'startsAt',
      type: 'date',
      required: true,
      label: 'Starts At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endsAt',
      type: 'date',
      required: true,
      label: 'Ends At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'qtyTotal',
      type: 'number',
      required: true,
      label: 'Total Quantity',
      admin: {
        description: 'Total units available in this slot',
      },
    },
    {
      name: 'qtyRemaining',
      type: 'number',
      required: true,
      label: 'Remaining Quantity',
      defaultValue: 0,
    },
    {
      name: 'mode',
      type: 'select',
      label: 'Release Mode',
      required: true,
      options: [
        { label: 'Flash Batch', value: 'flash' },
        { label: 'Rolling Drip', value: 'drip' },
      ],
      defaultValue: 'flash',
    },
    {
      name: 'dripEveryMinutes',
      type: 'number',
      label: 'Drip Every (minutes)',
      admin: {
        description: 'For drip mode: release units every X minutes',
        condition: (data) => data.mode === 'drip',
      },
    },
    {
      name: 'dripQty',
      type: 'number',
      label: 'Drip Quantity',
      admin: {
        description: 'For drip mode: how many units per release',
        condition: (data) => data.mode === 'drip',
      },
    },
    {
      name: 'state',
      type: 'select',
      label: 'State',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Live', value: 'live' },
        { label: 'Paused', value: 'paused' },
        { label: 'Ended', value: 'ended' },
      ],
      defaultValue: 'scheduled',
      required: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        // Initialize qtyRemaining to qtyTotal on create
        if (
          operation === 'create' &&
          data.qtyRemaining === undefined &&
          data.qtyTotal !== undefined
        ) {
          data.qtyRemaining = data.qtyTotal
        }
        return data
      },
    ],
  },
}
