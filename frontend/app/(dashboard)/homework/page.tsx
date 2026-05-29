'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Check, Clock, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HOMEWORK } from '@/lib/mock-school-data'
import { toast } from 'sonner'

const SUBJECTS = ['All', 'Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Computer Science']

export default function HomeworkPage() {
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [submitted, setSubmitted] = useState<Set<string>>(new Set())

  const filtered = useMemo(() =>
    HOMEWORK.filter(h => subjectFilter === 'All' || h.subject === subjectFilter),
    [subjectFilter]
  )

  const markDone = (id: string) => {
    setSubmitted(prev => new Set([...prev, id]))
    toast.success('Homework marked as complete!')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Homework & Assignments</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} assignments</p>
        </div>
        <button onClick={() => toast.info('Create homework form coming soon!')}
          className="flex items-center gap-2 rounded-lg bg-gold-500 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-gold-400 transition-colors">
          <Plus className="h-4 w-4" /> Assign Homework
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {SUBJECTS.map(s => (
          <button key={s} onClick={() => setSubjectFilter(s)}
            className={cn('rounded-full px-3 py-1.5 text-xs font-semibold transition-colors', subjectFilter === s ? 'bg-gold-500 text-navy-900' : 'border border-border bg-card text-muted-foreground hover:bg-muted')}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((hw, i) => {
          const isDone = submitted.has(hw.id)
          return (
            <motion.div key={hw.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={cn('rounded-xl border bg-card p-4 space-y-3 transition-all', isDone ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-900/5' : 'border-border hover:shadow-md')}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gold-500 flex-shrink-0" />
                  <p className="font-bold text-foreground leading-tight">{hw.title}</p>
                </div>
                {isDone && <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{hw.description}</p>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="inline-block rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 text-[10px] font-bold">{hw.subject}</span>
                  <p className="text-xs text-muted-foreground">Class {hw.class}-{hw.section}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Due {hw.dueDate}</span>
                  </div>
                </div>
              </div>
              {!isDone && (
                <button onClick={() => markDone(hw.id)}
                  className="w-full rounded-lg border border-emerald-500/30 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                  Mark Complete
                </button>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
