import type { CollectionConfig } from 'payload'
import { checkAchievements } from '@/utilities/checkAchievements'

export const Claims: CollectionConfig = {
  slug: 'claims',
  admin: {
    useAsTitle: 'id',
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Update user stats when claim is created or redeemed
        if (operation === 'create' || operation === 'update') {
          const claim = doc as any
          const userId = typeof claim.user === 'object' ? claim.user.id : claim.user
          const offer = typeof claim.offer === 'object' ? claim.offer : null

          if (!userId || !offer) return doc

          // Get or create user stats
          const userStats = await req.payload.find({
            collection: 'user-stats',
            where: {
              user: { equals: userId },
            },
            limit: 1,
          })

          let statsId: string | number
          let existingStats: any

          if (userStats.docs.length === 0) {
            // Create initial stats
            const newStats = await req.payload.create({
              collection: 'user-stats',
              data: {
                user: userId as any,
                totalClaims: 0,
                totalReviews: 0,
                longestStreak: 0,
                currentStreak: 0,
              },
            })
            statsId = newStats.id
            existingStats = newStats
          } else {
            statsId = userStats.docs[0].id
            existingStats = userStats.docs[0]
          }

          // Update stats based on operation
          if (operation === 'create') {
            // Increment total claims
            await req.payload.update({
              collection: 'user-stats',
              id: statsId,
              data: {
                totalClaims: (existingStats.totalClaims || 0) + 1,
                lastClaimDate: new Date().toISOString(),
              },
            })

            // Update streak
            const lastClaimDate = existingStats.lastClaimDate
              ? new Date(existingStats.lastClaimDate)
              : null
            const now = new Date()
            let currentStreak = existingStats.currentStreak || 0

            if (lastClaimDate) {
              const daysDiff = Math.floor(
                (now.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60 * 24),
              )

              if (daysDiff === 1) {
                // Streak continues
                currentStreak = (existingStats.currentStreak || 0) + 1
              } else if (daysDiff === 0) {
                // Same day, don't change streak
                currentStreak = existingStats.currentStreak || 0
              } else {
                // Streak broken
                currentStreak = 1
              }
            } else {
              // First claim ever
              currentStreak = 1
            }

            const longestStreak = Math.max(existingStats.longestStreak || 0, currentStreak)

            // Get category and venue
            const categoryId =
              typeof offer.category === 'object' ? offer.category?.id : offer.category
            const venueId = typeof offer.venue === 'object' ? offer.venue?.id : offer.venue

            // Update categories and venues claimed (avoid duplicates)
            const categoriesClaimed = existingStats.categoriesClaimed || []
            const venuesClaimed = existingStats.venuesClaimed || []

            if (
              categoryId &&
              !categoriesClaimed.some((c: any) => {
                const cid = typeof c.category === 'object' ? c.category?.id : c.category
                return String(cid) === String(categoryId)
              })
            ) {
              categoriesClaimed.push({ category: categoryId })
            }

            if (
              venueId &&
              !venuesClaimed.some((v: any) => {
                const vid = typeof v.venue === 'object' ? v.venue?.id : v.venue
                return String(vid) === String(venueId)
              })
            ) {
              venuesClaimed.push({ venue: venueId })
            }

            await req.payload.update({
              collection: 'user-stats',
              id: statsId,
              data: {
                currentStreak,
                longestStreak,
                categoriesClaimed,
                venuesClaimed,
              },
            })
          }

          // Check achievements on redemption
          if (claim.status === 'REDEEMED' && operation === 'update') {
            await checkAchievements(req.payload, userId)
          }
        }

        return doc
      },
    ],
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
    {
      name: 'reviewed',
      type: 'checkbox',
      label: 'Reviewed',
      defaultValue: false,
      admin: {
        description: 'Whether the user has submitted a review for this claim',
      },
    },
  ],
}
