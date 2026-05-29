'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, CalendarCheck, DollarSign, BookOpen, Clock,
  FileText, Bus, Package, Ticket, Settings, ChevronLeft, ChevronRight,
  GraduationCap, LogOut, ClipboardList, Bell, Briefcase, Library,
  UserCog, ChevronDown, BarChart3,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useRBAC, ROLE_LABELS, ROLE_COLORS } from '@/lib/rbac'
import { SCHOOL_INFO } from '@/lib/mock-school-data'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Academic',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
      { href: '/students', label: 'Students', icon: <Users className="h-[18px] w-[18px]" /> },
      { href: '/attendance', label: 'Attendance', icon: <CalendarCheck className="h-[18px] w-[18px]" /> },
      { href: '/timetable', label: 'Timetable', icon: <Clock className="h-[18px] w-[18px]" /> },
      { href: '/homework', label: 'Homework', icon: <ClipboardList className="h-[18px] w-[18px]" /> },
      { href: '/examinations', label: 'Examinations', icon: <BookOpen className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/fees', label: 'Fees', icon: <DollarSign className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    label: 'HR & Staff',
    items: [
      { href: '/staff', label: 'Staff / HRMS', icon: <UserCog className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/circulars', label: 'Circulars', icon: <Bell className="h-[18px] w-[18px]" /> },
      { href: '/library', label: 'Library', icon: <Library className="h-[18px] w-[18px]" /> },
      { href: '/transport', label: 'Transport', icon: <Bus className="h-[18px] w-[18px]" /> },
      { href: '/inventory', label: 'Inventory', icon: <Package className="h-[18px] w-[18px]" /> },
      { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    label: 'Support',
    items: [
      { href: '/helpdesk', label: 'Help Desk', icon: <Ticket className="h-[18px] w-[18px]" /> },
      { href: '/settings', label: 'Settings', icon: <Settings className="h-[18px] w-[18px]" /> },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, canAccess, mounted } = useRBAC()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Academic: true, Finance: true, 'HR & Staff': true, Administration: false, Support: false,
  })

  const isActive = (href: string) => {
    const path = pathname.replace('/holy-child-school', '')
    if (href === '/dashboard') return path === '/dashboard' || path === '/'
    return path.startsWith(href)
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const toggleGroup = (label: string) => {
    if (isCollapsed) return
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const visibleGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => !mounted || !user || canAccess(item.href)),
  })).filter(group => group.items.length > 0)

  const displayUser = mounted && user
    ? { name: user.name, role: user.role }
    : { name: 'Guest', role: 'school_admin' as const }

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 264 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={cn(
        'relative flex h-screen flex-col border-r border-border bg-card overflow-hidden',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-border flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-navy-900 dark:bg-navy-800 shadow-md">
            <GraduationCap className="h-5 w-5 text-gold-400" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <span className="text-sm font-extrabold text-foreground whitespace-nowrap leading-tight">
                  Holy Child <span className="text-gold-500">School</span>
                </span>
                <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {SCHOOL_INFO.currentTerm}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-none">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {/* Group label */}
            {!isCollapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center justify-between px-4 py-1.5"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  {group.label}
                </span>
                <ChevronDown
                  className={cn(
                    'h-3 w-3 text-muted-foreground/40 transition-transform',
                    expandedGroups[group.label] && 'rotate-180'
                  )}
                />
              </button>
            )}
            {isCollapsed && <div className="my-1 border-t border-border/50 mx-3" />}

            <AnimatePresence>
              {(isCollapsed || expandedGroups[group.label] !== false) && (
                <motion.div
                  initial={false}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-0.5 px-2 overflow-hidden"
                >
                  {group.items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150',
                          active
                            ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <span className={cn(
                          'flex-shrink-0 transition-colors',
                          active ? 'text-gold-600 dark:text-gold-400' : 'text-muted-foreground group-hover:text-foreground'
                        )}>
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
                          <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-2 space-y-1 flex-shrink-0">
        <div className={cn('flex items-center rounded-lg px-2.5 py-1.5', isCollapsed && 'justify-center')}>
          <ThemeToggle variant={isCollapsed ? 'icon' : 'button'} />
        </div>

        <div className={cn(
          'flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted cursor-pointer',
          isCollapsed && 'justify-center'
        )}>
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 dark:from-navy-600 dark:to-navy-800 flex items-center justify-center text-white text-xs font-bold">
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
                <p className="text-xs font-semibold text-foreground truncate">{displayUser.name}</p>
                <span className={cn('inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold', ROLE_COLORS[displayUser.role])}>
                  {ROLE_LABELS[displayUser.role]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <button
              onClick={handleLogout}
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
        onClick={() => setIsCollapsed(p => !p)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </motion.aside>
  )
}

export default Sidebar
