import type { CollectionConfig } from 'payload'

export const OfferTemplates: CollectionConfig = {
  slug: 'offer-templates',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'merchant',
      type: 'relationship',
      relationTo: 'merchants',
      required: true,
      label: 'Merchant',
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Template Name',
      admin: {
        description: 'e.g., "Weekday Lunch Special"',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'recurrence',
      type: 'select',
      required: true,
      label: 'Recurrence Pattern',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
      ],
      defaultValue: 'weekly',
    },
    {
      name: 'daysOfWeek',
      type: 'array',
      label: 'Days of Week',
      admin: {
        condition: (data) => data.recurrence === 'weekly',
      },
      fields: [
        {
          name: 'day',
          type: 'select',
          required: true,
          options: [
            { label: 'Monday', value: 'monday' },
            { label: 'Tuesday', value: 'tuesday' },
            { label: 'Wednesday', value: 'wednesday' },
            { label: 'Thursday', value: 'thursday' },
            { label: 'Friday', value: 'friday' },
            { label: 'Saturday', value: 'saturday' },
            { label: 'Sunday', value: 'sunday' },
          ],
        },
      ],
    },
    {
      name: 'startTime',
      type: 'text',
      required: true,
      label: 'Start Time',
      admin: {
        description: 'e.g., "14:00" (24-hour format)',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      label: 'End Time',
      admin: {
        description: 'e.g., "17:00" (24-hour format)',
      },
    },
    {
      name: 'qtyTotal',
      type: 'number',
      required: true,
      label: 'Quantity',
      admin: {
        description: 'Total units per slot',
      },
    },
    {
      name: 'mode',
      type: 'select',
      required: true,
      label: 'Release Mode',
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
        description: 'For drip mode only',
        condition: (data) => data.mode === 'drip',
      },
    },
    {
      name: 'dripQty',
      type: 'number',
      label: 'Drip Quantity',
      admin: {
        description: 'For drip mode only',
        condition: (data) => data.mode === 'drip',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        description: 'Only active templates can be used',
      },
    },
  ],
}
