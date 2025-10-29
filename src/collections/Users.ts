import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      // Users can read their own data, admins can read all
      if (user) {
        if (user.role === 'admin') {
          return true
        }
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
    create: () => true, // Allow anyone to create a user (for signup)
    update: ({ req: { user } }) => {
      // Users can update their own data, admins can update all
      if (user) {
        if (user.role === 'admin') {
          return true
        }
        return {
          id: {
            equals: user.id,
          },
        }
      }
      return false
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
      unique: true,
    },
    {
      name: 'phoneVerified',
      type: 'checkbox',
      label: 'Phone Verified',
      defaultValue: false,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Merchant Owner', value: 'merchant_owner' },
        { label: 'Staff', value: 'staff' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'customer',
      required: true,
    },
    {
      name: 'onboardingCompleted',
      type: 'checkbox',
      label: 'Onboarding Completed',
      defaultValue: false,
      admin: {
        condition: (data) => data.role === 'merchant_owner',
      },
    },
    {
      name: 'deviceFingerprint',
      type: 'text',
      label: 'Device Fingerprint',
    },
    {
      name: 'merchant',
      type: 'relationship',
      relationTo: 'merchants',
      label: 'Merchant (if merchant_owner)',
    },
    {
      name: 'venues',
      type: 'array',
      label: 'Assigned Venues (if staff)',
      fields: [
        {
          name: 'venue',
          type: 'relationship',
          relationTo: 'venues',
        },
      ],
    },
    {
      name: 'notificationPreferences',
      type: 'group',
      label: 'Notification Preferences',
      fields: [
        {
          name: 'inApp',
          type: 'checkbox',
          label: 'In-App Notifications',
          defaultValue: true,
        },
        {
          name: 'email',
          type: 'checkbox',
          label: 'Email Notifications',
          defaultValue: false,
        },
        {
          name: 'push',
          type: 'checkbox',
          label: 'Push Notifications',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'oneSignalPlayerId',
      type: 'text',
      label: 'OneSignal Player ID',
      admin: {
        readOnly: true,
        description: 'OneSignal player ID for push notifications',
      },
    },
  ],
}
