import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Delete the payload-token cookie
    cookieStore.delete('payload-token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()

    // Delete the payload-token cookie
    cookieStore.delete('payload-token')

    // Redirect to login
    return NextResponse.redirect(
      new URL('/auth/login', process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
