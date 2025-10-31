import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'
import { getMerchantWithKYC } from '@/utilities/checkMerchantKYC'

/**
 * GET /api/merchant/staff/[id]
 * Get staff member details
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
    const staffMember = await payload.findByID({
      collection: 'users',
      id: parseInt(id),
      depth: 2,
    })

    // Verify staff member is assigned to merchant's venues
    const venues = await payload.find({
      collection: 'venues',
      where: { merchant: { equals: merchant.id } },
      limit: 100,
    })

    const venueIds = venues.docs.map((v) => v.id)
    const assignedVenues = staffMember.venues || []
    const isAssignedToMerchant = assignedVenues.some((assignment: any) => {
      const assignedVenueId =
        typeof assignment.venue === 'object' ? assignment.venue.id : assignment.venue
      return venueIds.includes(assignedVenueId)
    })

    if (!isAssignedToMerchant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ staffMember })
  } catch (error: any) {
    console.error('Error fetching staff member:', error)
    return NextResponse.json({ error: 'Failed to fetch staff member' }, { status: 500 })
  }
}

/**
 * PUT /api/merchant/staff/[id]
 * Update staff member and venue assignments
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
    const { name, email, phone } = body

    // Verify staff member exists and is assigned to merchant's venues
    const staffMember = await payload.findByID({
      collection: 'users',
      id: parseInt(id),
    })

    if (staffMember.role !== 'staff') {
      return NextResponse.json({ error: 'User is not a staff member' }, { status: 400 })
    }

    const venues = await payload.find({
      collection: 'venues',
      where: { merchant: { equals: merchant.id } },
      limit: 100,
    })

    const merchantVenueIds = venues.docs.map((v) => v.id)
    const assignedVenues = staffMember.venues || []
    const isAssignedToMerchant = assignedVenues.some((assignment: any) => {
      const assignedVenueId =
        typeof assignment.venue === 'object' ? assignment.venue.id : assignment.venue
      return merchantVenueIds.includes(assignedVenueId)
    })

    if (!isAssignedToMerchant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // If venueIds provided, verify they belong to merchant
    if (body.venueIds) {
      const venueIdsInt = body.venueIds.map((id: any) => parseInt(id))
      const requestedVenues = await payload.find({
        collection: 'venues',
        where: {
          merchant: { equals: merchant.id },
          id: { in: venueIdsInt },
        },
        limit: 100,
      })

      if (requestedVenues.docs.length !== venueIdsInt.length) {
        return NextResponse.json({ error: 'Invalid venue assignments' }, { status: 400 })
      }
    }

    // Update staff member
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (body.venueIds) {
      updateData.venues = body.venueIds.map((venueId: any) => ({ venue: parseInt(venueId) }))
    }

    const updatedStaff = await payload.update({
      collection: 'users',
      id: parseInt(id),
      data: updateData,
    })

    return NextResponse.json({ staffMember: updatedStaff })
  } catch (error: any) {
    console.error('Error updating staff member:', error)
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 })
  }
}

/**
 * DELETE /api/merchant/staff/[id]
 * Remove staff member (unassign from all venues)
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
    const staffMember = await payload.findByID({
      collection: 'users',
      id: parseInt(id),
    })

    if (staffMember.role !== 'staff') {
      return NextResponse.json({ error: 'User is not a staff member' }, { status: 400 })
    }

    // Verify staff member is assigned to merchant's venues
    const venues = await payload.find({
      collection: 'venues',
      where: { merchant: { equals: merchant.id } },
      limit: 100,
    })

    const venueIds = venues.docs.map((v) => v.id)
    const assignedVenues = staffMember.venues || []
    const isAssignedToMerchant = assignedVenues.some((assignment: any) => {
      const assignedVenueId =
        typeof assignment.venue === 'object' ? assignment.venue.id : assignment.venue
      return venueIds.includes(assignedVenueId)
    })

    if (!isAssignedToMerchant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Remove all venue assignments (soft delete)
    await payload.update({
      collection: 'users',
      id: parseInt(id),
      data: {
        venues: [],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing staff member:', error)
    return NextResponse.json({ error: 'Failed to remove staff member' }, { status: 500 })
  }
}

