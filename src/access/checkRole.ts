import { User } from 'payload/types'

export function checkRole(user: User | null, allowedRoles: string[]): boolean {
  if (!user) return false
  if (typeof user.role === 'string') {
    return allowedRoles.includes(user.role)
  }
  return false
}

export function isAdmin(user: User | null): boolean {
  return checkRole(user, ['admin'])
}

export function isStaff(user: User | null): boolean {
  return checkRole(user, ['admin', 'merchant_owner', 'staff'])
}

export function isMerchant(user: User | null): boolean {
  return checkRole(user, ['admin', 'merchant_owner'])
}

