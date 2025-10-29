import type { CollectionConfig } from 'payload'

export const OfferCollections: CollectionConfig = {
  slug: 'offer-collections',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Collection Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL-friendly identifier',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Collection Photo',
    },
    {
      name: 'offers',
      type: 'relationship',
      relationTo: 'offers',
      hasMany: true,
      label: 'Offers',
      admin: {
        description: 'Add offers to this collection',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Collection',
      defaultValue: false,
      admin: {
        description: 'Show on homepage',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      options: [
        { label: 'Date Night', value: 'date-night' },
        { label: 'Weekend Brunch', value: 'weekend-brunch' },
        { label: 'Happy Hour', value: 'happy-hour' },
        { label: 'Family Friendly', value: 'family-friendly' },
        { label: 'Budget Eats', value: 'budget-eats' },
        { label: 'Special Occasions', value: 'special-occasions' },
      ],
    },
  ],
}
