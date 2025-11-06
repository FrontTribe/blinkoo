import type { CollectionConfig } from 'payload'

export const OfferSlots: CollectionConfig = {
  slug: 'offer-slots',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      // For now, allow authenticated users to update
      // Actual authorization is checked in API routes
      return Boolean(user)
    },
  },
  fields: [
    {
      name: 'offer',
      type: 'relationship',
      relationTo: 'offers',
      required: true,
      label: 'Offer',
    },
    {
      name: 'startsAt',
      type: 'date',
      required: true,
      label: 'Starts At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endsAt',
      type: 'date',
      required: true,
      label: 'Ends At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'qtyTotal',
      type: 'number',
      required: true,
      label: 'Total Quantity',
      admin: {
        description: 'Total units available in this slot',
      },
    },
    {
      name: 'qtyRemaining',
      type: 'number',
      required: true,
      label: 'Remaining Quantity',
      defaultValue: 0,
    },
    {
      name: 'mode',
      type: 'select',
      label: 'Release Mode',
      required: true,
      options: [
        { label: 'Flash Batch', value: 'flash' },
        { label: 'Rolling Drip', value: 'drip' },
      ],
      defaultValue: 'flash',
    },
    {
      name: 'dripEveryMinutes',
      type: 'number',
      label: 'Drip Every (minutes)',
      admin: {
        description: 'For drip mode: release units every X minutes',
        condition: (data) => data.mode === 'drip',
      },
    },
    {
      name: 'dripQty',
      type: 'number',
      label: 'Drip Quantity',
      admin: {
        description: 'For drip mode: how many units per release',
        condition: (data) => data.mode === 'drip',
      },
    },
    {
      name: 'state',
      type: 'select',
      label: 'State',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Live', value: 'live' },
        { label: 'Paused', value: 'paused' },
        { label: 'Ended', value: 'ended' },
      ],
      defaultValue: 'scheduled',
      required: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        // Initialize qtyRemaining to qtyTotal on create
        if (
          operation === 'create' &&
          data.qtyRemaining === undefined &&
          data.qtyTotal !== undefined
        ) {
          data.qtyRemaining = data.qtyTotal
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, previousDoc, req }) => {
        // Send smart notifications when a slot becomes live
        if (operation === 'update' && previousDoc && previousDoc.state !== 'live' && doc.state === 'live') {
          try {
            const slot = doc as any
            const offerId = typeof slot.offer === 'object' ? slot.offer.id : slot.offer

            if (offerId) {
              // Import dynamically to avoid circular dependencies
              const { sendSmartNotification, findSmartNotificationTargets } = await import('@/utilities/smartNotifications')

              // Fetch the full offer data
              const offer = await req.payload.findByID({
                collection: 'offers',
                id: offerId,
                depth: 1,
              })

              // Find users who should receive notifications
              const targets = await findSmartNotificationTargets(
                req.payload,
                offer as any,
                slot,
                undefined // TODO: Add location when available
              )

              // Send notifications to all targets
              for (const target of targets) {
                await sendSmartNotification(req.payload, {
                  user: target.user,
                  offer: offer as any,
                  slot,
                  userHistory: {
                    favoriteVenues: [],
                    savedOffers: [],
                    claimedOffers: [],
                    preferredCategories: [],
                  },
                })
              }

              console.log(`Smart notifications sent to ${targets.length} users for offer ${offerId}`)
            }
          } catch (error) {
            console.error('Error sending smart notifications for live slot:', error)
            // Don't fail the update if notifications fail
          }
        }

        return doc
      },
    ],
  },
}
