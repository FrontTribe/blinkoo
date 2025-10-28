import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { sql } from 'drizzle-orm'

/**
 * Migration script to populate category field for existing offers
 * This script fetches all offers and sets their category based on their venue's category
 */
async function migrateOfferCategories() {
  const config = await configPromise
  const payload = await getPayload({ config })
  const db = payload.db

  try {
    console.log('Starting migration: populating offer categories...')

    // Fetch all offers with their venue and category
    const offers = await payload.find({
      collection: 'offers',
      depth: 2, // Get venue and category data
      limit: 1000,
    })

    console.log(`Found ${offers.docs.length} offers to migrate`)

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const offer of offers.docs) {
      try {
        // Get venue from offer
        if (!offer.venue || typeof offer.venue !== 'object') {
          console.log(`Skipping offer ${offer.id}: no venue data`)
          skippedCount++
          continue
        }

        const venue = offer.venue as any

        // Get category from venue
        if (!venue.category) {
          console.log(`Skipping offer ${offer.id}: venue has no category`)
          skippedCount++
          continue
        }

        const categoryId = typeof venue.category === 'string' ? venue.category : venue.category.id

        // Update the offer directly in the database using raw SQL
        const result = await db.drizzle.execute(
          sql`UPDATE ${db.tables.offers} SET category_id = ${categoryId} WHERE id = ${offer.id}`,
        )

        updatedCount++
        console.log(`✅ Updated offer ${offer.id} with category ${categoryId}`)
      } catch (error) {
        console.error(`❌ Error updating offer ${offer.id}:`, error)
        errorCount++
      }
    }

    console.log('\n=== Migration Summary ===')
    console.log(`Total offers: ${offers.docs.length}`)
    console.log(`Updated: ${updatedCount}`)
    console.log(`Skipped: ${skippedCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log('Migration complete!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

migrateOfferCategories()
