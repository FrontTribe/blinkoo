import type { CollectionConfig } from 'payload'

export const SavedOffers: CollectionConfig = {
  slug: 'saved-offers',
  admin: {
    useAsTitle: 'id',
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
      name: 'offer',
      type: 'relationship',
      relationTo: 'offers',
      required: true,
      label: 'Offer',
    },
    {
      name: 'notifyOnSlotStart',
      type: 'checkbox',
      label: 'Notify When Slot Starts',
      defaultValue: true,
      admin: {
        description: 'Get notified when a new slot becomes available for this offer',
      },
    },
    {
      name: 'notify30MinBefore',
      type: 'checkbox',
      label: 'Notify 30 Minutes Before Slot',
      defaultValue: false,
      admin: {
        description: 'Get notified 30 minutes before a slot starts',
      },
    },
  ],
}
