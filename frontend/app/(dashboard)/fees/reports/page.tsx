'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FEE_PAYMENTS, MONTHLY_FEE_COLLECTION } from '@/lib/mock-school-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function FeeReportsPage() {
  const total = FEE_PAYMENTS.reduce((acc, p) => acc + p.amount, 0)
  const cashPayments = FEE_PAYMENTS.filter(p => p.paymentMode === 'Cash')
  const onlinePayments = FEE_PAYMENTS.filter(p => p.paymentMode !== 'Cash')

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/fees" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted transition-colors"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Fee Reports</h2>
          <p className="text-sm text-muted-foreground">Revenue analysis and collection history</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xl font-extrabold text-foreground">₹{(total / 100000).toFixed(1)}L</p>
          <p className="text-xs text-muted-foreground">Total Collected</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xl font-extrabold text-foreground">{cashPayments.length}</p>
          <p className="text-xs text-muted-foreground">Cash Transactions</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-xl font-extrabold text-foreground">{onlinePayments.length}</p>
          <p className="text-xs text-muted-foreground">Online Transactions</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">Monthly Collection vs Target</h3>
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

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="text-sm font-bold text-foreground">All Transactions ({FEE_PAYMENTS.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Receipt No.', 'Student', 'Class', 'Amount', 'Mode', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {FEE_PAYMENTS.map(p => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground">{p.receiptNo}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{p.studentName}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.class}-{p.section}</td>
                  <td className="px-4 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">₹{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.paymentMode}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.paymentDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
