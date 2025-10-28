import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import configPromise from '@/payload.config'

export async function getUser() {
  const config = await configPromise
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  return user
}

export async function requireAuth() {
  const user = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role as string)) {
    redirect('/')
  }

  return user
}

export async function requirePhoneVerified() {
  const user = await requireAuth()

  if (!user.phoneVerified) {
    redirect('/auth/verify-phone')
  }

  return user
}
