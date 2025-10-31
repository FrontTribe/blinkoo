import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'
import { getMerchantWithKYC } from '@/utilities/checkMerchantKYC'

/**
 * GET /api/merchant/staff
 * List all staff members for merchant's venues
 */
export async function GET() {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check KYC approval
  const merchant = await getMerchantWithKYC(payload, user.id)
  if (!merchant || merchant.kycStatus !== 'approved') {
    return NextResponse.json({ error: 'Account not approved' }, { status: 403 })
  }

  try {
    // Get merchant's venues
    const venues = await payload.find({
      collection: 'venues',
      where: { merchant: { equals: merchant.id } },
      limit: 100,
    })

    const venueIds = venues.docs.map((v) => v.id)

    // Get all staff users assigned to these venues
    const staff = await payload.find({
      collection: 'users',
      where: {
        role: { equals: 'staff' },
      },
      limit: 100,
      depth: 2,
    })

    // Filter staff by venue assignments
    const merchantStaff = staff.docs.filter((staffMember: any) => {
      const assignedVenues = staffMember.venues || []
      return assignedVenues.some((assignment: any) => {
        const assignedVenueId =
          typeof assignment.venue === 'object' ? assignment.venue.id : assignment.venue
        return venueIds.includes(assignedVenueId)
      })
    })

    return NextResponse.json({ staff: merchantStaff })
  } catch (error: any) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

/**
 * POST /api/merchant/staff
 * Create new staff member with venue assignments
 */
export async function POST(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check KYC approval
  const merchant = await getMerchantWithKYC(payload, user.id)
  if (!merchant || merchant.kycStatus !== 'approved') {
    return NextResponse.json({ error: 'Account not approved' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, email, phone, password, venueIds } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    // Verify all venues belong to merchant
    const venueIdsInt = venueIds.map((id: any) => parseInt(id))
    const venues = await payload.find({
      collection: 'venues',
      where: {
        merchant: { equals: merchant.id },
        id: { in: venueIdsInt },
      },
      limit: 100,
    })

    if (venues.docs.length !== venueIdsInt.length) {
      return NextResponse.json({ error: 'Invalid venue assignments' }, { status: 400 })
    }

    // Create staff member
    const staffMember = await payload.create({
      collection: 'users',
      data: {
        name,
        email,
        phone: phone || '',
        password,
        role: 'staff',
        phoneVerified: false,
        venues: venueIdsInt.map((venueId: number) => ({ venue: venueId })),
      },
    })

    return NextResponse.json({ staffMember })
  } catch (error: any) {
    console.error('Error creating staff member:', error)
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 })
  }
}

