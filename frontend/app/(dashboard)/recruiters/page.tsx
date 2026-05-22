'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Download,
  Search,
  ExternalLink,
  Linkedin,
  Mail,
  Star,
  Users,
  Briefcase,
  ChevronUp,
  ChevronDown,
  X,
  Filter,
} from 'lucide-react'
import { cn, formatRelativeDate, getInitials, stringToColor, downloadAsFile } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import type { Recruiter } from '@/types'

const MOCK_RECRUITERS: Recruiter[] = [
  {
    id: 'r1',
    name: 'Sarah Mitchell',
    title: 'Senior Recruiter, Strategy Practice',
    company: 'McKinsey & Company',
    email: 'sarah.mitchell@mckinsey.com',
    linkedinUrl: 'https://linkedin.com/in/sarah-mitchell',
    location: 'New York, NY',
    jobsPosted: 12,
    lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    firstSeen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    interactionScore: 8.5,
    notes: 'Very responsive. Has posted 3 senior strategy roles this month.',
    tags: ['MBB', 'strategy', 'responsive'],
    isManuallyAdded: false,
    jobs: [],
  },
  {
    id: 'r2',
    name: 'James Thornton',
    title: 'Talent Acquisition Partner',
    company: 'Boston Consulting Group',
    linkedinUrl: 'https://linkedin.com/in/james-thornton',
    location: 'Chicago, IL',
    jobsPosted: 8,
    lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    firstSeen: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    interactionScore: 7.2,
    tags: ['MBB', 'consulting'],
    isManuallyAdded: false,
    jobs: [],
  },
  {
    id: 'r3',
    name: 'Priya Sharma',
    title: 'Principal Recruiter',
    company: 'Bain & Company',
    email: 'p.sharma@bain.com',
    linkedinUrl: 'https://linkedin.com/in/priya-sharma-bain',
    location: 'San Francisco, CA',
    jobsPosted: 15,
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    firstSeen: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    interactionScore: 9.1,
    notes: 'Very active. Posted 5 director-level roles this week.',
    tags: ['MBB', 'director-level', 'active'],
    isManuallyAdded: false,
    jobs: [],
  },
  {
    id: 'r4',
    name: 'Michael Chen',
    title: 'Executive Search Consultant',
    company: 'Korn Ferry',
    email: 'mchen@kornferry.com',
    linkedinUrl: 'https://linkedin.com/in/michael-chen-kf',
    location: 'New York, NY',
    jobsPosted: 6,
    lastActive: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    firstSeen: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    interactionScore: 6.8,
    tags: ['executive-search', 'headhunter'],
    isManuallyAdded: true,
    jobs: [],
  },
  {
    id: 'r5',
    name: 'Emma Watson',
    title: 'Talent Manager, Consulting',
    company: 'Deloitte',
    linkedinUrl: 'https://linkedin.com/in/emma-watson-deloitte',
    location: 'London, UK',
    jobsPosted: 22,
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    firstSeen: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    interactionScore: 7.9,
    tags: ['Big4', 'consulting', 'UK'],
    isManuallyAdded: false,
    jobs: [],
  },
]

type SortKey = 'name' | 'company' | 'jobsPosted' | 'interactionScore' | 'lastActive'

