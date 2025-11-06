import type { CollectionConfig } from 'payload'

export const Shares: CollectionConfig = {
  slug: 'shares',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
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
      name: 'shareType',
      type: 'select',
      required: true,
      label: 'Share Type',
      options: [
        { label: 'Offer', value: 'offer' },
        { label: 'Achievement', value: 'achievement' },
        { label: 'Savings Milestone', value: 'milestone' },
        { label: 'Streak', value: 'streak' },
        { label: 'General', value: 'general' },
      ],
    },
    {
      name: 'offer',
      type: 'relationship',
      relationTo: 'offers',
      label: 'Offer (if shareType is offer)',
      admin: {
        condition: (data) => data.shareType === 'offer',
      },
    },
    {
      name: 'achievement',
      type: 'relationship',
      relationTo: 'achievements',
      label: 'Achievement (if shareType is achievement)',
      admin: {
        condition: (data) => data.shareType === 'achievement',
      },
    },
    {
      name: 'platform',
      type: 'select',
      label: 'Platform',
      options: [
        { label: 'Native Share', value: 'native' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Twitter', value: 'twitter' },
        { label: 'Link Copy', value: 'clipboard' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'data',
      type: 'json',
      label: 'Additional Data',
      admin: {
        description: 'Store additional context like message text, discounts, etc.',
      },
    },
  ],
}

