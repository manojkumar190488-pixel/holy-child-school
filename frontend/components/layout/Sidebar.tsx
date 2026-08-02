'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, Bookmark, ClipboardList, Users,
  BarChart3, Settings, ChevronLeft, ChevronRight, Zap, LogOut,
  Newspaper, TrendingUp, Bot, FileText, Brain, Rocket, Network,
  Building2, GitBranch, Trophy, ChevronDown,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
  badgeColor?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Intelligence',
    items: [
      { href: '/dashboard', label: 'Command Centre', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
      { href: '/digest', label: 'Daily Digest', icon: <Newspaper className="h-[18px] w-[18px]" />, badge: 20, badgeColor: 'bg-gold-500' },
      { href: '/market', label: 'Market Intelligence', icon: <TrendingUp className="h-[18px] w-[18px]" /> },
      { href: '/agents', label: 'AI Agents', icon: <Bot className="h-[18px] w-[18px]" />, badge: 10, badgeColor: 'bg-emerald-500' },
    ],
  },
  {
    label: 'Opportunities',
    items: [
      { href: '/jobs', label: 'Job Discovery', icon: <Briefcase className="h-[18px] w-[18px]" />, badge: 44, badgeColor: 'bg-blue-500' },
      { href: '/companies', label: 'Target Companies', icon: <Building2 className="h-[18px] w-[18px]" /> },
      { href: '/bookmarks', label: 'Saved Jobs', icon: <Bookmark className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    label: 'Applications',
    items: [
      { href: '/applications', label: 'Application Tracker', icon: <ClipboardList className="h-[18px] w-[18px]" /> },
      { href: '/auto-apply', label: 'Auto-Apply Engine', icon: <Rocket className="h-[18px] w-[18px]" />, badge: 3, badgeColor: 'bg-purple-500' },
      { href: '/resume', label: 'Resume Centre', icon: <FileText className="h-[18px] w-[18px]" /> },
      { href: '/offers', label: 'Offers & Negotiations', icon: <Trophy className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    label: 'Network',
    items: [
      { href: '/recruiters', label: 'Recruiter CRM', icon: <Users className="h-[18px] w-[18px]" /> },
      { href: '/networking', label: 'Networking Hub', icon: <Network className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    label: 'Preparation',
    items: [
      { href: '/interview', label: 'Interview Intelligence', icon: <Brain className="h-[18px] w-[18px]" /> },
      { href: '/strategy', label: 'Career Strategy', icon: <GitBranch className="h-[18px] w-[18px]" /> },
      { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
    ],
  },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const mockUser = { name: 'Manoj Kumar', email: 'manojkumar190488@gmail.com', title: 'VP – Digital & Advisory' }
  const displayUser = user || mockUser

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 272 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={cn('relative flex h-screen flex-col border-r border-border bg-card overflow-hidden', className)}
    >
      <div className="flex h-16 items-center px-4 border-b border-border flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500 shadow-glow">
            <Zap className="h-4 w-4 text-navy-900 fill-navy-900" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
                <span className="text-sm font-bold text-foreground whitespace-nowrap">GovIntel<span className="text-gold-500"> AI</span></span>
                <p className="text-[10px] text-muted-foreground whitespace-nowrap">Opportunity Intelligence Platform</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-none space-y-3">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!isCollapsed && (
              <button onClick={() => toggleGroup(group.label)} className="flex items-center justify-between w-full px-2.5 py-1 mb-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{group.label}</span>
                <ChevronDown className={cn('h-3 w-3 text-muted-foreground/40 transition-transform', collapsedGroups[group.label] && '-rotate-90')} />
              </button>
            )}
            {(!collapsedGroups[group.label] || isCollapsed) && (
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link key={item.href} href={item.href}
                      className={cn('group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150',
                        active ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className={cn('flex-shrink-0 transition-colors', active ? 'text-gold-600 dark:text-gold-400' : 'text-muted-foreground group-hover:text-foreground')}>
                        {item.icon}
                      </span>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex-1 overflow-hidden whitespace-nowrap">
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {item.badge && !isCollapsed && (
                        <span className={cn('flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white', item.badgeColor || 'bg-gold-500')}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
        <div className="space-y-0.5">
          {!isCollapsed && <div className="px-2.5 py-1"><span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Account</span></div>}
          <Link href="/settings"
            className={cn('group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150',
              pathname === '/settings' ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
            )}
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings className="h-[18px] w-[18px] flex-shrink-0" />
            <AnimatePresence>
              {!isCollapsed && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden whitespace-nowrap">Settings</motion.span>}
            </AnimatePresence>
          </Link>
        </div>
      </nav>

      <div className="border-t border-border p-2 space-y-1 flex-shrink-0">
        <div className={cn('flex items-center rounded-lg px-2.5 py-2', isCollapsed && 'justify-center')}>
          <ThemeToggle variant={isCollapsed ? 'icon' : 'button'} />
        </div>
        <div className={cn('flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted cursor-pointer', isCollapsed && 'justify-center')}>
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-900 text-xs font-bold">
              {getInitials(displayUser.name)}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex-1 overflow-hidden min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{displayUser.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{(displayUser as typeof mockUser).title}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <button onClick={() => logout()} className="flex-shrink-0 rounded p-1 text-muted-foreground hover:text-red-500 transition-colors" title="Log out">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <button onClick={() => setIsCollapsed((p) => !p)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </motion.aside>
  )
}

export default Sidebar