export default function RecruitersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('interactionScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRecruiter, setNewRecruiter] = useState({
    name: '', company: '', email: '', linkedinUrl: '', notes: '',
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = MOCK_RECRUITERS
    .filter((r) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        r.name.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const aVal = a[sortKey as keyof Recruiter]
      const bVal = b[sortKey as keyof Recruiter]
      const dir = sortDir === 'asc' ? 1 : -1
      if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir
      return String(aVal || '').localeCompare(String(bVal || '')) * dir
    })

  const handleExport = () => {
    const headers = ['Name', 'Company', 'Title', 'Email', 'LinkedIn', 'Jobs Posted', 'Score', 'Last Active']
    const rows = MOCK_RECRUITERS.map((r) => [
      r.name, r.company, r.title || '', r.email || '',
      r.linkedinUrl || '', r.jobsPosted, r.interactionScore,
      r.lastActive ? formatRelativeDate(r.lastActive) : '',
    ])
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    downloadAsFile(csv, 'recruiters.csv', 'text/csv')
    toast.success('Exported to CSV')
  }

  const handleAddRecruiter = () => {
    if (!newRecruiter.name || !newRecruiter.company) {
      toast.error('Name and company are required')
      return
    }
    toast.success(`Recruiter ${newRecruiter.name} added`)
    setShowAddForm(false)
    setNewRecruiter({ name: '', company: '', email: '', linkedinUrl: '', notes: '' })
  }

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === 'asc' ? (
        <ChevronUp className="h-3.5 w-3.5" />
      ) : (
        <ChevronDown className="h-3.5 w-3.5" />
      )
    ) : (
      <ChevronDown className="h-3.5 w-3.5 opacity-30" />
    )

  return (
    <div className="animate-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">
            Recruiter Directory
          </h2>
          <p className="text-sm text-muted-foreground">
            {MOCK_RECRUITERS.length} recruiters discovered · {MOCK_RECRUITERS.filter(r => r.isManuallyAdded).length} manually added
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddForm((p) => !p)}
          >
            Add Recruiter
          </Button>
        </div>
      </div>

      {/* Add Recruiter Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border border-gold-500/30 bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Add Manual Recruiter</h3>
            <button onClick={() => setShowAddForm(false)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                value={newRecruiter.name}
                onChange={(e) => setNewRecruiter((p) => ({ ...p, name: e.target.value }))}
                className="input"
                placeholder="Sarah Mitchell"
              />
            </div>
            <div>
              <label className="label">Company *</label>
              <input
                type="text"
                value={newRecruiter.company}
                onChange={(e) => setNewRecruiter((p) => ({ ...p, company: e.target.value }))}
                className="input"
                placeholder="McKinsey & Company"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={newRecruiter.email}
                onChange={(e) => setNewRecruiter((p) => ({ ...p, email: e.target.value }))}
                className="input"
                placeholder="sarah@mckinsey.com"
              />
            </div>
            <div>
              <label className="label">LinkedIn URL</label>
              <input
                type="url"
                value={newRecruiter.linkedinUrl}
                onChange={(e) => setNewRecruiter((p) => ({ ...p, linkedinUrl: e.target.value }))}
                className="input"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Notes</label>
              <input
                type="text"
                value={newRecruiter.notes}
                onChange={(e) => setNewRecruiter((p) => ({ ...p, notes: e.target.value }))}
                className="input"
                placeholder="Add notes about this recruiter..."
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" size="sm" onClick={handleAddRecruiter}>
              Add Recruiter
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Search + Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, or email..."
            className="input pl-9"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Recruiters', value: MOCK_RECRUITERS.length, icon: <Users className="h-4 w-4" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Active This Week', value: 3, icon: <Star className="h-4 w-4" />, color: 'text-gold-600 dark:text-gold-400', bg: 'bg-gold-100 dark:bg-gold-900/30' },
          { label: 'Jobs Posted', value: MOCK_RECRUITERS.reduce((s, r) => s + r.jobsPosted, 0), icon: <Briefcase className="h-4 w-4" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', stat.bg, stat.color)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {[
                  { key: 'name', label: 'Recruiter' },
                  { key: 'company', label: 'Company' },
                  { key: 'jobsPosted', label: 'Jobs' },
                  { key: 'lastActive', label: 'Last Active' },
                  { key: 'interactionScore', label: 'Score' },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key as SortKey)}
                    className="cursor-pointer whitespace-nowrap px-5 py-3 text-left text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon col={col.key as SortKey} />
                    </div>
                  </th>
                ))}
                <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      icon={<Users className="h-7 w-7" />}
                      title="No recruiters found"
                      subtitle="Try adjusting your search terms."
                      size="sm"
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((recruiter, i) => {
                  const initials = getInitials(recruiter.name)
                  const bgColor = stringToColor(recruiter.name)
                  return (
                    <motion.tr
                      key={recruiter.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      {/* Recruiter */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: bgColor }}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{recruiter.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {recruiter.title}
                            </p>
                          </div>
                          {recruiter.isManuallyAdded && (
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              Manual
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-foreground">{recruiter.company}</p>
                        {recruiter.location && (
                          <p className="text-xs text-muted-foreground">{recruiter.location}</p>
                        )}
                      </td>

                      {/* Jobs */}
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-foreground">{recruiter.jobsPosted}</span>
                      </td>

                      {/* Last Active */}
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {recruiter.lastActive ? formatRelativeDate(recruiter.lastActive) : '—'}
                      </td>

                      {/* Score */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gold-500"
                              style={{ width: `${recruiter.interactionScore * 10}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-foreground">
                            {recruiter.interactionScore.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {recruiter.email && (
                            <a
                              href={`mailto:${recruiter.email}`}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              title={recruiter.email}
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                          {recruiter.linkedinUrl && (
                            <a
                              href={recruiter.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] dark:hover:text-blue-400 transition-colors"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
