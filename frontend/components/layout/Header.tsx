'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronDown, User, Settings, LogOut, HelpCircle } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useRBAC, ROLE_LABELS, ROLE_COLORS } from '@/lib/rbac'
import { SCHOOL_NOTIFICATIONS, SCHOOL_INFO } from '@/lib/mock-school-data'
import Link from 'next/link'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':    { title: 'Dashboard',        subtitle: 'School overview & insights' },
  '/students':     { title: 'Students',         subtitle: 'Student management & profiles' },
  '/attendance':   { title: 'Attendance',       subtitle: 'Daily & period attendance' },
  '/timetable':    { title: 'Timetable',        subtitle: 'Class & teacher schedules' },
  '/homework':     { title: 'Homework',         subtitle: 'Assignments & submissions' },
  '/examinations': { title: 'Examinations',     subtitle: 'Exams, results & report cards' },
  '/fees':         { title: 'Fee Management',   subtitle: 'Collections, dues & receipts' },
  '/staff':        { title: 'Staff & HR',       subtitle: 'Employee management & payroll' },
  '/circulars':    { title: 'Circulars',        subtitle: 'Notices & announcements' },
  '/library':      { title: 'Library',          subtitle: 'Books, issues & returns' },
  '/transport':    { title: 'Transport',        subtitle: 'Routes, buses & drivers' },
  '/inventory':    { title: 'Inventory',        subtitle: 'Assets & stock management' },
  '/analytics':    { title: 'Analytics',        subtitle: 'Market intelligence & insights' },
  '/helpdesk':     { title: 'Help Desk',        subtitle: 'Support tickets & resolution' },
  '/settings':     { title: 'Settings',         subtitle: 'School & account configuration' },
}

const NOTIF_ICONS: Record<string, string> = {
  attendance_alert: '⚠️', fee_due: '💰', circular: '📢',
  exam_result: '📊', birthday: '🎂', leave_update: '📋',
  homework: '📝', system: '⚙️',
}

export function Header({ className }: { className?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, mounted } = useRBAC()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications, setNotifications] = useState(SCHOOL_NOTIFICATIONS)

  const cleanPath = pathname.replace('/holy-child-school', '')
  const pageInfo =
    Object.entries(PAGE_TITLES).find(([key]) => cleanPath.startsWith(key))?.[1] ||
    PAGE_TITLES['/dashboard']

  const unreadCount = notifications.filter(n => n.unread).length

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))

  const displayUser = mounted && user
    ? { name: user.name, role: user.role }
    : { name: 'Loading…', role: 'principal' as const }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className={cn(
      'sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-6 flex-shrink-0',
      className
    )}>
      {/* Left: Page title + school badge */}
      <div className="min-w-0 flex items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-base font-bold text-foreground truncate">{pageInfo.title}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">{pageInfo.subtitle}</p>
        </div>
        <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-navy-900 dark:bg-navy-800 px-2.5 py-1 text-[10px] font-bold text-gold-400">
          📅 {SCHOOL_INFO.academicYear}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        <ThemeToggle variant="icon" />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(p => !p); setShowProfileMenu(false) }}
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
                  <button onClick={markAllRead} className="text-xs font-medium text-gold-600 dark:text-gold-400 hover:underline">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted cursor-pointer border-b border-border last:border-b-0',
                        notif.unread && 'bg-gold-50/50 dark:bg-gold-900/5'
                      )}
                    >
                      <span className="mt-0.5 text-base flex-shrink-0">{NOTIF_ICONS[notif.type] || '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-tight">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{notif.time}</p>
                      </div>
                      {notif.unread && (
                        <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-gold-500" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="border-t border-border px-4 py-2.5">
                  <Link href="/circulars" onClick={() => setShowNotifications(false)}
                    className="text-xs font-medium text-gold-600 dark:text-gold-400 hover:underline">
                    View all notifications →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfileMenu(p => !p); setShowNotifications(false) }}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-all hover:bg-muted"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 dark:from-navy-600 dark:to-navy-800 flex items-center justify-center text-white text-xs font-bold">
              {getInitials(displayUser.name)}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-28">{displayUser.name}</p>
              <span className={cn('inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold', ROLE_COLORS[displayUser.role])}>
                {ROLE_LABELS[displayUser.role]}
              </span>
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
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-bold text-foreground">{displayUser.name}</p>
                  <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mt-1', ROLE_COLORS[displayUser.role])}>
                    {ROLE_LABELS[displayUser.role]}
                  </span>
                </div>
                <div className="py-1">
                  {[
                    { icon: <User className="h-4 w-4" />, label: 'My Profile', href: '/settings' },
                    { icon: <Settings className="h-4 w-4" />, label: 'Settings', href: '/settings' },
                    { icon: <HelpCircle className="h-4 w-4" />, label: 'Help Desk', href: '/helpdesk' },
                  ].map(item => (
                    <Link key={item.label} href={item.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      {item.icon}{item.label}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-border py-1">
                  <button
                    onClick={() => { setShowProfileMenu(false); handleLogout() }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    <LogOut className="h-4 w-4" />Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {(showNotifications || showProfileMenu) && (
        <div className="fixed inset-0 z-20" onClick={() => { setShowNotifications(false); setShowProfileMenu(false) }} />
      )}
    </header>
  )
}

export default Header
