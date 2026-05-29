'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ChevronDown, AlertTriangle, TrendingDown, DollarSign, BookOpen, Users, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  STUDENTS, EXAM_RESULTS, FEE_PAYMENTS, BOOK_ISSUES, DASHBOARD_STATS,
} from '@/lib/mock-school-data'

interface Insight {
  id: string
  type: 'warning' | 'info' | 'success' | 'alert'
  icon: React.ReactNode
  title: string
  detail: string
  href?: string
  linkLabel?: string
}

function useInsights(): Insight[] {
  return useMemo(() => {
    const insights: Insight[] = []

    // Attendance alerts
    const lowAttendance = STUDENTS.filter(s => s.attendance.percentage < 75)
    if (lowAttendance.length > 0) {
      const names = lowAttendance.slice(0, 3).map(s => s.name.split(' ')[0]).join(', ')
      insights.push({
        id: 'low-attendance',
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: `${lowAttendance.length} student${lowAttendance.length > 1 ? 's' : ''} below 75% attendance`,
        detail: `${names}${lowAttendance.length > 3 ? ` and ${lowAttendance.length - 3} more` : ''} need immediate attention.`,
        href: '/attendance/reports',
        linkLabel: 'View Report',
      })
    }

    // Subject performance
    const subjectAvgs: Record<string, { total: number; count: number }> = {}
    EXAM_RESULTS.forEach(r => {
      if (!subjectAvgs[r.subject]) subjectAvgs[r.subject] = { total: 0, count: 0 }
      subjectAvgs[r.subject].total += (r.obtainedMarks / r.maxMarks) * 100
      subjectAvgs[r.subject].count++
    })
    const avgAll = Object.values(subjectAvgs).reduce((acc, v) => acc + v.total / v.count, 0) / Math.max(Object.keys(subjectAvgs).length, 1)
    const weakSubjects = Object.entries(subjectAvgs)
      .map(([subj, v]) => ({ subj, avg: v.total / v.count }))
      .filter(s => s.avg < avgAll - 5)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 2)
    if (weakSubjects.length > 0) {
      const [first] = weakSubjects
      insights.push({
        id: 'weak-subject',
        type: 'alert',
        icon: <TrendingDown className="h-4 w-4" />,
        title: `${first.subj} is ${(avgAll - first.avg).toFixed(0)}% below school average`,
        detail: `Average score: ${first.avg.toFixed(1)}% vs school average ${avgAll.toFixed(1)}%. Consider remedial sessions.`,
        href: '/examinations/results',
        linkLabel: 'View Results',
      })
    }

    // Fee collection
    const totalDue = STUDENTS.reduce((acc, s) => acc + (s.fees.status !== 'Paid' ? s.fees.dueAmount : 0), 0)
    const collectionPct = Math.round((DASHBOARD_STATS.feeCollectedMonth / (DASHBOARD_STATS.feeCollectedMonth + totalDue)) * 100)
    if (totalDue > 0) {
      insights.push({
        id: 'fee-outstanding',
        type: 'info',
        icon: <DollarSign className="h-4 w-4" />,
        title: `Fee collection at ${collectionPct}% — ₹${(totalDue / 100000).toFixed(1)}L outstanding`,
        detail: `${STUDENTS.filter(s => s.fees.status === 'Due' || s.fees.status === 'Overdue').length} students have pending dues. Follow-up recommended.`,
        href: '/fees',
        linkLabel: 'View Fees',
      })
    }

    // Overdue library books
    const overdueBooks = BOOK_ISSUES.filter(i => i.status === 'Overdue')
    if (overdueBooks.length > 0) {
      insights.push({
        id: 'overdue-books',
        type: 'warning',
        icon: <BookOpen className="h-4 w-4" />,
        title: `${overdueBooks.length} library book${overdueBooks.length > 1 ? 's' : ''} overdue for return`,
        detail: `Students: ${overdueBooks.slice(0, 3).map(b => b.studentName.split(' ')[0]).join(', ')}${overdueBooks.length > 3 ? ` +${overdueBooks.length - 3} more` : ''}. Fine may be accumulating.`,
        href: '/library',
        linkLabel: 'View Library',
      })
    }

    // New admissions positive insight
    if (DASHBOARD_STATS.newAdmissions > 0) {
      insights.push({
        id: 'new-admissions',
        type: 'success',
        icon: <Users className="h-4 w-4" />,
        title: `${DASHBOARD_STATS.newAdmissions} new admissions this month`,
        detail: `Total enrollment stands at ${DASHBOARD_STATS.totalStudents} students. Admission momentum is strong.`,
        href: '/students',
        linkLabel: 'View Students',
      })
    }

    // Open helpdesk tickets
    if (DASHBOARD_STATS.openTickets > 0) {
      insights.push({
        id: 'open-tickets',
        type: 'info',
        icon: <CheckCircle className="h-4 w-4" />,
        title: `${DASHBOARD_STATS.openTickets} help desk ticket${DASHBOARD_STATS.openTickets > 1 ? 's' : ''} awaiting resolution`,
        detail: 'Pending support requests may affect staff and student satisfaction.',
        href: '/helpdesk',
        linkLabel: 'View Tickets',
      })
    }

    return insights
  }, [])
}

const TYPE_STYLES: Record<Insight['type'], { border: string; bg: string; icon: string; badge: string }> = {
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-50/40 dark:bg-amber-900/10',
    icon: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  alert: {
    border: 'border-red-500/30',
    bg: 'bg-red-50/40 dark:bg-red-900/10',
    icon: 'text-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  info: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-50/40 dark:bg-blue-900/10',
    icon: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  success: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-50/40 dark:bg-emerald-900/10',
    icon: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
}

export function SchoolInsights() {
  const [open, setOpen] = useState(true)
  const insights = useInsights()

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-500/10">
            <Brain className="h-4 w-4 text-gold-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground">AI Insights</p>
            <p className="text-xs text-muted-foreground">{insights.length} action items detected</p>
          </div>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border border-t border-border">
              {insights.map((insight, i) => {
                const styles = TYPE_STYLES[insight.type]
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn('px-5 py-3.5 flex items-start gap-3', styles.bg)}
                  >
                    <span className={cn('flex-shrink-0 mt-0.5', styles.icon)}>{insight.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.detail}</p>
                    </div>
                    {insight.href && insight.linkLabel && (
                      <Link href={insight.href}
                        className={cn('flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition-opacity hover:opacity-80', styles.badge)}>
                        {insight.linkLabel}
                      </Link>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
