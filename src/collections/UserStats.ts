import type { CollectionConfig } from 'payload'

export const UserStats: CollectionConfig = {
  slug: 'user-stats',
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
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Auto-create stats if they don't exist
        if (operation === 'create') {
          if (!data.lastClaimDate) {
            data.lastClaimDate = null
          }
          if (!data.categoriesClaimed) {
            data.categoriesClaimed = []
          }
          if (!data.venuesClaimed) {
            data.venuesClaimed = []
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      label: 'User',
    },
    {
      name: 'totalClaims',
      type: 'number',
      label: 'Total Claims',
      defaultValue: 0,
    },
    {
      name: 'totalReviews',
      type: 'number',
      label: 'Total Reviews',
      defaultValue: 0,
    },
    {
      name: 'categoriesClaimed',
      type: 'array',
      label: 'Categories Claimed',
      fields: [
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
        },
      ],
    },
    {
      name: 'venuesClaimed',
      type: 'array',
      label: 'Venues Claimed',
      fields: [
        {
          name: 'venue',
          type: 'relationship',
          relationTo: 'venues',
        },
      ],
    },
    {
      name: 'longestStreak',
      type: 'number',
      label: 'Longest Streak (days)',
      defaultValue: 0,
    },
    {
      name: 'currentStreak',
      type: 'number',
      label: 'Current Streak (days)',
      defaultValue: 0,
    },
    {
      name: 'lastClaimDate',
      type: 'date',
      label: 'Last Claim Date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'unlockedAchievements',
      type: 'array',
      label: 'Unlocked Achievements',
      fields: [
        {
          name: 'achievement',
          type: 'relationship',
          relationTo: 'achievements',
        },
        {
          name: 'unlockedAt',
          type: 'date',
          label: 'Unlocked At',
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
