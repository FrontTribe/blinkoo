import { getPayload } from 'payload'
import configPromise from '@/payload.config'

async function seedMerchant() {
  const config = await configPromise
  const payload = await getPayload({ config })

  try {
    // Find or create admin user
    let adminUser
    const existingAdmin = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'admin@admin.com',
        },
      },
    })

    if (existingAdmin.docs.length > 0) {
      adminUser = existingAdmin.docs[0]
      console.log(`Found existing admin user: ${adminUser.email}`)
    } else {
      // Create admin user
      adminUser = await payload.create({
        collection: 'users',
        data: {
          email: 'admin@admin.com',
          password: 'admin',
          name: 'Admin User',
          phone: '+385993241234',
          phoneVerified: true,
          role: 'admin',
        },
      })
      console.log(`Created admin user: ${adminUser.email}`)
    }

    // Check if merchant already exists
    const existingMerchant = await payload.find({
      collection: 'merchants',
      where: {
        owner: {
          equals: adminUser.id,
        },
      },
    })

    if (existingMerchant.docs.length > 0) {
      console.log('Merchant profile already exists for this user')
      return
    }

    // Create merchant profile
    const merchant = await payload.create({
      collection: 'merchants',
      data: {
        owner: adminUser.id,
        name: 'Demo Restaurant',
        description: 'A great restaurant offering off-peak deals',
        kycStatus: 'approved',
        categories: [{ category: 'restaurant' }, { category: 'food_beverage' }],
        approvedAt: new Date().toISOString(),
      },
    })

    console.log(`✅ Created merchant profile: ${merchant.name}`)
    console.log(`   Owner: ${adminUser.email}`)
    console.log(`   KYC Status: approved`)

    // Create a venue for the merchant
    const venue = await payload.create({
      collection: 'venues',
      data: {
        merchant: merchant.id,
        name: 'Downtown Location',
        address: '123 Main Street',
        city: 'Zagreb',
        country: 'Croatia',
        postalCode: '10000',
        latitude: 45.815,
        longitude: 15.9819,
        phone: '+385123456789',
        capacity: 50,
        openingHours: [
          { day: 'monday', open: '09:00', close: '22:00' },
          { day: 'tuesday', open: '09:00', close: '22:00' },
          { day: 'wednesday', open: '09:00', close: '22:00' },
          { day: 'thursday', open: '09:00', close: '22:00' },
          { day: 'friday', open: '09:00', close: '23:00' },
          { day: 'saturday', open: '09:00', close: '23:00' },
          { day: 'sunday', open: '10:00', close: '21:00' },
        ],
      },
    })

    console.log(`✅ Created venue: ${venue.name}`)

    // Create a sample offer
    const offer = await payload.create({
      collection: 'offers',
      data: {
        merchant: merchant.id,
        venue: venue.id,
        title: 'Happy Hour Special',
        description: '50% off all drinks and appetizers during off-peak hours',
        category: 'food_beverage',
        discountType: 'percentage',
        discountValue: 50,
        termsAndConditions:
          'Valid only during off-peak hours. Cannot be combined with other offers.',
        claimLimitPerUser: 1,
        claimLimitGlobal: 100,
        isActive: true,
      },
    })

    console.log(`✅ Created offer: ${offer.title}`)

    // Create an offer slot
    const slot = await payload.create({
      collection: 'offer-slots',
      data: {
        offer: offer.id,
        startTime: '2025-01-01T14:00:00Z',
        endTime: '2025-01-01T18:00:00Z',
        qtyTotal: 20,
        qtyRemaining: 20,
        isActive: true,
      },
    })

    console.log(`✅ Created offer slot: ${slot.startTime} - ${slot.endTime}`)

    console.log('')
    console.log('🎉 Seed completed successfully!')
    console.log('')
    console.log('You can now:')
    console.log('  1. Log in as admin@admin.com (password: admin)')
    console.log('  2. Go to /merchant/dashboard to manage your merchant profile')
    console.log('  3. Create offers and view analytics')
  } catch (error: any) {
    console.error('❌ Error seeding merchant:', error.message)
    console.error(error.stack)
  }
}

seedMerchant()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
