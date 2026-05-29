'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Eye,
  EyeOff,
  Plus,
  Search,
  Globe,
  Star,
  Briefcase,
  ArrowUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type FilterTab = 'All' | 'Consulting' | 'Multilateral/UN' | 'Government' | 'Technology' | 'Health'

interface Company {
  name: string
  type: string
  tab: FilterTab
  roles: number
  match: number
  watching: boolean
  description: string
  initials: string
  color: string
  trend?: string
}

const COMPANIES: Company[] = [
  {
    name: 'World Bank Group',
    type: 'Multilateral',
    tab: 'Multilateral/UN',
    roles: 12,
    match: 91,
    watching: true,
    description: 'Global development institution — digital transformation, governance, and public health lending',
    initials: 'WB',
    color: 'bg-blue-600',
    trend: '+3 new',
  },
  {
    name: 'Deloitte India (Gov Practice)',
    type: 'Consulting',
    tab: 'Consulting',
    roles: 8,
    match: 87,
    watching: true,
    description: 'Big 4 consulting — government & public services, digital transformation advisory',
    initials: 'DL',
    color: 'bg-emerald-600',
    trend: '+1 new',
  },
  {
    name: 'UNDP India',
    type: 'UN Agency',
    tab: 'Multilateral/UN',
    roles: 5,
    match: 89,
    watching: true,
    description: 'UN development programme — governance, sustainable development, digital public goods',
    initials: 'UN',
    color: 'bg-sky-600',
    trend: '+2 new',
  },
  {
    name: 'PwC India',
    type: 'Consulting',
    tab: 'Consulting',
    roles: 11,
    match: 84,
    watching: true,
    description: 'Big 4 advisory — public sector consulting, tax & regulatory, digital services',
    initials: 'PW',
    color: 'bg-orange-600',
  },
  {
    name: 'Asian Development Bank',
    type: 'Multilateral',
    tab: 'Multilateral/UN',
    roles: 7,
    match: 88,
    watching: true,
    description: 'Regional development bank — ICT for development, health, and governance programmes',
    initials: 'ADB',
    color: 'bg-red-600',
    trend: '+1 new',
  },
  {
    name: 'EY India',
    type: 'Consulting',
    tab: 'Consulting',
    roles: 9,
    match: 82,
    watching: true,
    description: 'Big 4 — government & infrastructure advisory, digital transformation, strategy',
    initials: 'EY',
    color: 'bg-yellow-600',
  },
  {
    name: 'WHO India',
    type: 'UN Agency',
    tab: 'Multilateral/UN',
    roles: 4,
    match: 85,
    watching: true,
    description: 'World Health Organization — health IT, digital health, NHM and ABDM alignment',
    initials: 'WHO',
    color: 'bg-teal-600',
    trend: '+1 new',
  },
  {
    name: 'GIZ India',
    type: 'Dev Agency',
    tab: 'Government',
    roles: 6,
    match: 83,
    watching: true,
    description: 'German bilateral development — digital governance, health systems, smart cities',
    initials: 'GIZ',
    color: 'bg-purple-600',
  },
  {
    name: 'Accenture Federal/Gov',
    type: 'Technology',
    tab: 'Technology',
    roles: 14,
    match: 79,
    watching: true,
    description: 'Global tech consulting — government digital services, cloud transformation',
    initials: 'AC',
    color: 'bg-indigo-600',
    trend: '+5 new',
  },
  {
    name: 'ICF International',
    type: 'Consulting',
    tab: 'Consulting',
    roles: 3,
    match: 81,
    watching: true,
    description: 'US-headquartered consulting — public health, digital government, USAID/DFID projects',
    initials: 'ICF',
    color: 'bg-rose-600',
  },
  {
    name: 'UNICEF India',
    type: 'UN Agency',
    tab: 'Multilateral/UN',
    roles: 4,
    match: 84,
    watching: true,
    description: 'UN children\'s fund — digital health, HMIS, child health programme IT systems',
    initials: 'UC',
    color: 'bg-cyan-600',
  },
  {
    name: 'Infosys BPM (Gov)',
    type: 'Technology',
    tab: 'Technology',
    roles: 7,
    match: 77,
    watching: true,
    description: 'IT services — BPM for government, digital governance delivery, state-level e-gov',
    initials: 'IN',
    color: 'bg-lime-600',
    trend: '+2 new',
  },
  {
    name: 'McKinsey Social Initiative',
    type: 'Consulting',
    tab: 'Consulting',
    roles: 2,
    match: 78,
    watching: true,
    description: 'McKinsey non-profit arm — developing country government transformation',
    initials: 'MC',
    color: 'bg-slate-600',
  },
  {
    name: 'Gates Foundation India',
    type: 'Foundation',
    tab: 'Health',
    roles: 3,
    match: 86,
    watching: true,
    description: 'Philanthropy — digital health, ABDM, family planning, global health strategy',
    initials: 'GF',
    color: 'bg-violet-600',
    trend: '+1 new',
  },
  {
    name: 'NHM / MoHFW',
    type: 'Government',
    tab: 'Government',
    roles: 5,
    match: 80,
    watching: true,
    description: 'National Health Mission / Ministry of Health — HMIS, digital health advisory roles',
    initials: 'NH',
    color: 'bg-green-700',
  },
]

