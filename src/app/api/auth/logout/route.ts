import { NextResponse } from 'next/server'

function setClearedCookies(response: NextResponse) {
  response.cookies.set('payload-token', '', {
    path: '/',
    expires: new Date(0),
  })
  response.cookies.set('payload-refresh-token', '', {
    path: '/',
    expires: new Date(0),
  })
}

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    setClearedCookies(response)
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const redirectBase = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const response = NextResponse.redirect(new URL('/auth/login', redirectBase))
    setClearedCookies(response)
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}


