'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Users, CalendarCheck, DollarSign, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const items: MobileNavItem[] = [
  { href: '/dashboard',    label: 'Home',      icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/students',     label: 'Students',  icon: <Users className="h-5 w-5" /> },
  { href: '/attendance',   label: 'Attendance',icon: <CalendarCheck className="h-5 w-5" /> },
  { href: '/fees',         label: 'Fees',      icon: <DollarSign className="h-5 w-5" /> },
  { href: '/examinations', label: 'Exams',     icon: <BookOpen className="h-5 w-5" /> },
]

export function MobileNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    const path = pathname.replace('/holy-child-school', '')
    if (href === '/dashboard') return path === '/dashboard' || path === '/'
    return path.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div
        className="border-t border-border bg-card/95 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
      >
        <div className="flex items-stretch">
          {items.map(item => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-1 flex-col items-center gap-0.5 px-1 pt-2.5 pb-2 transition-colors',
                  active ? 'text-gold-500' : 'text-muted-foreground'
                )}
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="school-mobile-nav-pill"
                      className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gold-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  animate={{ scale: active ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {item.icon}
                </motion.div>
                <span className="text-[10px] font-semibold leading-none">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default MobileNav
