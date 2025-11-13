import type { CollectionConfig } from 'payload'

export const Waitlists: CollectionConfig = {
  slug: 'waitlists',
  admin: {
    useAsTitle: 'id',
    group: 'Customer Activity',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      // Users can read their own waitlist entries
      return {
        user: { equals: user.id },
      }
    },
    create: ({ req: { user } }) => !!user, // Authenticated users can create waitlist entries
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        user: { equals: user.id },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        user: { equals: user.id },
      }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'offer',
      type: 'relationship',
      relationTo: 'offers',
      required: true,
    },
    {
      name: 'position',
      type: 'number',
      label: 'Position in Queue',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'autoClaim',
      type: 'checkbox',
      label: 'Auto-Claim When Available',
      defaultValue: true,
    },
    {
      name: 'notified',
      type: 'checkbox',
      label: 'Notification Sent',
      defaultValue: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Waiting', value: 'waiting' },
        { label: 'Available', value: 'available' },
        { label: 'Claimed', value: 'claimed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'waiting',
    },
  ],
}
