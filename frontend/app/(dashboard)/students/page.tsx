'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Plus, UserCheck, UserX, Clock, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STUDENTS } from '@/lib/mock-school-data'

const CLASSES = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['All', 'A', 'B', 'C']
const STATUS_OPTIONS = ['All', 'Active', 'Inactive']

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [sectionFilter, setSectionFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15

  const filtered = useMemo(() => {
    return STUDENTS.filter(s => {
      const q = search.toLowerCase()
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q) || s.fatherName.toLowerCase().includes(q)
      const matchClass = classFilter === 'All' || s.class === classFilter
      const matchSection = sectionFilter === 'All' || s.section === sectionFilter
      const matchStatus = statusFilter === 'All' || s.status === statusFilter
      return matchSearch && matchClass && matchSection && matchStatus
    })
  }, [search, classFilter, sectionFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleExport = () => {
    const headers = ['Admission No', 'Name', 'Class', 'Section', 'Gender', 'Parent', 'Phone', 'Attendance%', 'Fee Status', 'Status']
    const rows = filtered.map(s => [s.admissionNo, s.name, s.class, s.section, s.gender, s.fatherName, s.fatherPhone, s.attendance.percentage, s.fees.status, s.status])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Students</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} students found</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <Link href="/students/new" className="flex items-center gap-2 rounded-lg bg-gold-500 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-gold-400 transition-colors">
            <Plus className="h-4 w-4" /> Add Student
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search by name, admission number, or parent…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20" />
        </div>
        <button onClick={() => setShowFilters(p => !p)}
          className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors', showFilters ? 'border-gold-500 bg-gold-50 text-gold-700 dark:bg-gold-900/10 dark:text-gold-400' : 'border-border bg-card text-muted-foreground hover:bg-muted')}>
          <Filter className="h-4 w-4" /> Filters
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showFilters && 'rotate-180')} />
        </button>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
          {[
            { label: 'Class', value: classFilter, options: CLASSES, onChange: (v: string) => { setClassFilter(v); setPage(1) } },
            { label: 'Section', value: sectionFilter, options: SECTIONS, onChange: (v: string) => { setSectionFilter(v); setPage(1) } },
            { label: 'Status', value: statusFilter, options: STATUS_OPTIONS, onChange: (v: string) => { setStatusFilter(v); setPage(1) } },
          ].map(field => (
            <div key={field.label} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">{field.label}</label>
              <select value={field.value} onChange={e => field.onChange(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold-500">
                {field.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div className="flex items-end">
            <button onClick={() => { setClassFilter('All'); setSectionFilter('All'); setStatusFilter('All'); setSearch(''); setPage(1) }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">Clear</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active', value: STUDENTS.filter(s => s.status === 'Active').length, icon: <UserCheck className="h-4 w-4" />, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Inactive', value: STUDENTS.filter(s => s.status === 'Inactive').length, icon: <UserX className="h-4 w-4" />, color: 'text-red-600 dark:text-red-400' },
          { label: 'Low Attendance', value: STUDENTS.filter(s => s.attendance.percentage < 75).length, icon: <Clock className="h-4 w-4" />, color: 'text-amber-600 dark:text-amber-400' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3">
            <div className={cn(stat.color)}>{stat.icon}</div>
            <div>
              <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Student</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Class</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Parent</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Attendance</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Fee</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((student, i) => (
                <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/students/${student.id}`} className="flex items-center gap-3 group">
                      <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-xs font-bold">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.admissionNo}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{student.class}-{student.section}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-foreground">{student.fatherName}</p>
                    <p className="text-xs text-muted-foreground">{student.fatherPhone}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div className={cn('h-full rounded-full', student.attendance.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500')} style={{ width: `${student.attendance.percentage}%` }} />
                      </div>
                      <span className={cn('text-xs font-semibold', student.attendance.percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                        {student.attendance.percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', student.fees.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : student.fees.status === 'Partial' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                      {student.fees.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', student.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                      {student.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={cn('h-7 w-7 rounded text-xs font-medium transition-colors', page === i + 1 ? 'bg-gold-500 text-navy-900 font-bold' : 'text-muted-foreground hover:bg-muted')}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
