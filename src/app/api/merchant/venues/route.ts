import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })

  // Get user from request cookies (same as dashboard API)
  const cookieHeader = request.headers.get('cookie') || ''
  const headers = new Headers()
  headers.set('cookie', cookieHeader)

  const { user } = await payload.auth({ headers: headers as any })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get merchant for this user
    const merchants = await payload.find({
      collection: 'merchants',
      where: {
        owner: { equals: user.id },
      },
      limit: 1,
    })

    if (merchants.docs.length === 0) {
      return NextResponse.json({ venues: [] })
    }

    const merchant = merchants.docs[0]

    // Get merchant's venues with category data
    const venues = await payload.find({
      collection: 'venues',
      where: {
        merchant: { equals: merchant.id },
      },
      limit: 50,
      depth: 1, // Include category relationship
    })

    return NextResponse.json({ venues: venues.docs })
  } catch (error) {
    console.error('Error fetching venues:', error)
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })

  // Get user from request cookies (same as dashboard API)
  const cookieHeader = request.headers.get('cookie') || ''
  const headers = new Headers()
  headers.set('cookie', cookieHeader)

  const { user } = await payload.auth({ headers: headers as any })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Get merchant for this user
    const merchants = await payload.find({
      collection: 'merchants',
      where: {
        owner: { equals: user.id },
      },
      limit: 1,
    })

    if (merchants.docs.length === 0) {
      return NextResponse.json({ error: 'Merchant account not found' }, { status: 404 })
    }

    const merchant = merchants.docs[0]

    // Validate category exists
    let categoryId = body.category
    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    try {
      const category = await payload.findByID({
        collection: 'categories',
        id: categoryId,
      })
      categoryId = category.id
    } catch (error) {
      console.error('Category not found:', error)
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Create venue
    const venue = await payload.create({
      collection: 'venues',
      data: {
        merchant: merchant.id,
        name: body.name,
        description: body.description,
        address: body.address,
        city: body.city,
        country: body.country || 'Croatia',
        lat: body.lat,
        lng: body.lng,
        phone: body.phone,
        email: body.email,
        category: categoryId,
        status: 'active',
        openHours: body.openHours || {},
      },
      draft: false,
    })

    console.log('Venue created successfully:', venue.id)

    return NextResponse.json({ venue })
  } catch (error) {
    console.error('Error creating venue:', error)
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 })
  }
}
