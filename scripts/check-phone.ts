import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function check() {
  const config = await configPromise
  const payload = await getPayload({ config })

  console.log('📱 Checking phone numbers...\n')

  // Get all users
  const users = await payload.find({
    collection: 'users',
    limit: 100,
  })

  console.log(`Found ${users.docs.length} users:\n`)

  users.docs.forEach((user) => {
    console.log(`${user.email}`)
    console.log(`   Phone: ${user.phone || '(none)'}`)
    console.log(`   Role: ${user.role}`)
    console.log('')
  })
}

check()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
