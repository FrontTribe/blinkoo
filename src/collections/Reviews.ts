import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'id',
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          const review = doc as any
          const userId = typeof review.user === 'object' ? review.user.id : review.user

          if (!userId) return doc

          // Get or create user stats
          const userStats = await req.payload.find({
            collection: 'user-stats',
            where: {
              user: { equals: userId },
            },
            limit: 1,
          })

          if (userStats.docs.length === 0) {
            await req.payload.create({
              collection: 'user-stats',
              data: {
                user: userId as any,
                totalClaims: 0,
                totalReviews: 1,
                longestStreak: 0,
                currentStreak: 0,
              },
            })
          } else {
            const stats = userStats.docs[0]
            await req.payload.update({
              collection: 'user-stats',
              id: stats.id,
              data: {
                totalReviews: (stats.totalReviews || 0) + 1,
              },
            })
          }
        }

        return doc
      },
    ],
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
      name: 'offer',
      type: 'relationship',
      relationTo: 'offers',
      required: true,
      label: 'Offer',
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
      name: 'comment',
      type: 'textarea',
      label: 'Review Comment',
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
