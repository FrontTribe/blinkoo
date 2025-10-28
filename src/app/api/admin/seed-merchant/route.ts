import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function POST() {
  try {
    const config = await configPromise
    const payload = await getPayload({ config })

    // Find or create merchant user
    let merchantUser
    const existingMerchantUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'merchant@merchant.com',
        },
      },
    })

    if (existingMerchantUser.docs.length > 0) {
      merchantUser = existingMerchantUser.docs[0]
      console.log(`Found existing merchant user: ${merchantUser.email}`)
    } else {
      // Create merchant user
      merchantUser = await payload.create({
        collection: 'users',
        data: {
          email: 'merchant@merchant.com',
          password: 'merchant',
          name: 'Merchant User',
          phone: '+385993241234',
          phoneVerified: true,
          role: 'merchant_owner',
        },
      })
      console.log(`Created merchant user: ${merchantUser.email}`)
    }

    // Check if merchant already exists
    const existingMerchant = await payload.find({
      collection: 'merchants',
      where: {
        owner: {
          equals: merchantUser.id,
        },
      },
    })

    if (existingMerchant.docs.length > 0) {
      // Delete existing merchant and related data
      for (const existingMerchantDoc of existingMerchant.docs) {
        // Delete associated offers
        const offers = await payload.find({
          collection: 'offers',
          where: {
            venue: {
              merchant: {
                equals: existingMerchantDoc.id,
              },
            },
          },
        })
        for (const offer of offers.docs) {
          await payload.delete({
            collection: 'offers',
            id: offer.id,
          })
        }

        // Delete associated venues
        const venues = await payload.find({
          collection: 'venues',
          where: {
            merchant: {
              equals: existingMerchantDoc.id,
            },
          },
        })
        for (const venue of venues.docs) {
          await payload.delete({
            collection: 'venues',
            id: venue.id,
          })
        }

        // Delete the merchant
        await payload.delete({
          collection: 'merchants',
          id: existingMerchantDoc.id,
        })
      }
      console.log('Deleted existing merchant profile')
    }

    // Create merchant profile
    const merchant = await payload.create({
      collection: 'merchants',
      data: {
        owner: merchantUser.id,
        name: 'Demo Restaurant',
        description: 'A great restaurant offering off-peak deals',
        kycStatus: 'approved',
        categories: [{ category: 'restaurant' }, { category: 'food_beverage' }],
        approvedAt: new Date().toISOString(),
      },
    })

    console.log(`✅ Created merchant profile: ${merchant.name}`)

    // Create a venue for the merchant
    const venue = await payload.create({
      collection: 'venues',
      data: {
        merchant: merchant.id,
        name: 'Downtown Location',
        address: '123 Main Street, Zagreb, Croatia',
        city: 'Zagreb',
        country: 'Croatia',
        lat: 45.815,
        lng: 15.9819,
        phone: '+385123456789',
        status: 'active',
        openHours: {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '23:00' },
          saturday: { open: '09:00', close: '23:00' },
          sunday: { open: '10:00', close: '21:00' },
        },
      },
    })

    console.log(`✅ Created venue: ${venue.name}`)

    // Create a sample offer
    const offer = await payload.create({
      collection: 'offers',
      data: {
        venue: venue.id,
        title: 'Happy Hour Special',
        description: '50% off all drinks and appetizers during off-peak hours',
        type: 'percent',
        discountValue: 50,
        terms: 'Valid only during off-peak hours. Cannot be combined with other offers.',
      },
    })

    console.log(`✅ Created offer: ${offer.title}`)

    // Create an offer slot
    const slot = await payload.create({
      collection: 'offer-slots',
      data: {
        offer: offer.id,
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endsAt: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        qtyTotal: 20,
        qtyRemaining: 20,
        mode: 'flash',
        state: 'scheduled',
      },
    })

    console.log(`✅ Created offer slot`)

    return NextResponse.json({
      success: true,
      message: 'Merchant profile seeded successfully',
      data: {
        user: merchantUser.email,
        password: 'merchant',
        merchant: merchant.name,
        venue: venue.name,
        offer: offer.title,
      },
    })
  } catch (error: any) {
    console.error('Error seeding merchant:', error)
    return NextResponse.json({ error: error.message || 'Failed to seed merchant' }, { status: 500 })
  }
}
