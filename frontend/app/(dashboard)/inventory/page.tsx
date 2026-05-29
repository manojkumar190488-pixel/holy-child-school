'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Package, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INVENTORY } from '@/lib/mock-school-data'

export default function InventoryPage() {
  const lowStock = useMemo(() => INVENTORY.filter(i => i.quantity <= i.minStock), [])
  const totalValue = INVENTORY.reduce((acc, i) => acc + i.quantity * i.cost, 0)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Inventory</h2>
        <p className="text-sm text-muted-foreground">Assets & stock management</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{INVENTORY.length}</p>
          <p className="text-xs text-muted-foreground">Item Categories</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{lowStock.length}</p>
          <p className="text-xs text-muted-foreground">Low Stock Alerts</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">
            ₹{(totalValue / 100000).toFixed(1)}L
          </p>
          <p className="text-xs text-muted-foreground">Total Value</p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-50/30 dark:bg-amber-900/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">Low Stock Alerts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(item => (
              <span key={item.id} className="rounded-full border border-amber-500/30 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 text-xs font-semibold">
                {item.name} ({item.quantity} left)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="text-sm font-bold text-foreground">Asset Register</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Item', 'Category', 'Qty', 'Min Stock', 'Unit Cost', 'Total Value', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {INVENTORY.map((item, i) => (
                <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{item.category}</td>
                  <td className="px-4 py-2.5 font-semibold text-foreground">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{item.minStock}</td>
                  <td className="px-4 py-2.5 text-foreground">₹{item.cost.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-semibold text-foreground">₹{(item.quantity * item.cost).toLocaleString()}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold',
                      item.quantity <= item.minStock
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : item.quantity <= item.minStock * 2
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400')}>
                      {item.quantity <= item.minStock ? 'Low Stock' : item.quantity <= item.minStock * 2 ? 'Medium' : 'OK'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
