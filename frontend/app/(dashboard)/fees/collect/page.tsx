'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer, CheckCircle2 } from 'lucide-react'
import { STUDENTS, FEE_STRUCTURES } from '@/lib/mock-school-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const FEE_HEADS = ['Tuition Fee', 'Transport Fee', 'Library Fee', 'Lab Fee', 'Sports Fee', 'Exam Fee', 'Miscellaneous']
const PAYMENT_MODES = ['Cash', 'Online Transfer', 'Cheque', 'DD', 'UPI']

function getReceiptNumber() {
  return `RCP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
}

export default function FeeCollectPage() {
  const [studentId, setStudentId] = useState('')
  const [feeHead, setFeeHead] = useState(FEE_HEADS[0])
  const [amount, setAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0])
  const [transactionRef, setTransactionRef] = useState('')
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState<{ receiptNumber: string; studentName: string; amount: string; date: string; feeHead: string; paymentMode: string } | null>(null)

  const student = useMemo(() => STUDENTS.find(s => s.id === studentId), [studentId])

  const feeStructure = useMemo(() => {
    if (!student) return null
    return FEE_STRUCTURES.find(f => f.classes.includes(student.class)) || FEE_STRUCTURES[0]
  }, [student])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !amount) {
      toast.error('Please select a student and enter the amount.')
      return
    }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))
    const rec = {
      receiptNumber: getReceiptNumber(),
      studentName: student?.name || '',
      amount,
      date: new Date().toLocaleDateString('en-IN'),
      feeHead,
      paymentMode,
    }
    setReceipt(rec)
    setSubmitting(false)
    toast.success('Fee collected successfully!', { description: `Receipt ${rec.receiptNumber} generated` })
  }

  if (receipt) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border-2 border-emerald-500 bg-card p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Payment Received!</h2>
          <p className="text-sm text-muted-foreground mb-6">Receipt generated successfully</p>

          <div className="text-left border border-border rounded-xl p-5 space-y-3 bg-muted/20">
            <div className="text-center border-b border-border pb-3 mb-2">
              <p className="font-extrabold text-foreground text-lg">Holy Child School</p>
              <p className="text-xs text-muted-foreground">Fee Receipt</p>
            </div>
            {[
              ['Receipt No.', receipt.receiptNumber],
              ['Date', receipt.date],
              ['Student', receipt.studentName],
              ['Fee Head', receipt.feeHead],
              ['Payment Mode', receipt.paymentMode],
              ['Amount', `₹${Number(receipt.amount).toLocaleString()}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-semibold text-foreground">{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button onClick={() => setReceipt(null)} className="flex-1 rounded-xl bg-gold-500 py-2.5 text-sm font-bold text-navy-900 hover:bg-gold-400 transition-colors">
              Collect Another
            </button>
          </div>
        </motion.div>
        <div className="text-center">
          <Link href="/fees" className="text-sm text-gold-600 dark:text-gold-400 hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Fees
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/fees" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Collect Fee</h2>
          <p className="text-sm text-muted-foreground">Record a fee payment and generate receipt</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-5">
        {/* Student Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Select Student <span className="text-red-500">*</span></label>
          <select value={studentId} onChange={e => setStudentId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20">
            <option value="">-- Search and select student --</option>
            {STUDENTS.map(s => (
              <option key={s.id} value={s.id}>{s.name} · Class {s.class}-{s.section} · {s.admissionNo}</option>
            ))}
          </select>
        </div>

        {/* Student Info */}
        {student && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl border border-gold-500/30 bg-gold-50/30 dark:bg-gold-900/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground">Class {student.class}-{student.section} · {student.admissionNo}</p>
                <p className="text-xs text-muted-foreground">Parent: {student.fatherName} · {student.fatherPhone}</p>
              </div>
              <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', student.fees.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : student.fees.status === 'Due' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>
                {student.fees.status}
              </span>
            </div>
            {feeStructure && (
              <div className="mt-2 pt-2 border-t border-gold-500/20">
                <p className="text-xs text-muted-foreground">Fee Structure: <span className="font-semibold text-foreground">{feeStructure.tier} — ₹{feeStructure.total.toLocaleString()}/yr</span></p>
              </div>
            )}
          </motion.div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Fee Head <span className="text-red-500">*</span></label>
            <select value={feeHead} onChange={e => setFeeHead(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20">
              {FEE_HEADS.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Amount (₹) <span className="text-red-500">*</span></label>
            <input type="number" min="1" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Payment Mode</label>
            <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20">
              {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Transaction Ref. / Cheque No.</label>
            <input placeholder="Optional" value={transactionRef} onChange={e => setTransactionRef(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Remarks</label>
          <textarea rows={2} placeholder="Optional remarks" value={remarks} onChange={e => setRemarks(e.target.value)}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/fees" className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={submitting || !studentId || !amount}
            className="flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-bold text-navy-900 hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-900 border-t-transparent" /> : null}
            {submitting ? 'Processing…' : 'Collect & Generate Receipt'}
          </button>
        </div>
      </form>
    </div>
  )
}
