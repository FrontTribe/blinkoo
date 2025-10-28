import type { CollectionConfig } from 'payload'

export const Claims: CollectionConfig = {
  slug: 'claims',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'merchant_owner') return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'merchant_owner' || user.role === 'staff') {
        return true
      }
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
      name: 'offer',
      type: 'relationship',
      relationTo: 'offers',
      required: true,
      label: 'Offer',
    },
    {
      name: 'slot',
      type: 'relationship',
      relationTo: 'offer-slots',
      required: true,
      label: 'Slot',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      options: [
        { label: 'Reserved', value: 'RESERVED' },
        { label: 'Redeemed', value: 'REDEEMED' },
        { label: 'Expired', value: 'EXPIRED' },
        { label: 'Cancelled', value: 'CANCELLED' },
      ],
      defaultValue: 'RESERVED',
    },
    {
      name: 'reservedAt',
      type: 'date',
      label: 'Reserved At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      label: 'Expires At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'redeemedAt',
      type: 'date',
      label: 'Redeemed At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'qrToken',
      type: 'text',
      label: 'QR Token',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'sixCode',
      type: 'text',
      label: '6-Digit Code',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'staff',
      type: 'relationship',
      relationTo: 'users',
      label: 'Redeemed By Staff',
    },
    {
      name: 'basketTotal',
      type: 'number',
      label: 'Basket Total',
      admin: {
        description: 'Optional: Total basket value for ROI calculations',
      },
    },
  ],
}

