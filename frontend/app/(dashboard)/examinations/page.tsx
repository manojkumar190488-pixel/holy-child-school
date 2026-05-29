'use client'

import Link from 'next/link'
import { BookOpen, BarChart3, FileText } from 'lucide-react'
import { EXAM_SCHEDULES } from '@/lib/mock-school-data'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const TYPE_COLORS: Record<string, string> = {
  'Unit Test': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Mid Term': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Final': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Pre Board': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function ExaminationsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Examinations</h2>
          <p className="text-sm text-muted-foreground">Schedules, results & report cards</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/examinations/results" className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            <BarChart3 className="h-4 w-4" /> Results
          </Link>
          <Link href="/examinations/report-cards" className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            <FileText className="h-4 w-4" /> Report Cards
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{EXAM_SCHEDULES.length}</p>
          <p className="text-xs text-muted-foreground">Scheduled Exams</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{[...new Set(EXAM_SCHEDULES.map(e => e.term))].length}</p>
          <p className="text-xs text-muted-foreground">Terms</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{[...new Set(EXAM_SCHEDULES.map(e => e.subject))].length}</p>
          <p className="text-xs text-muted-foreground">Subjects</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="text-sm font-bold text-foreground">Exam Schedule</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Date', 'Subject', 'Class', 'Term', 'Time', 'Max Marks', 'Room'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {EXAM_SCHEDULES.map((exam, i) => (
                <motion.tr key={exam.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-2.5 text-foreground">{exam.date}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{exam.subject}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{exam.class}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', TYPE_COLORS[exam.term] || 'bg-muted text-muted-foreground')}>
                      {exam.term}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{exam.startTime} – {exam.endTime}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{exam.maxMarks}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{exam.roomNo}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
