'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STAFF } from '@/lib/mock-school-data'

const DEPARTMENTS = ['All', 'Academic', 'Administration', 'Support']
const DESIGNATIONS = ['All', 'Teacher', 'Principal', 'Vice Principal', 'Accountant', 'Librarian', 'Transport Manager', 'Admin Staff']

export default function StaffPage() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')

  const filtered = useMemo(() =>
    STAFF.filter(s => {
      const q = search.toLowerCase()
      return (dept === 'All' || s.department === dept) &&
        (!q || s.name.toLowerCase().includes(q) || s.empId.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q))
    }), [search, dept])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Staff & HR</h2>
        <p className="text-sm text-muted-foreground">{filtered.length} staff members</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{STAFF.length}</p>
          <p className="text-xs text-muted-foreground">Total Staff</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{STAFF.filter(s => s.designation === 'Teacher').length}</p>
          <p className="text-xs text-muted-foreground">Teachers</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{STAFF.filter(s => s.status === 'Active').length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search by name, ID, designation…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20" />
        </div>
        <select value={dept} onChange={e => setDept(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold-500">
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((staff, i) => (
          <motion.div key={staff.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-border bg-card p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-sm font-bold">
              {staff.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-foreground leading-tight truncate">{staff.name}</p>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold flex-shrink-0', staff.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>
                  {staff.status}
                </span>
              </div>
              <p className="text-xs text-gold-600 dark:text-gold-400 font-semibold mt-0.5">{staff.designation}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{staff.empId} · {staff.department}</p>
              {staff.subjects && staff.subjects.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">Subjects: {staff.subjects.slice(0, 2).join(', ')}{staff.subjects.length > 2 ? '…' : ''}</p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{staff.phone}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
