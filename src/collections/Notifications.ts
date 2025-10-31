import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
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
    delete: ({ req: { user } }) => {
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
      label: 'Type',
      options: [
        { label: 'KYC Approved', value: 'kyc_approved' },
        { label: 'KYC Rejected', value: 'kyc_rejected' },
        { label: 'Offer Claimed', value: 'offer_claimed' },
        { label: 'Offer Expiring', value: 'offer_expiring' },
        { label: 'Low Stock', value: 'low_stock' },
        { label: 'System', value: 'system' },
        { label: 'Info', value: 'info' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'Message',
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      label: 'Read',
    },
    {
      name: 'link',
      type: 'text',
      label: 'Link',
      admin: {
        description: 'Optional link to navigate to when clicked',
      },
    },
  ],
}
