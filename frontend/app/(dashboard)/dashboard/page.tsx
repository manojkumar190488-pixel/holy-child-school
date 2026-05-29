'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, CalendarCheck, DollarSign, BookOpen, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, Bell, ArrowRight,
  Library, ClipboardList, AlertCircle, UserCheck,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { cn } from '@/lib/utils'
import { useRBAC } from '@/lib/rbac'
import {
  DASHBOARD_STATS, MONTHLY_ENROLLMENT, CLASS_DISTRIBUTION,
  SUBJECT_PERFORMANCE, MONTHLY_FEE_COLLECTION, ATTENDANCE_TREND,
  STUDENTS, CIRCULARS, HELPDESK_TICKETS, HOMEWORK,
  EXAM_SCHEDULES, LIBRARY_BOOKS, BOOK_ISSUES, FEE_PAYMENTS,
} from '@/lib/mock-school-data'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const PIE_COLORS = ['#1e3a5f', '#2d5a8e', '#4a7fb5', '#6b9fd4', '#8bbce8', '#a8d1f5', '#c5e4ff']

interface KPICardProps {
  label: string; value: string | number; sub?: string
  icon: React.ReactNode; color?: string; href?: string; index?: number
}
function KPICard({ label, value, sub, icon, color = '#f59e0b', href, index = 0 }: KPICardProps) {
  const inner = (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
      className="flex items-start justify-between rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-foreground">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
      <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: `${color}18` }}>
        <div style={{ color }}>{icon}</div>
      </div>
    </motion.div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

