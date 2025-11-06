import type { CollectionConfig } from 'payload'

export const SocialFeed: CollectionConfig = {
  slug: 'social-feed',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      // Users can update their own posts
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      // Users can delete their own posts, admins can delete any
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
      name: 'type',
      type: 'select',
      required: true,
      label: 'Post Type',
      options: [
        { label: 'Offer Claim', value: 'offer_claim' },
        { label: 'Achievement Unlocked', value: 'achievement' },
        { label: 'Savings Milestone', value: 'milestone' },
        { label: 'Streak', value: 'streak' },
        { label: 'Tip', value: 'tip' },
        { label: 'Photo', value: 'photo' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Content',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo',
    },
    {
      name: 'offer',
      type: 'relationship',
      relationTo: 'offers',
      label: 'Related Offer',
    },
    {
      name: 'achievement',
      type: 'relationship',
      relationTo: 'achievements',
      label: 'Related Achievement',
    },
    {
      name: 'metadata',
      type: 'json',
      label: 'Metadata',
      admin: {
        description: 'Additional data like savings amount, streak days, etc.',
      },
    },
    {
      name: 'likes',
      type: 'array',
      label: 'Likes',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'likedAt',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    {
      name: 'comments',
      type: 'array',
      label: 'Comments',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'comment',
          type: 'textarea',
        },
        {
          name: 'commentedAt',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
  ],
}

