'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { TIMETABLE } from '@/lib/mock-school-data'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const PERIODS = [1, 2, 3, 4, 5, 6]
const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['A', 'B', 'C']

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Science: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  English: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  Hindi: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'Social Science': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Sanskrit: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  'Computer Science': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  'Physical Education': 'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300',
}

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState('10')
  const [selectedSection, setSelectedSection] = useState('A')

  const classData = TIMETABLE.filter(t => String(t.class) === selectedClass && t.section === selectedSection)

  const getCell = (day: string, period: number) =>
    classData.find(t => t.day === day && t.periodNo === period)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Timetable</h2>
        <p className="text-sm text-muted-foreground">Weekly class schedule</p>
      </div>

      <div className="flex flex-wrap gap-3">
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

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground w-28">Day</th>
                {PERIODS.map(p => (
                  <th key={p} className="px-3 py-3 text-center text-xs font-bold text-muted-foreground">Period {p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DAYS.map(day => (
                <tr key={day} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground text-xs">{day}</td>
                  {PERIODS.map(period => {
                    const cell = getCell(day, period)
                    return (
                      <td key={period} className="px-2 py-2 text-center">
                        {cell ? (
                          <div className={cn('rounded-lg px-2 py-1.5 text-xs', SUBJECT_COLORS[cell.subject] || 'bg-muted text-muted-foreground')}>
                            <p className="font-semibold leading-tight">{cell.subject}</p>
                            <p className="text-[10px] opacity-75 mt-0.5">{cell.teacher}</p>
                          </div>
                        ) : (
                          <div className="rounded-lg bg-muted/30 px-2 py-1.5 text-xs text-muted-foreground">—</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
