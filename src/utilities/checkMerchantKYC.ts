import type { Payload } from 'payload'

export async function getMerchantWithKYC(payload: Payload, userId: number | string) {
  try {
    // Find merchant for this user
    const merchants = await payload.find({
      collection: 'merchants',
      where: {
        owner: { equals: userId },
      },
      limit: 1,
    })

    if (merchants.docs.length === 0) {
      return null
    }

    return merchants.docs[0]
  } catch (error) {
    console.error('Error fetching merchant:', error)
    return null
  }
}
