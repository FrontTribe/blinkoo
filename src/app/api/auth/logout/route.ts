import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function clearAuthCookies() {
  const cookieStore = cookies()
  cookieStore.set('payload-token', '', { path: '/', expires: new Date(0) })
  cookieStore.set('payload-refresh-token', '', { path: '/', expires: new Date(0) })
}

export async function POST() {
  try {
    clearAuthCookies()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    clearAuthCookies()
    const redirectBase = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    return NextResponse.redirect(new URL('/auth/login', redirectBase))
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}