const TABS: FilterTab[] = ['All', 'Consulting', 'Multilateral/UN', 'Government', 'Technology', 'Health']

function CompanyCard({ company, index }: { company: Company; index: number }) {
  const [watching, setWatching] = useState(company.watching)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-xl border border-border bg-card p-4 hover:border-gold-500/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center text-white text-xs font-bold',
              company.color
            )}
          >
            {company.initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-foreground leading-tight">{company.name}</p>
              {company.trend && (
                <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  <ArrowUp className="h-2.5 w-2.5" />
                  {company.trend}
                </span>
              )}
            </div>
            <span className="inline-block mt-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {company.type}
            </span>
          </div>
        </div>
        <button
          onClick={() => setWatching((w) => !w)}
          className={cn(
            'flex-shrink-0 rounded-full p-1.5 transition-colors',
            watching
              ? 'bg-gold-500/10 text-gold-500 hover:bg-gold-500/20'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          title={watching ? 'Stop watching' : 'Start watching'}
        >
          {watching ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
      </div>

      <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {company.description}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            <span className="font-semibold text-foreground">{company.roles}</span> open roles
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Star className="h-3 w-3" />
            <span
              className={cn(
                'font-bold',
                company.match >= 88
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : company.match >= 82
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-muted-foreground'
              )}
            >
              {company.match}%
            </span>
            <span>avg match</span>
          </span>
        </div>
        <button className="rounded-lg bg-gold-500/10 px-2.5 py-1 text-[10px] font-bold text-gold-600 dark:text-gold-400 hover:bg-gold-500/20 transition-colors">
          View Roles
        </button>
      </div>
    </motion.div>
  )
}

export default function CompaniesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('All')
  const [search, setSearch] = useState('')

  const filtered = COMPANIES.filter((c) => {
    const matchesTab = activeTab === 'All' || c.tab === activeTab
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const totalRoles = COMPANIES.reduce((s, c) => s + c.roles, 0)

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Target Organisations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold text-gold-500">200+ organisations</span> under active surveillance ·{' '}
            <span className="font-semibold text-foreground">{totalRoles} open roles</span> matching your profile
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-gold-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-gold-400 transition-colors">
          <Plus className="h-4 w-4" />
          Add Organisation
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search organisations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                activeTab === tab
                  ? 'bg-gold-500 text-white'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-6 rounded-xl border border-border bg-card px-5 py-3 text-xs">
        <span className="text-muted-foreground">
          Showing <span className="font-bold text-foreground">{filtered.length}</span> organisations
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Eye className="h-3 w-3 text-gold-500" />
          <span className="font-bold text-foreground">{filtered.filter((c) => c.watching).length}</span> watched
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Globe className="h-3 w-3 text-blue-500" />
          <span className="font-bold text-foreground">
            {filtered.reduce((s, c) => s + c.roles, 0)}
          </span>{' '}
          open roles in view
        </span>
      </div>

      {/* Company Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((company, i) => (
          <CompanyCard key={company.name} company={company} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-semibold text-foreground">No organisations found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  )
}
