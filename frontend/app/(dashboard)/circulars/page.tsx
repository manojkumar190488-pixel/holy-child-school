'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Bell, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CIRCULARS } from '@/lib/mock-school-data'
import { toast } from 'sonner'

export default function CircularsPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showImportant, setShowImportant] = useState(false)

  const filtered = showImportant ? CIRCULARS.filter(c => c.isImportant) : CIRCULARS

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Circulars & Notices</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} circulars</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImportant(p => !p)}
            className={cn('rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
              showImportant ? 'border-red-500/50 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'border-border bg-card text-muted-foreground hover:bg-muted')}>
            Important Only
          </button>
          <button onClick={() => toast.info('Circular editor coming soon!')}
            className="flex items-center gap-2 rounded-lg bg-gold-500 px-3 py-2 text-sm font-bold text-navy-900 hover:bg-gold-400 transition-colors">
            <Plus className="h-4 w-4" /> Post Circular
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-xl border border-border bg-card overflow-hidden">
            <button onClick={() => setExpanded(prev => prev === c.id ? null : c.id)}
              className="w-full flex items-start justify-between px-5 py-4 text-left hover:bg-muted/40 transition-colors">
              <div className="flex items-start gap-3 min-w-0">
                <Bell className="h-4 w-4 text-gold-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground leading-tight">{c.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{c.date}</span>
                    {c.isImportant && (
                      <span className="rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 text-[10px] font-bold">
                        Important
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {expanded === c.id
                ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            </button>
            {expanded === c.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-border px-5 py-4">
                <p className="text-sm text-foreground leading-relaxed">{c.content}</p>
                {c.targetRoles && c.targetRoles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-xs text-muted-foreground">For:</span>
                    {c.targetRoles.map(r => (
                      <span key={r} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
                        {r.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">— {c.publishedBy}</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
