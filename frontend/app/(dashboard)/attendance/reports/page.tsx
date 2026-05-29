'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { STUDENTS, ATTENDANCE_TREND } from '@/lib/mock-school-data'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AttendanceReportsPage() {
  const lowAttendance = useMemo(() =>
    STUDENTS.filter(s => s.attendance.percentage < 75)
      .sort((a, b) => a.attendance.percentage - b.attendance.percentage),
    []
  )

  const avgAttendance = useMemo(() => {
    const sum = STUDENTS.reduce((acc, s) => acc + s.attendance.percentage, 0)
    return (sum / STUDENTS.length).toFixed(1)
  }, [])

  const classStats = useMemo(() => {
    const map: Record<string, { total: number; sum: number }> = {}
    STUDENTS.forEach(s => {
      const key = `Class ${s.class}`
      if (!map[key]) map[key] = { total: 0, sum: 0 }
      map[key].total++
      map[key].sum += s.attendance.percentage
    })
    return Object.entries(map).map(([cls, data]) => ({ class: cls, avg: parseFloat((data.sum / data.total).toFixed(1)) }))
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/attendance" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Attendance Reports</h2>
          <p className="text-sm text-muted-foreground">Analytics and chronic absentee tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{avgAttendance}%</p>
          <p className="text-xs text-muted-foreground">School Average</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{lowAttendance.length}</p>
          <p className="text-xs text-muted-foreground">Below 75%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {STUDENTS.filter(s => s.attendance.percentage >= 90).length}
          </p>
          <p className="text-xs text-muted-foreground">Above 90%</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Weekly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ATTENDANCE_TREND}>
              <defs>
                <linearGradient id="attnGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="percentage" stroke="#10b981" fill="url(#attnGrad2)" strokeWidth={2} name="Attendance %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Class-wise Average Attendance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={classStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="class" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="avg" name="Avg %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold text-foreground">Chronic Absentees (Below 75%)</h3>
        </div>
        {lowAttendance.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-muted-foreground">No students below 75% attendance.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Student', 'Class', 'Parent Contact', 'Attendance %', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lowAttendance.map(s => (
                <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.class}-{s.section}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.fatherPhone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-red-500" style={{ width: `${s.attendance.percentage}%` }} />
                      </div>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">{s.attendance.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/students/${s.id}`} className="text-xs text-gold-600 dark:text-gold-400 hover:underline">View Profile</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
