'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'segmented'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { isDark, toggleTheme, theme, setDark, setLight, setSystem, mounted } = useTheme()

  if (!mounted) {
    return <div className={cn('h-9 w-9 rounded-lg bg-muted', className)} />
  }

  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5',
          className
        )}
      >
        <button
          onClick={setLight}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
            theme === 'light'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title="Light mode"
        >
          <Sun className="h-3.5 w-3.5" />
          Light
        </button>
        <button
          onClick={setSystem}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
            theme === 'system'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title="System mode"
        >
          <Monitor className="h-3.5 w-3.5" />
          System
        </button>
        <button
          onClick={setDark}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
            theme === 'dark'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          title="Dark mode"
        >
          <Moon className="h-3.5 w-3.5" />
          Dark
        </button>
      </div>
    )
  }

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground',
          className
        )}
      >
        {isDark ? (
          <>
            <Sun className="h-4 w-4" />
            Light Mode
          </>
        ) : (
          <>
            <Moon className="h-4 w-4" />
            Dark Mode
          </>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground',
        className
      )}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun
        className={cn(
          'absolute h-[18px] w-[18px] transition-all duration-300',
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        )}
      />
      <Moon
        className={cn(
          'absolute h-[18px] w-[18px] transition-all duration-300',
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        )}
      />
    </button>
  )
}

export default ThemeToggle
