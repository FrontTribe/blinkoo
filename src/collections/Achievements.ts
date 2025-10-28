import type { CollectionConfig } from 'payload'

export const Achievements: CollectionConfig = {
  slug: 'achievements',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Achievement Name',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Description',
    },
    {
      name: 'icon',
      type: 'text',
      required: true,
      label: 'Icon',
      admin: {
        description: 'Emoji or icon identifier (e.g., 🎯, 🏆, ⭐)',
      },
      defaultValue: '🏆',
    },
    {
      name: 'tier',
      type: 'select',
      required: true,
      label: 'Tier',
      options: [
        { label: 'Bronze', value: 'bronze' },
        { label: 'Silver', value: 'silver' },
        { label: 'Gold', value: 'gold' },
        { label: 'Platinum', value: 'platinum' },
      ],
      defaultValue: 'bronze',
    },
    {
      name: 'criteria',
      type: 'json',
      label: 'Criteria',
      admin: {
        description: 'JSON object defining the criteria to unlock this achievement',
      },
    },
  ],
}
