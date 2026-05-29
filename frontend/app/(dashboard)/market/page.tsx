'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  BarChart3,
  MapPin,
  Briefcase,
  Star,
  ArrowUp,
  ArrowDown,
  Building2,
  Zap,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STAT_CARDS = [
  {
    label: 'Active Opportunities',
    value: '847',
    change: '+44',
    changeLabel: 'new today',
    positive: true,
    icon: Briefcase,
    color: 'text-gold-500',
    bg: 'bg-gold-500/10',
  },
  {
    label: 'Avg Salary (VP Level)',
    value: '₹45L',
    change: '+12%',
    changeLabel: 'YoY growth',
    positive: true,
    icon: TrendingUp,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'YoY Market Growth',
    value: '23%',
    change: '+4pp',
    changeLabel: 'vs last year',
    positive: true,
    icon: BarChart3,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'Companies Hiring',
    value: '156',
    change: '+18',
    changeLabel: 'this month',
    positive: true,
    icon: Building2,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
]

const SALARY_ROLES = [
  { role: 'Chief Digital Officer (CDO)', low: 55, high: 80, mid: 68, color: 'bg-gold-500' },
  { role: 'VP, Digital Transformation', low: 48, high: 65, mid: 57, color: 'bg-blue-500' },
  { role: 'Practice Head / Associate Partner', low: 42, high: 58, mid: 50, color: 'bg-purple-500' },
  { role: 'Director, Gov Consulting', low: 38, high: 52, mid: 45, color: 'bg-emerald-500' },
  { role: 'PMO / Programme Director', low: 35, high: 48, mid: 42, color: 'bg-orange-500' },
]

const SKILLS = [
  { name: 'Digital Transformation', pct: 94 },
  { name: 'AI/ML Governance', pct: 89 },
  { name: 'Programme Management', pct: 85 },
  { name: 'Health IT / Digital Health', pct: 82 },
  { name: 'PMU / TSU Leadership', pct: 78 },
  { name: 'e-Governance / Smart Gov', pct: 76 },
  { name: 'Donor Coordination', pct: 71 },
  { name: 'Agile / DevSecOps', pct: 68 },
]

const GEO_DEMAND = [
  { city: 'Delhi NCR', pct: 38, color: 'bg-gold-500' },
  { city: 'Mumbai', pct: 22, color: 'bg-blue-500' },
  { city: 'Bengaluru', pct: 18, color: 'bg-emerald-500' },
  { city: 'Hyderabad', pct: 12, color: 'bg-purple-500' },
  { city: 'Other', pct: 10, color: 'bg-muted-foreground' },
]

const HIRING_ORGS = [
  { name: 'World Bank Group', roles: 18, type: 'Multilateral', match: 91 },
  { name: 'Deloitte Gov & Public Services', roles: 14, type: 'Consulting', match: 87 },
  { name: 'PwC India', roles: 13, type: 'Consulting', match: 84 },
  { name: 'UNDP India', roles: 11, type: 'UN Agency', match: 89 },
  { name: 'EY India', roles: 10, type: 'Consulting', match: 82 },
  { name: 'Asian Development Bank', roles: 9, type: 'Multilateral', match: 88 },
  { name: 'WHO India', roles: 8, type: 'UN Agency', match: 85 },
  { name: 'GIZ India', roles: 7, type: 'Dev Agency', match: 83 },
  { name: 'Accenture Federal/Gov', roles: 6, type: 'Technology', match: 79 },
  { name: 'Infosys BPM (Gov)', roles: 5, type: 'Technology', match: 77 },
]

const EMERGING = [
  {
    title: 'AI Governance Lead',
    desc: 'Oversee responsible AI adoption in government digital programmes.',
    growth: '+67%',
    icon: '🤖',
  },
  {
    title: 'Digital Health CDO',
    desc: 'Drive ABDM, telemedicine, and digital public health infrastructure.',
    growth: '+54%',
    icon: '🏥',
  },
  {
    title: 'Smart City Director',
    desc: 'Lead integrated urban digital transformation across Smart City Mission.',
    growth: '+48%',
    icon: '🏙️',
  },
  {
    title: 'NeGD / MeitY Senior Advisor',
    desc: 'Strategic advisory for national e-governance programmes and policy.',
    growth: '+41%',
    icon: '🏛️',
  },
]

function StatCard({ card, index }: { card: typeof STAT_CARDS[0]; index: number }) {
  const Icon = card.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-start justify-between">
        <div className={cn('rounded-lg p-2', card.bg)}>
          <Icon className={cn('h-5 w-5', card.color)} />
        </div>
        <span
          className={cn(
            'flex items-center gap-1 text-xs font-semibold',
            card.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
          )}
        >
          {card.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {card.change}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-extrabold text-foreground">{card.value}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{card.label}</p>
        <p className="text-xs text-muted-foreground">{card.changeLabel}</p>
      </div>
    </motion.div>
  )
}

export default function MarketPage() {
  const [activeSkillTab, setActiveSkillTab] = useState<'skills' | 'geo'>('skills')

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Market Intelligence</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time consulting landscape · Updated{' '}
            <span className="font-semibold text-gold-500">2 minutes ago</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Data
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card, i) => (
          <StatCard key={card.label} card={card} index={i} />
        ))}
      </div>

      {/* Salary Trends */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Salary Benchmarks</h3>
            <p className="text-xs text-muted-foreground">
              VP / Director / Partner level — Government Consulting & Digital Transformation
            </p>
          </div>
          <span className="rounded-full bg-gold-500/10 px-2.5 py-0.5 text-xs font-semibold text-gold-600 dark:text-gold-400">
            CTC in ₹ Lakhs
          </span>
        </div>
        <div className="space-y-4">
          {SALARY_ROLES.map((r) => {
            const barWidth = ((r.high - 30) / 60) * 100
            const barStart = ((r.low - 30) / 60) * 100
            const barSpan = ((r.high - r.low) / 60) * 100
            return (
              <div key={r.role} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{r.role}</span>
                  <span className="font-bold text-foreground">
                    ₹{r.low}L – ₹{r.high}L
                    <span className="ml-2 text-muted-foreground font-normal">mid ₹{r.mid}L</span>
                  </span>
                </div>
                <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('absolute h-full rounded-full', r.color)}
                    style={{ left: `${barStart}%`, width: `${barSpan}%` }}
                  />
                  {/* mid marker */}
                  <div
                    className="absolute h-full w-0.5 bg-white/80"
                    style={{ left: `${((r.mid - 30) / 60) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
            <span>₹30L</span>
            <span>₹45L</span>
            <span>₹60L</span>
            <span>₹75L</span>
            <span>₹90L+</span>
          </div>
        </div>
      </motion.div>

      {/* Skills + Geo */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Skills in Demand */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-gold-500" />
            <h3 className="text-sm font-bold text-foreground">Top Skills in Demand</h3>
          </div>
          <div className="space-y-3">
            {SKILLS.map((s, i) => (
              <div key={s.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {i < 3 && (
                      <span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-gold-500/20 text-[9px] font-bold text-gold-600 dark:text-gold-400">
                        {i + 1}
                      </span>
                    )}
                    {s.name}
                  </span>
                  <span className="font-bold text-foreground">{s.pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct}%` }}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      i === 0
                        ? 'bg-gold-500'
                        : i === 1
                        ? 'bg-blue-500'
                        : i === 2
                        ? 'bg-emerald-500'
                        : 'bg-purple-400'
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Geographic Demand */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-bold text-foreground">Geographic Demand Distribution</h3>
          </div>
          {/* Donut-style visual */}
          <div className="space-y-3">
            {GEO_DEMAND.map((g) => (
              <div key={g.city} className="flex items-center gap-3">
                <span className="w-24 text-xs font-medium text-foreground">{g.city}</span>
                <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.pct}%` }}
                    transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
                    className={cn('h-full rounded-full flex items-center', g.color)}
                  />
                </div>
                <span className="w-10 text-right text-xs font-bold text-foreground">{g.pct}%</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-blue-500/10 p-3">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Delhi NCR dominates with 38% share
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Highest concentration of multilateral, government, and Big 4 consulting roles. Remote-friendly
              opportunities increasing — 34% of VP roles now hybrid.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Hiring Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Top Hiring Organisations</h3>
            <p className="text-xs text-muted-foreground">Ranked by open roles matching your profile</p>
          </div>
          <span className="text-xs text-muted-foreground">Your Avg Match</span>
        </div>
        <div className="divide-y divide-border">
          {HIRING_ORGS.map((org, i) => (
            <div
              key={org.name}
              className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
            >
              <span
                className={cn(
                  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  i === 0
                    ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400'
                    : i === 1
                    ? 'bg-slate-400/20 text-slate-500 dark:text-slate-400'
                    : i === 2
                    ? 'bg-orange-400/20 text-orange-500'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{org.name}</p>
                <p className="text-xs text-muted-foreground">{org.type}</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  {org.roles} roles
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 font-bold',
                    org.match >= 88
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : org.match >= 82
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {org.match}% match
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Emerging Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-gold-500" />
          <h3 className="text-sm font-bold text-foreground">Emerging Opportunity Categories</h3>
          <span className="ml-auto text-xs text-muted-foreground">YoY demand growth</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EMERGING.map((e) => (
            <div
              key={e.title}
              className="rounded-lg border border-border bg-background p-4 hover:border-gold-500/50 transition-colors"
            >
              <div className="mb-2 text-2xl">{e.icon}</div>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-foreground leading-tight">{e.title}</p>
                <span className="flex-shrink-0 flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ArrowUp className="h-3 w-3" />
                  {e.growth}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
