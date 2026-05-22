'use client'

import { useCallback } from 'react'

const MOCK_USER = {
  id: '1',
  name: 'Manoj Kumar',
  email: 'manojkumar190488@gmail.com',
  avatarUrl: undefined as string | undefined,
}

export function useAuth() {
  const login = useCallback(async (_provider: string = 'google') => {}, [])
  const logout = useCallback(async () => {}, [])
  const loginWithCredentials = useCallback(
    async (_email: string, _password: string) => ({ ok: true, error: null }),
    []
  )

  return {
    user: MOCK_USER,
    session: null,
    status: 'authenticated' as const,
    isLoading: false,
    isAuthenticated: true,
    isUnauthenticated: false,
    login,
    logout,
    loginWithCredentials,
  }
}
