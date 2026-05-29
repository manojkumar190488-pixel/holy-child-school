'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2, Plus, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STUDENTS, FEE_PAYMENTS, MONTHLY_FEE_COLLECTION, DASHBOARD_STATS } from '@/lib/mock-school-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function FeesPage() {
  const pendingStudents = useMemo(() => STUDENTS.filter(s => s.fees.status === 'Due' || s.fees.status === 'Partial'), [])
  const paidStudents = useMemo(() => STUDENTS.filter(s => s.fees.status === 'Paid'), [])
  const totalCollected = useMemo(() => FEE_PAYMENTS.reduce((acc, p) => acc + p.amount, 0), [])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Fee Management</h2>
          <p className="text-sm text-muted-foreground">Collections, dues & receipts</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/fees/structure" className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Settings className="h-4 w-4" /> Fee Structure
          </Link>
          <Link href="/fees/reports" className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            <BarChart3 className="h-4 w-4" /> Reports
          </Link>
          <Link href="/fees/collect" className="flex items-center gap-2 rounded-lg bg-gold-500 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-gold-400 transition-colors">
            <Plus className="h-4 w-4" /> Collect Fee
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'This Month', value: `₹${(DASHBOARD_STATS.feeCollectedMonth / 100000).toFixed(1)}L`, sub: 'Collected', icon: <DollarSign className="h-5 w-5" />, color: '#10b981' },
          { label: 'Total Collected', value: `₹${(totalCollected / 100000).toFixed(1)}L`, sub: 'All records', icon: <TrendingUp className="h-5 w-5" />, color: '#3b82f6' },
          { label: 'Paid', value: paidStudents.length, sub: 'Students', icon: <CheckCircle2 className="h-5 w-5" />, color: '#10b981' },
          { label: 'Pending/Overdue', value: pendingStudents.length, sub: 'Need follow-up', icon: <AlertCircle className="h-5 w-5" />, color: '#ef4444' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="flex items-start justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{card.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.sub}</p>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: `${card.color}18`, color: card.color }}>{card.icon}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground mb-1">Monthly Collection vs Target</h3>
        <p className="text-xs text-muted-foreground mb-4">(₹ in Lakhs)</p>
        <ResponsiveContainer width="100%" height={220}>
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

      {/* Pending Students */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" /> Pending / Overdue
            </h3>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">{pendingStudents.length}</span>
          </div>
          <div className="divide-y divide-border max-h-72 overflow-y-auto">
            {pendingStudents.slice(0, 10).map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <Link href={`/students/${s.id}`} className="text-sm font-medium text-foreground hover:text-gold-600 dark:hover:text-gold-400 transition-colors">{s.name}</Link>
                  <p className="text-xs text-muted-foreground">Class {s.class}-{s.section} · {s.fatherPhone}</p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold capitalize', s.fees.status === 'Due' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>
                  {s.fees.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h3 className="text-sm font-bold text-foreground">Recent Payments</h3>
            <Link href="/fees/reports" className="text-xs text-gold-600 dark:text-gold-400 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border max-h-72 overflow-y-auto">
            {FEE_PAYMENTS.slice(0, 8).map(p => (
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
    </div>
  )
}
