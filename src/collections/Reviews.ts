import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
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
        user: {
          equals: user.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'User',
    },
    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'venues',
      required: true,
      label: 'Venue',
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      label: 'Rating',
      min: 1,
      max: 5,
      admin: {
        description: 'Rating from 1 to 5',
      },
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Review Text',
    },
    {
      name: 'photos',
      type: 'array',
      label: 'Photos',
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}

