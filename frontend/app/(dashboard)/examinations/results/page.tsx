'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EXAM_RESULTS, STUDENTS, SUBJECT_PERFORMANCE } from '@/lib/mock-school-data'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const TERMS = ['All', 'Term 1', 'Term 2', 'Annual']

export default function ExamResultsPage() {
  const [term, setTerm] = useState('All')
  const [classFilter, setClassFilter] = useState('All')

  const classes = ['All', ...Array.from(new Set(EXAM_RESULTS.map(r => r.class))).sort((a, b) => Number(a) - Number(b))]

  const filtered = useMemo(() =>
    EXAM_RESULTS.filter(r =>
      (term === 'All' || r.term === term) &&
      (classFilter === 'All' || r.class === classFilter)
    ), [term, classFilter])

  const avgScore = filtered.length
    ? (filtered.reduce((acc, r) => acc + (r.obtainedMarks / r.maxMarks) * 100, 0) / filtered.length).toFixed(1)
    : '0'

  const passCount = filtered.filter(r => {
    const pct = (r.obtainedMarks / r.maxMarks) * 100
    return pct >= 33
  }).length

  const passRate = filtered.length ? ((passCount / filtered.length) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/examinations" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted transition-colors"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Exam Results</h2>
          <p className="text-sm text-muted-foreground">Marks and grade analysis</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={term} onChange={e => setTerm(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold-500">
          {TERMS.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold-500">
          {classes.map(c => <option key={c}>{c === 'All' ? 'All Classes' : `Class ${c}`}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{filtered.length}</p>
          <p className="text-xs text-muted-foreground">Results</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{passRate}%</p>
          <p className="text-xs text-muted-foreground">Pass Rate</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{avgScore}%</p>
          <p className="text-xs text-muted-foreground">Avg Score</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">Subject-wise Performance</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={SUBJECT_PERFORMANCE} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis type="category" dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} width={70} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="avgScore" name="Avg Score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="text-sm font-bold text-foreground">Results Table ({Math.min(filtered.length, 50)} shown)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Student', 'Class', 'Subject', 'Term', 'Marks', 'Grade', 'Result'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice(0, 50).map(r => {
                const passed = (r.obtainedMarks / r.maxMarks) * 100 >= 33
                return (
                  <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{r.studentName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.class}-{r.section}</td>
                    <td className="px-4 py-2.5 text-foreground">{r.subject}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.term}</td>
                    <td className="px-4 py-2.5 text-foreground">{r.obtainedMarks}/{r.maxMarks}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', r.grade.startsWith('A') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : r.grade.startsWith('B') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : r.grade.startsWith('C') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                        {passed ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
