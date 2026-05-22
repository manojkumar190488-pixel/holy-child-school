'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === 'dark' : false
  const isLight = mounted ? resolvedTheme === 'light' : true

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const setDark = () => setTheme('dark')
  const setLight = () => setTheme('light')
  const setSystem = () => setTheme('system')

  return {
    theme,
    resolvedTheme,
    systemTheme,
    isDark,
    isLight,
    mounted,
    toggleTheme,
    setTheme,
    setDark,
    setLight,
    setSystem,
  }
}
