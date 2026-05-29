'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, Mail, MapPin, Calendar, BookOpen, DollarSign, CalendarCheck, FileText, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STUDENTS, EXAM_RESULTS, ATTENDANCE_RECORDS, FEE_PAYMENTS } from '@/lib/mock-school-data'

type Tab = 'profile' | 'academic' | 'attendance' | 'fees' | 'health'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: 'Profile', icon: <FileText className="h-4 w-4" /> },
  { key: 'academic', label: 'Academic', icon: <BookOpen className="h-4 w-4" /> },
  { key: 'attendance', label: 'Attendance', icon: <CalendarCheck className="h-4 w-4" /> },
  { key: 'fees', label: 'Fees', icon: <DollarSign className="h-4 w-4" /> },
  { key: 'health', label: 'Health', icon: <Heart className="h-4 w-4" /> },
]

export default function StudentProfileClient({ id }: { id: string }) {
  const [tab, setTab] = useState<Tab>('profile')

  const student = STUDENTS.find(s => s.id === id)

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-lg font-semibold text-foreground">Student not found</p>
        <Link href="/students" className="text-sm text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Link>
      </div>
    )
  }

  const myResults = EXAM_RESULTS.filter(r => r.studentId === id)
  const myAttendance = ATTENDANCE_RECORDS.filter(r => r.studentId === id).slice(0, 30)
  const myFees = FEE_PAYMENTS.filter(f => f.studentId === id)
  const feeTotal = myFees.reduce((acc, f) => acc + f.amount, 0)

  return (
    <div className="space-y-5">
      <Link href="/students" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="h-20 w-20 flex-shrink-0 rounded-2xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-2xl font-extrabold">
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-foreground">{student.name}</h2>
                <p className="text-sm text-muted-foreground">{student.admissionNo} · Class {student.class}-{student.section}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', student.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                  {student.status}
                </span>
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', student.fees.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>
                  Fee: {student.fees.status}
                </span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5 flex-shrink-0" />{student.fatherPhone}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5 flex-shrink-0" />{student.email || 'N/A'}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5 flex-shrink-0" />DOB: {student.dob}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5 flex-shrink-0" />{student.address?.slice(0, 30)}…</div>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
          <div className="text-center">
            <p className={cn('text-2xl font-extrabold', student.attendance.percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
              {student.attendance.percentage}%
            </p>
            <p className="text-xs text-muted-foreground">Attendance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-foreground">{myResults.length}</p>
            <p className="text-xs text-muted-foreground">Exam Records</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-foreground">₹{(feeTotal / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">Fees Paid</p>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-1 overflow-x-auto border-b border-border pb-0 scrollbar-none">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px', tab === t.key ? 'border-gold-500 text-gold-600 dark:text-gold-400' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === 'profile' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-bold text-foreground">Personal Information</h3>
              {[
                ['Full Name', student.name],
                ['Gender', student.gender],
                ['Date of Birth', student.dob],
                ['Blood Group', student.bloodGroup],
                ['Religion', student.religion],
                ['Category', student.category],
                ['Aadhaar', student.aadhar],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="text-sm font-medium text-foreground">{v}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-bold text-foreground">Parent / Guardian</h3>
              {[
                ['Father', student.fatherName],
                ['Contact', student.fatherPhone],
                ['Email', student.fatherEmail || 'N/A'],
                ['Occupation', student.fatherOccupation],
                ['Mother', student.motherName],
                ['Mother Contact', student.motherPhone],
                ['Admission Date', student.admissionDate],
                ['Bus Route', student.busRoute || 'None'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="text-sm font-medium text-foreground text-right max-w-[55%]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'academic' && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {myResults.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No exam results found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Subject', 'Term', 'Max', 'Obtained', 'Grade'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myResults.map(r => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-foreground">{r.subject}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{r.term}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{r.maxMarks}</td>
                      <td className="px-4 py-2.5 font-semibold text-foreground">{r.obtainedMarks}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', r.grade.startsWith('A') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : r.grade.startsWith('B') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : r.grade.startsWith('C') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                          {r.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'attendance' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Attendance Overview</h3>
              <div className="flex items-center gap-6 mb-2">
                <div className="text-center">
                  <p className={cn('text-3xl font-extrabold', student.attendance.percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                    {student.attendance.percentage}%
                  </p>
                  <p className="text-xs text-muted-foreground">Overall ({student.attendance.present}/{student.attendance.total} days)</p>
                </div>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full rounded-full', student.attendance.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500')} style={{ width: `${student.attendance.percentage}%` }} />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-5 py-3.5">
                <h3 className="text-sm font-bold text-foreground">Recent Records</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Date', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myAttendance.slice(0, 15).map((r, i) => (
                    <tr key={i} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-2.5 text-foreground">{r.date}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', r.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : r.status === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : r.status === 'Late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400')}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'fees' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-xl font-extrabold text-foreground">₹{student.fees.totalFee.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Fee</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{student.fees.paidAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className={cn('text-xl font-extrabold', student.fees.dueAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400')}>
                  ₹{student.fees.dueAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Due</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border px-5 py-3.5">
                <h3 className="text-sm font-bold text-foreground">Payment History</h3>
              </div>
              {myFees.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-muted-foreground">No payment records found.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {['Receipt No.', 'Date', 'Amount', 'Mode'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {myFees.map(f => (
                      <tr key={f.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-xs text-foreground">{f.receiptNo}</td>
                        <td className="px-4 py-2.5 text-foreground">{f.paymentDate}</td>
                        <td className="px-4 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">₹{f.amount.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{f.paymentMode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === 'health' && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-bold text-foreground mb-4">Health Information</h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                ['Blood Group', student.bloodGroup],
                ['Emergency Contact', student.fatherPhone],
                ['Religion', student.religion],
                ['Category', student.category],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border pb-2">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="text-sm font-medium text-foreground">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Detailed health records (allergies, vaccinations, medical conditions) would be maintained by the school nurse. Contact administration for health records.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