// ─── Principal / Admin Dashboard ───────────────────────────────────────────────
function PrincipalDashboard({ name }: { name: string }) {
  const lowAttendance = useMemo(() => STUDENTS.filter(s => s.attendance.percentage < 75), [])
  const recentCirculars = CIRCULARS.slice(0, 4)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground">{getGreeting()}, {name.split(' ')[0]}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Here's your school overview for today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Total Students" value={DASHBOARD_STATS.totalStudents.toLocaleString()} sub="Across all classes" icon={<Users className="h-5 w-5" />} color="#3b82f6" href="/students" index={0} />
        <KPICard label="Staff Members" value={DASHBOARD_STATS.totalStaff} sub="Teachers & admin" icon={<UserCheck className="h-5 w-5" />} color="#8b5cf6" href="/staff" index={1} />
        <KPICard label="Attendance Today" value={`${DASHBOARD_STATS.attendanceToday}%`} sub="School average" icon={<CalendarCheck className="h-5 w-5" />} color="#10b981" href="/attendance" index={2} />
        <KPICard label="Fee Collection" value={`₹${(DASHBOARD_STATS.feeCollectedMonth / 100000).toFixed(1)}L`} sub="This month" icon={<DollarSign className="h-5 w-5" />} color="#f59e0b" href="/fees" index={3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Monthly Enrollment Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Student count across the academic year</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_ENROLLMENT}>
              <defs><linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} domain={[1100, 1300]} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="students" stroke="#3b82f6" fill="url(#enrollGrad)" strokeWidth={2} name="Students" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Class Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Students by class group</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CLASS_DISTRIBUTION} dataKey="students" nameKey="class" cx="50%" cy="50%" outerRadius={60}>
                {CLASS_DISTRIBUTION.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {CLASS_DISTRIBUTION.slice(0, 4).map((c, i) => (
              <div key={c.class} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground">{c.class}</span>
                </span>
                <span className="font-semibold text-foreground">{c.students}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Monthly Fee Collection</h3>
          <p className="text-xs text-muted-foreground mb-4">Collected vs target (₹ in Lakhs)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MONTHLY_FEE_COLLECTION}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={v => `₹${v / 100000}L`} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${(v / 100000).toFixed(1)}L`]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#e5e7eb" name="Target" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Subject Performance</h3>
          <p className="text-xs text-muted-foreground mb-4">Average marks across school</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={SUBJECT_PERFORMANCE} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis type="category" dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} width={70} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="avgScore" name="Avg Score" radius={[0, 4, 4, 0]}>
                {SUBJECT_PERFORMANCE.map((entry, i) => (
                  <Cell key={i} fill={entry.avgScore >= 70 ? '#10b981' : entry.avgScore >= 55 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Attendance Alerts
            </h3>
            <Link href="/attendance/reports" className="text-xs text-gold-600 dark:text-gold-400 hover:underline">View all</Link>
          </div>
          {lowAttendance.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">No students below 75%.</p>
          ) : (
            <div className="divide-y divide-border">
              {lowAttendance.slice(0, 5).map(s => (
                <Link key={s.id} href={`/students/${s.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-muted transition-colors">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Class {s.class}-{s.section} · {s.admissionNo}</p>
                  </div>
                  <span className="text-sm font-bold text-red-500">{s.attendance.percentage}%</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-500" /> Recent Circulars
            </h3>
            <Link href="/circulars" className="text-xs text-gold-600 dark:text-gold-400 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {recentCirculars.map(c => (
              <div key={c.id} className="px-5 py-3">
                <p className="text-sm font-medium text-foreground line-clamp-1">{c.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Mark Attendance', href: '/attendance', icon: <CalendarCheck className="h-5 w-5" />, color: '#10b981' },
          { label: 'Collect Fee', href: '/fees/collect', icon: <DollarSign className="h-5 w-5" />, color: '#f59e0b' },
          { label: 'Add Student', href: '/students/new', icon: <Users className="h-5 w-5" />, color: '#3b82f6' },
          { label: 'Post Circular', href: '/circulars', icon: <Bell className="h-5 w-5" />, color: '#8b5cf6' },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:shadow-md transition-all hover:scale-105">
            <div className="rounded-xl p-2.5" style={{ background: `${a.color}18`, color: a.color }}>{a.icon}</div>
            <span className="text-xs font-semibold text-foreground">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Teacher Dashboard ─────────────────────────────────────────────────────────
function TeacherDashboard({ name }: { name: string }) {
  const myHomework = HOMEWORK.slice(0, 4)
  const upcomingExams = EXAM_SCHEDULES.slice(0, 4)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground">{getGreeting()}, {name.split(' ')[0]}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Today's teaching overview</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="My Classes" value={4} sub="Sections assigned" icon={<BookOpen className="h-5 w-5" />} color="#3b82f6" index={0} />
        <KPICard label="Homework Assigned" value={myHomework.length} sub="This week" icon={<ClipboardList className="h-5 w-5" />} color="#f59e0b" href="/homework" index={1} />
        <KPICard label="Upcoming Exams" value={upcomingExams.length} sub="This term" icon={<BookOpen className="h-5 w-5" />} color="#8b5cf6" href="/examinations" index={2} />
        <KPICard label="Avg Class Attend." value="87%" sub="This week" icon={<CalendarCheck className="h-5 w-5" />} color="#10b981" href="/attendance" index={3} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h3 className="text-sm font-bold text-foreground">Homework</h3>
            <Link href="/homework" className="text-xs text-gold-600 dark:text-gold-400 hover:underline">Manage</Link>
          </div>
          <div className="divide-y divide-border">
            {myHomework.map(h => (
              <div key={h.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{h.title}</p>
                  <p className="text-xs text-muted-foreground">Class {h.class}-{h.section} · {h.subject} · Due {h.dueDate}</p>
                </div>
                <span className="text-xs text-muted-foreground">{h.submissions}/{h.total} submitted</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h3 className="text-sm font-bold text-foreground">Upcoming Exams</h3>
            <Link href="/examinations" className="text-xs text-gold-600 dark:text-gold-400 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingExams.map(e => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{e.subject}</p>
                  <p className="text-xs text-muted-foreground">Class {e.class} · {e.term} · {e.date}</p>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{e.startTime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Student Dashboard ─────────────────────────────────────────────────────────
function StudentDashboard({ name }: { name: string }) {
  const student = STUDENTS[0]
  const myHomework = HOMEWORK.filter(h => h.class === student.class).slice(0, 4)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground">{getGreeting()}, {name.split(' ')[0]}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Class {student.class}-{student.section} · {student.admissionNo}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Attendance" value={`${student.attendance.percentage}%`} sub="This term" icon={<CalendarCheck className="h-5 w-5" />} color={student.attendance.percentage >= 75 ? '#10b981' : '#ef4444'} href="/attendance" index={0} />
        <KPICard label="Fee Status" value={student.fees.status} sub={student.fees.status === 'Paid' ? 'All clear' : 'Pending'} icon={<DollarSign className="h-5 w-5" />} color={student.fees.status === 'Paid' ? '#10b981' : '#ef4444'} href="/fees" index={1} />
        <KPICard label="Homework" value={myHomework.length} sub="Assignments" icon={<ClipboardList className="h-5 w-5" />} color="#f59e0b" href="/homework" index={2} />
        <KPICard label="Exams This Term" value={EXAM_SCHEDULES.filter(e => e.class === student.class).length} sub="Scheduled" icon={<BookOpen className="h-5 w-5" />} color="#8b5cf6" href="/examinations" index={3} />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">Attendance Trend</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={ATTENDANCE_TREND}>
            <defs><linearGradient id="attnGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="percentage" stroke="#10b981" fill="url(#attnGrad)" strokeWidth={2} name="Attendance %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Parent Dashboard ──────────────────────────────────────────────────────────
function ParentDashboard({ name }: { name: string }) {
  const child = STUDENTS[0]
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground">{getGreeting()}, {name.split(' ')[0]}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Monitoring: {child.name}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Attendance" value={`${child.attendance.percentage}%`} sub="This term" icon={<CalendarCheck className="h-5 w-5" />} color="#10b981" index={0} />
        <KPICard label="Fee Status" value={child.fees.status} sub="Current year" icon={<DollarSign className="h-5 w-5" />} color={child.fees.status === 'Paid' ? '#10b981' : '#ef4444'} href="/fees" index={1} />
        <KPICard label="Class" value={`${child.class}-${child.section}`} sub="Section" icon={<BookOpen className="h-5 w-5" />} color="#3b82f6" index={2} />
        <KPICard label="Circulars" value={CIRCULARS.length} sub="This year" icon={<Bell className="h-5 w-5" />} color="#8b5cf6" href="/circulars" index={3} />
      </div>
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="text-sm font-bold text-foreground">Recent Circulars</h3>
        </div>
        <div className="divide-y divide-border">
          {CIRCULARS.slice(0, 4).map(c => (
            <div key={c.id} className="px-5 py-3.5">
              <p className="text-sm font-semibold text-foreground">{c.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Accountant Dashboard ──────────────────────────────────────────────────────
function AccountantDashboard({ name }: { name: string }) {
  const totalCollected = FEE_PAYMENTS.reduce((acc, p) => acc + p.amount, 0)
  const pending = STUDENTS.filter(s => s.fees.status === 'Due' || s.fees.status === 'Partial').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground">{getGreeting()}, {name.split(' ')[0]}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Finance overview</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Total Collected" value={`₹${(totalCollected / 100000).toFixed(1)}L`} sub="All records" icon={<DollarSign className="h-5 w-5" />} color="#10b981" href="/fees" index={0} />
        <KPICard label="This Month" value={`₹${(DASHBOARD_STATS.feeCollectedMonth / 100000).toFixed(1)}L`} sub="Collected" icon={<TrendingUp className="h-5 w-5" />} color="#3b82f6" href="/fees" index={1} />
        <KPICard label="Pending Students" value={pending} sub="Fee due" icon={<AlertCircle className="h-5 w-5" />} color="#ef4444" href="/fees" index={2} />
        <KPICard label="Receipts Issued" value={FEE_PAYMENTS.length} sub="This year" icon={<CheckCircle2 className="h-5 w-5" />} color="#8b5cf6" index={3} />
      </div>
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h3 className="text-sm font-bold text-foreground">Recent Payments</h3>
          <Link href="/fees" className="text-xs text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <div className="divide-y divide-border">
          {FEE_PAYMENTS.slice(0, 6).map(p => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{p.studentName}</p>
                <p className="text-xs text-muted-foreground">{p.receiptNo} · {p.paymentDate}</p>
              </div>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{p.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Librarian Dashboard ───────────────────────────────────────────────────────
function LibrarianDashboard({ name }: { name: string }) {
  const issuedCount = BOOK_ISSUES.length
  const overdue = BOOK_ISSUES.filter(i => new Date(i.dueDate) < new Date()).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground">{getGreeting()}, {name.split(' ')[0]}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Library overview</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Total Books" value={LIBRARY_BOOKS.length} sub="In catalog" icon={<Library className="h-5 w-5" />} color="#3b82f6" href="/library" index={0} />
        <KPICard label="Issued" value={issuedCount} sub="Books out" icon={<BookOpen className="h-5 w-5" />} color="#f59e0b" href="/library" index={1} />
        <KPICard label="Overdue" value={overdue} sub="Not returned" icon={<AlertTriangle className="h-5 w-5" />} color="#ef4444" href="/library" index={2} />
        <KPICard label="Available" value={LIBRARY_BOOKS.filter(b => b.available > 0).length} sub="For issue" icon={<CheckCircle2 className="h-5 w-5" />} color="#10b981" href="/library" index={3} />
      </div>
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h3 className="text-sm font-bold text-foreground">Currently Issued</h3>
          <Link href="/library" className="text-xs text-gold-600 dark:text-gold-400 hover:underline">Manage</Link>
        </div>
        <div className="divide-y divide-border">
          {BOOK_ISSUES.slice(0, 6).map(issue => {
            const book = LIBRARY_BOOKS.find(b => b.id === issue.bookId)
            const isOverdue = new Date(issue.dueDate) < new Date()
            return (
              <div key={issue.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{book?.title || issue.bookTitle}</p>
                  <p className="text-xs text-muted-foreground">{issue.studentName} · Due {issue.dueDate}</p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400')}>
                  {isOverdue ? 'Overdue' : 'On time'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Generic Dashboard ─────────────────────────────────────────────────────────
function GenericDashboard({ name, role }: { name: string; role: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground">{getGreeting()}, {name.split(' ')[0]}</h2>
        <p className="text-sm text-muted-foreground mt-0.5 capitalize">{role.replace('_', ' ')} Portal</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Total Students" value={DASHBOARD_STATS.totalStudents} icon={<Users className="h-5 w-5" />} color="#3b82f6" href="/students" index={0} />
        <KPICard label="Staff Members" value={DASHBOARD_STATS.totalStaff} icon={<UserCheck className="h-5 w-5" />} color="#8b5cf6" href="/staff" index={1} />
        <KPICard label="Attendance Today" value={`${DASHBOARD_STATS.attendanceToday}%`} icon={<CalendarCheck className="h-5 w-5" />} color="#10b981" href="/attendance" index={2} />
        <KPICard label="Circulars" value={CIRCULARS.length} icon={<Bell className="h-5 w-5" />} color="#f59e0b" href="/circulars" index={3} />
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, mounted } = useRBAC()

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-muted" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 h-64 rounded-xl bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  const name = user?.name || 'User'
  const role = user?.role || 'school_admin'

  if (role === 'principal' || role === 'vice_principal' || role === 'school_admin' || role === 'super_admin') {
    return <PrincipalDashboard name={name} />
  }
  if (role === 'teacher') return <TeacherDashboard name={name} />
  if (role === 'student') return <StudentDashboard name={name} />
  if (role === 'parent') return <ParentDashboard name={name} />
  if (role === 'accountant') return <AccountantDashboard name={name} />
  if (role === 'librarian') return <LibrarianDashboard name={name} />
  return <GenericDashboard name={name} role={role} />
}
