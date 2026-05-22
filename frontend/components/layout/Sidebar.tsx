'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  User,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { href: '/jobs', label: 'Jobs', icon: <Briefcase className="h-[18px] w-[18px]" /> },
  { href: '/bookmarks', label: 'Bookmarks', icon: <Bookmark className="h-[18px] w-[18px]" /> },
  { href: '/applications', label: 'Applications', icon: <ClipboardList className="h-[18px] w-[18px]" /> },
  { href: '/recruiters', label: 'Recruiters', icon: <Users className="h-[18px] w-[18px]" /> },
  { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
  { href: '/settings', label: 'Settings', icon: <Settings className="h-[18px] w-[18px]" /> },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const mockUser = {
    name: 'Alexandra Chen',
    email: 'alex.chen@consulting.com',
    title: 'Senior Strategy Consultant',
  }
  const displayUser = user || mockUser

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={cn(
        'relative flex h-screen flex-col border-r border-border bg-card overflow-hidden',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500 shadow-glow">
            <Zap className="h-4 w-4 text-navy-900 fill-navy-900" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <span className="text-sm font-bold text-foreground whitespace-nowrap">
                  Opportunity<span className="text-gold-500">IQ</span>
                </span>
                <p className="text-[10px] text-muted-foreground whitespace-nowrap">AI Career Intelligence</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-none">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <span
                  className={cn(
                    'flex-shrink-0 transition-colors',
                    active
                      ? 'text-gold-600 dark:text-gold-400'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {item.icon}
                </span>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge && !isCollapsed && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-900">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-2 space-y-1">
        {/* Theme Toggle */}
        <div
          className={cn(
            'flex items-center rounded-lg px-2.5 py-2',
            isCollapsed && 'justify-center'
          )}
        >
          <ThemeToggle variant={isCollapsed ? 'icon' : 'button'} />
        </div>

        {/* User Profile */}
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted cursor-pointer',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-900 text-xs font-bold">
              {getInitials(displayUser.name)}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 overflow-hidden min-w-0"
              >
                <p className="text-xs font-semibold text-foreground truncate">
                  {displayUser.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {(displayUser as typeof mockUser).title || displayUser.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <button
              onClick={() => logout()}
              className="flex-shrink-0 rounded p-1 text-muted-foreground hover:text-red-500 transition-colors"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed((p) => !p)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </motion.aside>
  )
}

export default Sidebar
