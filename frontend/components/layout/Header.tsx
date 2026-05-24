'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle,
  CreditCard,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { SearchBar } from '@/components/ui/SearchBar'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your intelligence overview' },
  '/jobs': { title: 'Job Opportunities', subtitle: 'AI-curated matches for you' },
  '/bookmarks': { title: 'Bookmarks', subtitle: 'Saved opportunities' },
  '/applications': { title: 'Application Tracker', subtitle: 'Manage your pipeline' },
  '/recruiters': { title: 'Recruiter Directory', subtitle: 'Your network contacts' },
  '/analytics': { title: 'Analytics', subtitle: 'Market intelligence & insights' },
  '/settings': { title: 'Settings', subtitle: 'Account & preferences' },
}

interface HeaderProps {
  className?: string
}

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'high_match',
    title: '3 new 90%+ match jobs',
    time: '5 min ago',
    unread: true,
  },
  {
    id: '2',
    type: 'digest',
    title: 'Daily digest ready — 12 jobs',
    time: '2 hrs ago',
    unread: true,
  },
  {
    id: '3',
    type: 'recruiter',
    title: 'New recruiter from McKinsey found',
    time: '4 hrs ago',
    unread: false,
  },
]

export function Header({ className }: HeaderProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const pageInfo =
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ||
    PAGE_TITLES['/dashboard']

  const unreadCount = notifications.filter((n) => n.unread).length

  const mockUser = {
    name: 'Manoj Kumar',
    email: 'manojkumar190488@gmail.com',
    title: 'Senior Consulting Professional',
  }
  const displayUser = user
    ? { name: user.name, email: user.email, title: 'Senior Consulting Professional' }
    : mockUser

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-6',
        className
      )}
    >
      {/* Left: Page title */}
      <div className="min-w-0">
        <h1 className="text-base font-bold text-foreground truncate">{pageInfo.title}</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">{pageInfo.subtitle}</p>
      </div>

      {/* Center: Search bar */}
      <div className="mx-4 hidden flex-1 max-w-lg md:block">
        <SearchBar
          placeholder="Search jobs, companies, skills..."
          size="sm"
          className="w-full"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Theme Toggle */}
        <ThemeToggle variant="icon" />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications((p) => !p)
              setShowProfileMenu(false)
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-50"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-sm font-bold text-foreground">Notifications</span>
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-gold-600 dark:text-gold-400 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted cursor-pointer border-b border-border last:border-b-0',
                        notif.unread && 'bg-gold-50/50 dark:bg-gold-900/5'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 h-2 w-2 flex-shrink-0 rounded-full',
                          notif.unread ? 'bg-gold-500' : 'bg-transparent'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border px-4 py-2.5">
                  <button className="text-xs font-medium text-gold-600 dark:text-gold-400 hover:underline">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu((p) => !p)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-all hover:bg-muted"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-900 text-xs font-bold">
              {getInitials(displayUser.name)}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold text-foreground leading-tight">{displayUser.name}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {displayUser.title || 'Consultant'}
              </p>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-50"
              >
                {/* Profile header */}
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-bold text-foreground">{displayUser.name}</p>
                  <p className="text-xs text-muted-foreground">{displayUser.email}</p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {[
                    { icon: <User className="h-4 w-4" />, label: 'Profile', href: '/settings' },
                    { icon: <Settings className="h-4 w-4" />, label: 'Settings', href: '/settings' },
                    { icon: <HelpCircle className="h-4 w-4" />, label: 'Help & Support', href: '#' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-border py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      logout()
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside handler */}
      {(showNotifications || showProfileMenu) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setShowNotifications(false)
            setShowProfileMenu(false)
          }}
        />
      )}
    </header>
  )
}

export default Header
