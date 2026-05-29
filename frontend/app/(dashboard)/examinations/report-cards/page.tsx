'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { STUDENTS, EXAM_RESULTS, SCHOOL_INFO } from '@/lib/mock-school-data'
import { cn } from '@/lib/utils'

export default function ReportCardsPage() {
  const [studentId, setStudentId] = useState(STUDENTS[0]?.id || '')

  const student = useMemo(() => STUDENTS.find(s => s.id === studentId), [studentId])
  const results = useMemo(() => EXAM_RESULTS.filter(r => r.studentId === studentId && r.term === 'Term 1'), [studentId])

  const totalObtained = results.reduce((acc, r) => acc + r.obtainedMarks, 0)
  const totalMax = results.reduce((acc, r) => acc + r.maxMarks, 0)
  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0'
  const passed = results.length > 0 && results.every(r => (r.obtainedMarks / r.maxMarks) * 100 >= 33)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/examinations" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted transition-colors"><ArrowLeft className="h-4 w-4" /></Link>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Report Cards</h2>
            <p className="text-sm text-muted-foreground">Printable report card</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      <div className="flex flex-col gap-1.5 max-w-xs">
        <label className="text-xs font-semibold text-muted-foreground">Select Student</label>
        <select value={studentId} onChange={e => setStudentId(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold-500">
          {STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name} — Class {s.class}-{s.section}</option>)}
        </select>
      </div>

      {student && (
        <div className="max-w-2xl mx-auto rounded-xl border-2 border-navy-900 dark:border-navy-600 bg-card overflow-hidden">
          <div className="bg-navy-900 dark:bg-navy-800 text-white px-8 py-6 text-center">
            <p className="text-xl font-extrabold">{SCHOOL_INFO.name}</p>
            <p className="text-sm text-navy-300">{SCHOOL_INFO.affiliation}</p>
            <p className="text-xs text-navy-400">{SCHOOL_INFO.address}</p>
            <p className="mt-2 text-gold-400 font-bold text-sm">REPORT CARD — {SCHOOL_INFO.academicYear}</p>
          </div>

          <div className="px-8 py-5 border-b border-border bg-muted/20">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {[
                ["Student Name", student.name],
                ["Admission No.", student.admissionNo],
                ["Class & Section", `${student.class}-${student.section}`],
                ["Roll No.", String(student.rollNo)],
                ["Father's Name", student.fatherName],
                ["Academic Year", SCHOOL_INFO.academicYear],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-muted-foreground min-w-[120px]">{k}:</span>
                  <span className="font-semibold text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-8 py-5">
            <h3 className="font-bold text-foreground mb-3">Academic Performance (Term 1)</h3>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No Term 1 results found.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-navy-900 dark:bg-navy-800 text-white">
                    {['Subject', 'Max Marks', 'Obtained', '%', 'Grade'].map(h => (
                      <th key={h} className="border border-navy-700 px-3 py-2 text-left text-xs font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => {
                    const pct = ((r.obtainedMarks / r.maxMarks) * 100).toFixed(0)
                    return (
                      <tr key={r.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                        <td className="border border-border px-3 py-2">{r.subject}</td>
                        <td className="border border-border px-3 py-2 text-center">{r.maxMarks}</td>
                        <td className="border border-border px-3 py-2 text-center font-semibold">{r.obtainedMarks}</td>
                        <td className="border border-border px-3 py-2 text-center">{pct}%</td>
                        <td className="border border-border px-3 py-2 text-center font-bold">{r.grade}</td>
                      </tr>
                    )
                  })}
                  <tr className="font-bold bg-navy-50 dark:bg-navy-900/20">
                    <td className="border border-border px-3 py-2">TOTAL</td>
                    <td className="border border-border px-3 py-2 text-center">{totalMax}</td>
                    <td className="border border-border px-3 py-2 text-center">{totalObtained}</td>
                    <td className="border border-border px-3 py-2 text-center">{percentage}%</td>
                    <td className={cn('border border-border px-3 py-2 text-center text-xs', passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                      {passed ? 'PROMOTED' : 'DETAINED'}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <div className="border-t border-border px-8 py-4 flex justify-between items-center text-xs text-muted-foreground">
            <div>
              <div className="h-10 border-b border-muted-foreground/30 w-32 mb-1" />
              <p>Class Teacher</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">{passed ? '🎉 Congratulations!' : 'Keep Trying!'}</p>
              <p>Attendance: {student.attendance.percentage}%</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-muted-foreground/30 w-32 mb-1 ml-auto" />
              <p>Principal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
