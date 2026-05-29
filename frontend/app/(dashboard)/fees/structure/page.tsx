'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FEE_STRUCTURES } from '@/lib/mock-school-data'

export default function FeeStructurePage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/fees" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted transition-colors"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Fee Structure</h2>
          <p className="text-sm text-muted-foreground">Fee heads for each class tier</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {FEE_STRUCTURES.map(fs => (
          <div key={fs.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-muted/40 px-5 py-3.5">
              <h3 className="font-bold text-foreground">{fs.tier}</h3>
              <p className="text-xs text-muted-foreground">Classes: {fs.classes.join(', ')}</p>
            </div>
            <div className="divide-y divide-border">
              {[
                { head: 'Tuition Fee', amount: fs.tuition },
                { head: 'Transport Fee', amount: fs.transport },
                { head: 'Library Fee', amount: fs.library },
                { head: 'Lab Fee', amount: fs.lab },
                { head: 'Sports Fee', amount: fs.sports },
                { head: 'Miscellaneous', amount: fs.misc },
              ].filter(c => c.amount > 0).map(component => (
                <div key={component.head} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-foreground">{component.head}</span>
                  <span className="font-semibold text-foreground">₹{component.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border bg-gold-50/40 dark:bg-gold-900/10 px-5 py-3 flex justify-between">
              <span className="font-bold text-foreground">Monthly Total</span>
              <span className="font-extrabold text-gold-600 dark:text-gold-400">₹{fs.total.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
