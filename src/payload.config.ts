import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Merchants } from './collections/Merchants'
import { Venues } from './collections/Venues'
import { Categories } from './collections/Categories'
import { Offers } from './collections/Offers'
import { OfferSlots } from './collections/OfferSlots'
import { OfferCollections } from './collections/OfferCollections'
import { OfferTemplates } from './collections/OfferTemplates'
import { Waitlists } from './collections/Waitlists'
import { Claims } from './collections/Claims'
import { Reviews } from './collections/Reviews'
import { Favorites } from './collections/Favorites'
import { SavedOffers } from './collections/SavedOffers'
import { Achievements } from './collections/Achievements'
import { UserStats } from './collections/UserStats'
import { Notifications } from './collections/Notifications'
import { Shares } from './collections/Shares'
import { SocialFeed } from './collections/SocialFeed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Merchants,
    Venues,
    Categories,
    Offers,
    OfferSlots,
    OfferCollections,
    OfferTemplates,
    Claims,
    Reviews,
    Favorites,
    SavedOffers,
    Achievements,
    UserStats,
    Waitlists,
    Notifications,
    Shares,
    SocialFeed,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || process.env.POSTGRES_URL || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
