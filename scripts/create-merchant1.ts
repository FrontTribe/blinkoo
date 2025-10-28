import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function create() {
  const config = await configPromise
  const payload = await getPayload({ config })

  console.log('🔍 Finding merchant1@merchant.com...\n')

  // Find the user
  const users = await payload.find({
    collection: 'users',
    where: {
      email: { equals: 'merchant1@merchant.com' },
    },
    limit: 1,
  })

  if (users.docs.length === 0) {
    console.log('❌ User not found')
    return
  }

  const user = users.docs[0]
  console.log(`Found user: ${user.email} (ID: ${user.id})`)

  // Update user role
  console.log('\n📝 Updating user role to merchant_owner...')
  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      role: 'merchant_owner',
    },
  })
  console.log('✅ Role updated')

  // Create merchant account
  console.log('\n📝 Creating merchant account...')
  const merchant = await payload.create({
    collection: 'merchants',
    data: {
      owner: user.id as any,
      name: 'Merchant 1 Business',
      description: 'Merchant 1 Business Description',
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
