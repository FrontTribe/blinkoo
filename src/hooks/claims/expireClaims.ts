/**
 * Hook to expire claims that have passed their expiry time
 * This should be called by a cron job periodically
 */

import { getPayload } from 'payload'
import configPromise from '../../payload.config'

export async function expireClaims() {
  const config = await configPromise
  const payload = await getPayload({ config })

  try {
    const now = new Date().toISOString()

    // Find all RESERVED claims that have expired
    const expiredClaims = await payload.find({
      collection: 'claims',
      where: {
        status: { equals: 'RESERVED' },
        expiresAt: { less_than: now },
      },
      limit: 100, // Process in batches
    })

    console.log(`Found ${expiredClaims.docs.length} expired claims`)

    // Update each claim and return quantity to slot
    for (const claim of expiredClaims.docs) {
      const claimData = claim as any

      try {
        // Update claim to EXPIRED
        await payload.update({
          collection: 'claims',
          id: claim.id,
          data: {
            status: 'EXPIRED',
          },
        })

        // Return quantity to slot
        const slot = claimData.slot
        if (typeof slot === 'object' && slot.id) {
          const currentSlot = await payload.findByID({
            collection: 'offer-slots',
            id: slot.id,
          })

          await payload.update({
            collection: 'offer-slots',
            id: slot.id,
            data: {
              qtyRemaining: ((slot as any).qtyRemaining || 0) + 1,
            },
          })

          console.log(`Returned quantity to slot ${slot.id}`)
        }
      } catch (error) {
        console.error(`Error processing claim ${claim.id}:`, error)
      }
    }

    return { success: true, processed: expiredClaims.docs.length }
  } catch (error) {
    console.error('Error expiring claims:', error)
    throw error
  }
}

