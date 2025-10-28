import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

/**
 * GET /api/web/categories
 * Public endpoint for fetching all categories for the web app
 */
export async function GET() {
  try {
    const config = await configPromise
    const payload = await getPayload({ config })

    const categories = await payload.find({
      collection: 'categories',
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
