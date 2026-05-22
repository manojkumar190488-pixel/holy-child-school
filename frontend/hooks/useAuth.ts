'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useCallback } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  const isUnauthenticated = status === 'unauthenticated'

  const user = session?.user
    ? {
        id: (session.user as { id?: string }).id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        avatarUrl: session.user.image || undefined,
      }
    : null

  const login = useCallback(
    async (provider: string = 'google') => {
      await signIn(provider, { callbackUrl: '/dashboard' })
    },
    []
  )

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/' })
  }, [])

  const loginWithCredentials = useCallback(
    async (email: string, password: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      return result
    },
    []
  )

  return {
    user,
    session,
    status,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    login,
    logout,
    loginWithCredentials,
  }
}
