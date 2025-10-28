import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function check() {
  const config = await configPromise
  const payload = await getPayload({ config })

  console.log('🔍 Checking merchant2 account...\n')

  // Get all users with "merchant" in email
  const users = await payload.find({
    collection: 'users',
    where: {
      email: { contains: 'merchant2' },
    },
    limit: 10,
  })

  console.log(`Found ${users.docs.length} users:\n`)

  for (const user of users.docs) {
    console.log(`👤 User: ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Role: ${user.role}`)

    // Check if this user has a merchant account
    const merchants = await payload.find({
      collection: 'merchants',
      where: {
        owner: { equals: user.id },
      },
      limit: 1,
    })

    if (merchants.docs.length > 0) {
      console.log(`   ✅ Has merchant: ${merchants.docs[0].name}`)
    } else {
      console.log(`   ❌ NO MERCHANT ACCOUNT`)
    }

    console.log('')
  }
}

check()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

