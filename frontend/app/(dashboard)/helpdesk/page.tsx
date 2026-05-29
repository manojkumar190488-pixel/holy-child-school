'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Ticket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HELPDESK_TICKETS } from '@/lib/mock-school-data'
import { toast } from 'sonner'

const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Closed']
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical']

const STATUS_COLORS: Record<string, string> = {
  'Open': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Resolved': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Closed': 'bg-muted text-muted-foreground',
}

const PRIORITY_COLORS: Record<string, string> = {
  'Low': 'bg-muted text-muted-foreground',
  'Medium': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'High': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Critical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function HelpdeskPage() {
  const [status, setStatus] = useState('All')
  const [priority, setPriority] = useState('All')

  const filtered = useMemo(() =>
    HELPDESK_TICKETS.filter(t =>
      (status === 'All' || t.status === status) &&
      (priority === 'All' || t.priority === priority)
    ), [status, priority])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Help Desk</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} tickets</p>
        </div>
        <button onClick={() => toast.info('Raise ticket form coming soon!')}
          className="flex items-center gap-2 rounded-lg bg-gold-500 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-gold-400 transition-colors">
          <Plus className="h-4 w-4" /> Raise Ticket
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
          <div key={s} className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-xl font-extrabold text-foreground">{HELPDESK_TICKETS.filter(t => t.status === s).length}</p>
            <p className="text-xs text-muted-foreground">{s}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold-500">
          {STATUSES.map(s => <option key={s}>{s === 'All' ? 'All Status' : s}</option>)}
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold-500">
          {PRIORITIES.map(p => <option key={p}>{p === 'All' ? 'All Priorities' : p}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((ticket, i) => (
          <motion.div key={ticket.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <Ticket className="h-4 w-4 text-gold-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{ticket.title}</p>
                    <span className="font-mono text-xs text-muted-foreground">#{ticket.ticketNo}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ticket.description.slice(0, 100)}…</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', STATUS_COLORS[ticket.status])}>
                      {ticket.status}
                    </span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', PRIORITY_COLORS[ticket.priority])}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">{ticket.category}</span>
                    <span className="text-xs text-muted-foreground">· {ticket.raisedBy}</span>
                    <span className="text-xs text-muted-foreground">· {ticket.createdAt}</span>
                  </div>
                </div>
              </div>
              {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                <button onClick={() => toast.success(`Ticket #${ticket.ticketNo} resolved!`)}
                  className="flex-shrink-0 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                  Resolve
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
