import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

/**
 * GET /api/web/categories
 * Public endpoint for fetching all categories for the web app
 * Query parameters:
 * - locale: locale code (hr, en) - defaults to 'hr'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'hr'

    const config = await configPromise
    const payload = await getPayload({ config })

    const categories = await payload.find({
      collection: 'categories',
      locale: locale as 'hr' | 'en',
      sort: 'name',
      limit: 100,
    })

    return NextResponse.json({
      categories: categories.docs,
      total: categories.totalDocs,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
