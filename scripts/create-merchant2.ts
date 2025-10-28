import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function create() {
  const config = await configPromise
  const payload = await getPayload({ config })

  console.log('🔍 Finding merchant2@merchant.com...\n')

  // Find the user
  const users = await payload.find({
    collection: 'users',
    where: {
      email: { equals: 'merchant2@merchant.com' },
    },
    limit: 1,
  })

  if (users.docs.length === 0) {
    console.log('❌ User not found')
    return
  }

  const user = users.docs[0]
  console.log(`Found user: ${user.email} (ID: ${user.id})`)

  // Create merchant account
  console.log('\n📝 Creating merchant account...')
  const merchant = await payload.create({
    collection: 'merchants',
    data: {
      owner: user.id as any,
      name: 'Čepin',
      description: 'Čepin Business',
      kycStatus: 'approved',
      approvedAt: new Date().toISOString(),
    },
  })
  console.log(`✅ Merchant created: ${merchant.name} (ID: ${merchant.id})`)

  console.log('\n🎉 Done!')
}

create()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
