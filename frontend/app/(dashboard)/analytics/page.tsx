'use client'

import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { MONTHLY_ENROLLMENT, CLASS_DISTRIBUTION, SUBJECT_PERFORMANCE, MONTHLY_FEE_COLLECTION, ATTENDANCE_TREND, DASHBOARD_STATS } from '@/lib/mock-school-data'

const PIE_COLORS = ['#1e3a5f', '#2d5a8e', '#4a7fb5', '#6b9fd4', '#8bbce8', '#a8d1f5', '#c5e4ff']

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">School performance insights & trends</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Students', value: DASHBOARD_STATS.totalStudents, icon: <Users className="h-5 w-5" />, color: '#3b82f6' },
          { label: 'Staff', value: DASHBOARD_STATS.totalStaff, icon: <Users className="h-5 w-5" />, color: '#8b5cf6' },
          { label: 'Attendance', value: `${DASHBOARD_STATS.attendanceToday}%`, icon: <TrendingUp className="h-5 w-5" />, color: '#10b981' },
          { label: 'Fee Collection', value: `₹${(DASHBOARD_STATS.feeCollectedMonth / 100000).toFixed(1)}L`, icon: <DollarSign className="h-5 w-5" />, color: '#f59e0b' },
        ].map((card, i) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{card.label}</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{card.value}</p>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: `${card.color}18`, color: card.color }}>{card.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Monthly Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_ENROLLMENT}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="students" stroke="#3b82f6" fill="url(#ag1)" strokeWidth={2} name="Students" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Attendance Trend (Weekly)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ATTENDANCE_TREND}>
              <defs>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="percentage" stroke="#10b981" fill="url(#ag2)" strokeWidth={2} name="Attendance %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Fee Collection vs Target</h3>
          <ResponsiveContainer width="100%" height={200}>
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
          <h3 className="text-sm font-bold text-foreground mb-4">Subject Performance (Avg %)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SUBJECT_PERFORMANCE} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis type="category" dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} width={70} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="avgScore" name="Avg Score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">Class Distribution</h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={CLASS_DISTRIBUTION} dataKey="students" nameKey="class" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {CLASS_DISTRIBUTION.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
