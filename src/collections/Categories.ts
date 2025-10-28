import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'icon'],
    enableRichTextRelationship: false,
    group: 'Content',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Auto-generate slug from name if not provided
        if (operation === 'create' && data.name && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from name if left empty',
      },
    },
    {
      name: 'icon',
      type: 'select',
      required: true,
      options: [
        { label: 'Grid (All)', value: 'FiGrid' },
        { label: 'Coffee', value: 'FiCoffee' },
        { label: 'Film', value: 'FiFilm' },
        { label: 'Shopping Bag', value: 'FiShoppingBag' },
        { label: 'Tool', value: 'FiTool' },
        { label: 'Activity', value: 'FiActivity' },
        { label: 'Heart', value: 'FiHeart' },
        { label: 'Music', value: 'FiMusic' },
        { label: 'Camera', value: 'FiCamera' },
        { label: 'Smile', value: 'FiSmile' },
        { label: 'Book', value: 'FiBook' },
        { label: 'Gamepad', value: 'FiGamepad' },
        { label: 'Pen Tool', value: 'FiPenTool' },
        { label: 'Map', value: 'FiMap' },
        { label: 'Map Pin', value: 'FiMapPin' },
        { label: 'Home', value: 'FiHome' },
        { label: 'Building', value: 'FiBuilding' },
        { label: 'Globe', value: 'FiGlobe' },
        { label: 'Star', value: 'FiStar' },
        { label: 'Tag', value: 'FiTag' },
      ],
      admin: {
        description: 'Select an icon for this category',
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Color class for this category (e.g., "orange-primary")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
