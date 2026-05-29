'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, AlertTriangle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LIBRARY_BOOKS, BOOK_ISSUES } from '@/lib/mock-school-data'
import { toast } from 'sonner'

const CATEGORIES = ['All', 'Fiction', 'Science', 'Mathematics', 'History', 'Literature', 'Reference', 'Comics', 'Biography']

export default function LibraryPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [activeTab, setActiveTab] = useState<'catalog' | 'issued'>('catalog')

  const filteredBooks = useMemo(() =>
    LIBRARY_BOOKS.filter(b => {
      const q = search.toLowerCase()
      return (category === 'All' || b.category === category) &&
        (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.accessionNo.toLowerCase().includes(q))
    }), [search, category])

  const issuedBooks = useMemo(() => BOOK_ISSUES.filter(i => i.status === 'Issued'), [])
  const overdueBooks = useMemo(() => BOOK_ISSUES.filter(i => i.status === 'Overdue'), [])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Library</h2>
        <p className="text-sm text-muted-foreground">{LIBRARY_BOOKS.length} books · {issuedBooks.length} issued · {overdueBooks.length} overdue</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{LIBRARY_BOOKS.length}</p>
          <p className="text-xs text-muted-foreground">Total Books</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{issuedBooks.length}</p>
          <p className="text-xs text-muted-foreground">Currently Issued</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{overdueBooks.length}</p>
          <p className="text-xs text-muted-foreground">Overdue</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-0">
        {(['catalog', 'issued'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2.5 text-sm font-semibold capitalize border-b-2 -mb-px transition-all', activeTab === tab ? 'border-gold-500 text-gold-600 dark:text-gold-400' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {tab === 'catalog' ? 'Book Catalog' : 'Issued Books'}
          </button>
        ))}
      </div>

      {activeTab === 'catalog' && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Search by title, author, accession number…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold-500">
              {CATEGORIES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Accession No.', 'Title', 'Author', 'Category', 'Available', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBooks.slice(0, 30).map((book, i) => (
                    <motion.tr key={book.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                      className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{book.accessionNo}</td>
                      <td className="px-4 py-2.5 font-medium text-foreground">{book.title}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{book.author}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{book.category}</td>
                      <td className="px-4 py-2.5 text-foreground">{book.available}/{book.copies}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', book.available > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                          {book.available > 0 ? 'Available' : 'All Issued'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'issued' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Book', 'Student', 'Issue Date', 'Due Date', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...issuedBooks, ...overdueBooks].map(issue => {
                  const isOverdue = issue.status === 'Overdue'
                  return (
                    <tr key={issue.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-foreground">{issue.bookTitle}</td>
                      <td className="px-4 py-2.5 text-foreground">{issue.studentName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{issue.issueDate}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{issue.dueDate}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 w-fit',
                          isOverdue
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400')}>
                          {isOverdue ? <AlertTriangle className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                          {isOverdue ? 'Overdue' : 'On time'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => toast.success(`${issue.bookTitle} returned successfully!`)}
                          className="text-xs text-gold-600 dark:text-gold-400 hover:underline">Return</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
