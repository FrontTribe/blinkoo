import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@/payload.config'

/**
 * GET /api/merchant/analytics/timing-insights
 * Get timing insights for merchant offers - best times to run offers
 */
export async function GET(request: Request) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user || (user.role !== 'merchant_owner' && user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get merchant's offers
    const merchant = await payload.find({
      collection: 'merchants',
      where: {
        owner: { equals: user.id },
      },
      limit: 1,
    })

    if (merchant.docs.length === 0) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    const merchantId = merchant.docs[0].id

    // Get all venues for this merchant
    const venues = await payload.find({
      collection: 'venues',
      where: {
        merchant: { equals: merchantId },
      },
    })

    const venueIds = venues.docs.map((v: any) => v.id)

    if (venueIds.length === 0) {
      return NextResponse.json({
        hourlyData: [],
        dailyData: [],
        suggestedSlots: [],
      })
    }

    // Get all claims from last 30 days for these venues
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const claims = await payload.find({
      collection: 'claims',
      where: {
        and: [{ venue: { in: venueIds } }, { createdAt: { greater_than: thirtyDaysAgo } }],
      },
      limit: 1000,
    })

    // Aggregate by day of week and hour
    const hourlyData: Record<number, number> = {}
    const dailyData: Record<number, number> = {}

    claims.docs.forEach((claim: any) => {
      if (claim.createdAt) {
        const date = new Date(claim.createdAt)
        const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
        const hour = date.getHours()

        dailyData[dayOfWeek] = (dailyData[dayOfWeek] || 0) + 1
        hourlyData[hour] = (hourlyData[hour] || 0) + 1
      }
    })

    // Convert to arrays for easier frontend consumption
    const hourlyArray = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyData[hour] || 0,
    }))

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dailyArray = Array.from({ length: 7 }, (_, day) => ({
      day,
      dayName: dayNames[day],
      count: dailyData[day] || 0,
    }))

    // Calculate suggested time slots (top 3 days + hours)
    const topDays = dailyArray
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .filter((d) => d.count > 0)

    const topHours = hourlyArray
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .filter((h) => h.count > 0)

    const suggestedSlots = topDays
      .flatMap((day) =>
        topHours.map((hour) => ({
          day: day.day,
          dayName: day.dayName,
          hour: hour.hour,
          hourLabel: `${hour.hour}:00`,
          confidence:
            (day.count / (claims.docs.length || 1)) * (hour.count / (claims.docs.length || 1)),
        })),
      )
      .slice(0, 6)

    // Calculate cold hours (times with no/minimal activity)
    const coldHours = hourlyArray.filter((h) => h.count === 0).map((h) => h.hour)

    return NextResponse.json({
      hourlyData: hourlyArray,
      dailyData: dailyArray,
      suggestedSlots,
      coldHours,
      totalClaims: claims.docs.length,
    })
  } catch (error) {
    console.error('Error fetching timing insights:', error)
    return NextResponse.json({ error: 'Failed to fetch timing insights' }, { status: 500 })
  }
}
