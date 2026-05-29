'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SchoolUser, UserRole } from '@/types/school'

// ────────────────────────────────────────────────────────────────
// Module access map — role → list of allowed route prefixes
// ────────────────────────────────────────────────────────────────

export const ROLE_MODULE_ACCESS: Record<UserRole, string[]> = {
  super_admin: [
    '/dashboard','/students','/attendance','/fees','/examinations',
    '/timetable','/homework','/circulars','/library','/transport',
    '/staff','/inventory','/helpdesk','/settings','/analytics',
    '/recruiters','/bookmarks','/applications',
  ],
  school_admin: [
    '/dashboard','/students','/attendance','/fees','/examinations',
    '/timetable','/homework','/circulars','/library','/transport',
    '/staff','/inventory','/helpdesk','/settings','/analytics',
  ],
  principal: [
    '/dashboard','/students','/attendance','/fees','/examinations',
    '/timetable','/homework','/circulars','/library','/transport',
    '/staff','/helpdesk','/settings','/analytics',
  ],
  vice_principal: [
    '/dashboard','/students','/attendance','/examinations',
    '/timetable','/homework','/circulars','/library','/helpdesk','/settings',
  ],
  teacher: [
    '/dashboard','/students','/attendance','/examinations',
    '/timetable','/homework','/circulars','/helpdesk','/settings',
  ],
  student: [
    '/dashboard','/attendance','/examinations',
    '/timetable','/homework','/circulars','/library','/settings',
  ],
  parent: [
    '/dashboard','/students','/attendance','/fees',
    '/examinations','/circulars','/transport','/helpdesk','/settings',
  ],
  accountant: [
    '/dashboard','/fees','/students','/helpdesk','/settings',
  ],
  librarian: [
    '/dashboard','/library','/students','/helpdesk','/settings',
  ],
  transport_manager: [
    '/dashboard','/transport','/students','/helpdesk','/settings',
  ],
  hr_manager: [
    '/dashboard','/staff','/attendance','/helpdesk','/settings',
  ],
  receptionist: [
    '/dashboard','/students','/circulars','/helpdesk','/settings',
  ],
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  school_admin: 'School Admin',
  principal: 'Principal',
  vice_principal: 'Vice Principal',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
  accountant: 'Accountant',
  librarian: 'Librarian',
  transport_manager: 'Transport Manager',
  hr_manager: 'HR Manager',
  receptionist: 'Receptionist',
}

export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  super_admin: '/dashboard',
  school_admin: '/dashboard',
  principal: '/dashboard',
  vice_principal: '/dashboard',
  teacher: '/dashboard',
  student: '/dashboard',
  parent: '/dashboard',
  accountant: '/fees',
  librarian: '/library',
  transport_manager: '/transport',
  hr_manager: '/staff',
  receptionist: '/students',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  school_admin: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  principal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  vice_principal: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  student: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  parent: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  accountant: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  librarian: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  transport_manager: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  hr_manager: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  receptionist: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
}

// ────────────────────────────────────────────────────────────────
// Storage helpers (SSR-safe)
// ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'school_erp_user'

export function getStoredUser(): SchoolUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SchoolUser) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: SchoolUser): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// ────────────────────────────────────────────────────────────────
// useRBAC hook
// ────────────────────────────────────────────────────────────────

export function useRBAC() {
  const [user, setUser] = useState<SchoolUser | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
    setMounted(true)
  }, [])

  const login = useCallback((u: SchoolUser) => {
    setStoredUser(u)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    clearStoredUser()
    setUser(null)
  }, [])

  const canAccess = useCallback(
    (routePrefix: string) => {
      if (!user) return false
      const allowed = ROLE_MODULE_ACCESS[user.role] ?? []
      return allowed.some((p) => routePrefix === p || routePrefix.startsWith(p))
    },
    [user]
  )

  const isRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user]
  )

  return { user, mounted, login, logout, canAccess, isRole }
}
