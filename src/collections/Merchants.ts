import type { CollectionConfig } from 'payload'

export const Merchants: CollectionConfig = {
  slug: 'merchants',
  admin: {
    useAsTitle: 'name',
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, previousDoc, req }) => {
        // Only process if this is an update operation and KYC status changed
        if (operation === 'update' && previousDoc && previousDoc.kycStatus !== doc.kycStatus) {
          const owner = typeof doc.owner === 'object' ? doc.owner : null
          if (!owner) return

          // Create notification
          try {
            await req.payload.create({
              collection: 'notifications',
              data: {
                user: typeof owner.id === 'number' ? owner.id : owner.id,
                type:
                  doc.kycStatus === 'approved'
                    ? 'kyc_approved'
                    : doc.kycStatus === 'rejected'
                      ? 'kyc_rejected'
                      : 'system',
                title:
                  doc.kycStatus === 'approved'
                    ? 'Account Approved! 🎉'
                    : doc.kycStatus === 'rejected'
                      ? 'Account Rejected'
                      : 'Account Status Updated',
                message:
                  doc.kycStatus === 'approved'
                    ? 'Your merchant account has been approved! You can now start creating offers and managing your venues.'
                    : doc.kycStatus === 'rejected'
                      ? doc.rejectionReason
                        ? `Your merchant account was rejected: ${doc.rejectionReason}`
                        : 'Your merchant account was rejected. Please contact support for details.'
                      : 'Your merchant account status has been updated.',
                read: false,
                link:
                  doc.kycStatus === 'approved'
                    ? '/merchant/dashboard'
                    : doc.kycStatus === 'rejected'
                      ? '/merchant/rejected'
                      : '/merchant/pending-approval',
              },
            })

            // Send email notification
            if (owner.email && (doc.kycStatus === 'approved' || doc.kycStatus === 'rejected')) {
              const { sendEmail, getKYCApprovedEmail, getKYCRejectedEmail } = await import(
                '@/utilities/sendEmail'
              )
              const userName = typeof owner.name === 'string' ? owner.name : 'Merchant'

              if (doc.kycStatus === 'approved') {
                await sendEmail({
                  to: owner.email,
                  subject: '🎉 Your Merchant Account Has Been Approved!',
                  html: getKYCApprovedEmail(userName),
                })
              } else if (doc.kycStatus === 'rejected') {
                await sendEmail({
                  to: owner.email,
                  subject: 'Account Rejected - Action Required',
                  html: getKYCRejectedEmail(userName, doc.rejectionReason || 'No reason provided'),
                })
              }
            }
          } catch (error) {
            console.error('Error creating notification:', error)
          }
        }

        return doc
      },
    ],
  },
  access: {
    read: () => true,
    create: ({ data, req }) => {
      // Allow creation during signup (from API route with no user)
      // Or allow authenticated merchants to create
      const user = req?.user
      if (!user) {
        // Check if owner is being set (signup flow)
        return typeof data?.owner === 'string'
      }
      return Boolean(user)
    },
    update: ({ req }) => {
      const user = req?.user
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        owner: {
          equals: user.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Owner',
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Business Name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },
    {
      name: 'stripeAccountId',
      type: 'text',
      label: 'Stripe Account ID',
    },
    {
      name: 'kycStatus',
      type: 'select',
      label: 'KYC Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'approvedAt',
      type: 'date',
      label: 'Approved At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      label: 'Rejection Reason',
      admin: {
        description: 'Reason for rejection (visible to merchant)',
      },
    },
    {
      name: 'rejectionDate',
      type: 'date',
      label: 'Rejected At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Date when account was rejected',
      },
    },
    {
      name: 'resubmissionNotes',
      type: 'textarea',
      label: 'Resubmission Notes',
      admin: {
        description: 'Notes from merchant when resubmitting for approval',
      },
    },
    {
      name: 'categories',
      type: 'array',
      label: 'Categories',
      fields: [
        {
          name: 'category',
          type: 'select',
          required: true,
          options: [
            { label: 'Food & Beverage', value: 'food_beverage' },
            { label: 'Cafe', value: 'cafe' },
            { label: 'Restaurant', value: 'restaurant' },
            { label: 'Bar', value: 'bar' },
            { label: 'Retail', value: 'retail' },
            { label: 'Services', value: 'services' },
            { label: 'Entertainment', value: 'entertainment' },
            { label: 'Fitness', value: 'fitness' },
            { label: 'Other', value: 'other' },
          ],
        },
      ],
    },
  ],
}
