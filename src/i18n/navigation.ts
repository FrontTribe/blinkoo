import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Re-export the navigation utilities from next-intl with our routing config
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
