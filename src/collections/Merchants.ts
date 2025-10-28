import type { CollectionConfig } from 'payload'

export const Merchants: CollectionConfig = {
  slug: 'merchants',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ data, req }) => {
      // Allow creation during signup (from API route with no user)
      // Or allow authenticated merchants to create
      const user = req?.user
      if (!user) {
        // Check if owner is being set (signup flow)
        return typeof data?.owner === 'string'
      }
      return Boolean(user)
    },
    update: ({ req }) => {
      const user = req?.user
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        owner: {
          equals: user.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Owner',
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Business Name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },
    {
      name: 'stripeAccountId',
      type: 'text',
      label: 'Stripe Account ID',
    },
    {
      name: 'kycStatus',
      type: 'select',
      label: 'KYC Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'approvedAt',
      type: 'date',
      label: 'Approved At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'categories',
      type: 'array',
      label: 'Categories',
      fields: [
        {
          name: 'category',
          type: 'select',
          required: true,
          options: [
            { label: 'Food & Beverage', value: 'food_beverage' },
            { label: 'Cafe', value: 'cafe' },
            { label: 'Restaurant', value: 'restaurant' },
            { label: 'Bar', value: 'bar' },
            { label: 'Retail', value: 'retail' },
            { label: 'Services', value: 'services' },
            { label: 'Entertainment', value: 'entertainment' },
            { label: 'Fitness', value: 'fitness' },
            { label: 'Other', value: 'other' },
          ],
        },
      ],
    },
  ],
}
