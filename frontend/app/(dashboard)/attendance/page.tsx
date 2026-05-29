'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Clock, FileText, Save, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STUDENTS, SCHOOL_INFO } from '@/lib/mock-school-data'
import { toast } from 'sonner'
import Link from 'next/link'

type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave'

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present: { label: 'P', color: 'bg-emerald-500 text-white', icon: <Check className="h-3 w-3" /> },
  absent: { label: 'A', color: 'bg-red-500 text-white', icon: <X className="h-3 w-3" /> },
  late: { label: 'L', color: 'bg-amber-500 text-white', icon: <Clock className="h-3 w-3" /> },
  leave: { label: 'LE', color: 'bg-blue-500 text-white', icon: <FileText className="h-3 w-3" /> },
}

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['A', 'B', 'C']

export default function AttendancePage() {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedClass, setSelectedClass] = useState('10')
  const [selectedSection, setSelectedSection] = useState('A')
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [saving, setSaving] = useState(false)

  const classStudents = useMemo(() =>
    STUDENTS.filter(s => String(s.class) === selectedClass && s.section === selectedSection),
    [selectedClass, selectedSection]
  )

  const getStatus = (id: string): AttendanceStatus => attendance[id] || 'present'

  const cycleStatus = (id: string) => {
    const cycle: AttendanceStatus[] = ['present', 'absent', 'late', 'leave']
    const current = getStatus(id)
    const nextIndex = (cycle.indexOf(current) + 1) % cycle.length
    setAttendance(prev => ({ ...prev, [id]: cycle[nextIndex] }))
  }

  const markAll = (status: AttendanceStatus) => {
    const newMap: Record<string, AttendanceStatus> = {}
    classStudents.forEach(s => { newMap[s.id] = status })
    setAttendance(prev => ({ ...prev, ...newMap }))
  }

  const stats = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, leave: 0 }
    classStudents.forEach(s => { counts[getStatus(s.id)]++ })
    return counts
  }, [attendance, classStudents])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    toast.success('Attendance saved!', {
      description: `Class ${selectedClass}-${selectedSection} · ${selectedDate} · ${stats.present} Present, ${stats.absent} Absent`,
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Mark Attendance</h2>
          <p className="text-sm text-muted-foreground">{SCHOOL_INFO.academicYear} · {SCHOOL_INFO.currentTerm}</p>
        </div>
        <Link href="/attendance/reports" className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
          <FileText className="h-4 w-4" /> View Reports
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold-500">
            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Section</label>
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold-500">
            {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, typeof STATUS_CONFIG[AttendanceStatus]][]).map(([status, cfg]) => (
          <div key={status} className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-extrabold text-foreground">{stats[status]}</p>
            <p className="text-xs text-muted-foreground capitalize">{status}</p>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-muted-foreground">Mark all:</span>
        {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, typeof STATUS_CONFIG[AttendanceStatus]][]).map(([status, cfg]) => (
          <button key={status} onClick={() => markAll(status)}
            className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80', cfg.color)}>
            {cfg.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Attendance Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3.5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Class {selectedClass}-{selectedSection} · {classStudents.length} Students</h3>
          <p className="text-xs text-muted-foreground">Click a student's status to cycle: P → A → L → LE</p>
        </div>
        <div className="divide-y divide-border">
          {classStudents.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-muted-foreground">No students found for this class and section.</p>
          ) : classStudents.map((student, i) => {
            const status = getStatus(student.id)
            const cfg = STATUS_CONFIG[status]
            return (
              <motion.div key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-muted-foreground w-6">{i + 1}</span>
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-xs font-bold">
                    {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.admissionNo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:block text-xs text-muted-foreground">Overall: {student.attendance.percentage}%</span>
                  <button onClick={() => cycleStatus(student.id)}
                    className={cn('flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-all hover:scale-110 active:scale-95', cfg.color)}
                    title={`Click to change status (current: ${status})`}>
                    {cfg.label}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving || classStudents.length === 0}
          className="flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-navy-900 hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-900 border-t-transparent" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save Attendance'}
        </button>
      </div>
    </div>
  )
}
