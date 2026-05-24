'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  BookOpen,
  Star,
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  Target,
  Award,
  ExternalLink,
  Sparkles,
  BarChart3,
  Clock,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────
type SkillLevel = 'expert' | 'proficient' | 'developing' | 'gap'
type Priority = 'critical' | 'high' | 'medium' | 'low'

interface Skill {
  name: string
  current: number
  market: number
  level: SkillLevel
  priority: Priority
  trend: 'rising' | 'stable' | 'declining'
  resources: Array<{ title: string; type: 'course' | 'cert' | 'book' | 'community' }>
  timeToClose?: string
}

interface SkillCategory {
  id: string
  label: string
  color: string
  skills: Skill[]
}

// ─── Data ─────────────────────────────────────────────────────
const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'core',
    label: 'Core Consulting',
    color: '#F59E0B',
    skills: [
      { name: 'Digital Transformation', current: 95, market: 92, level: 'expert', priority: 'critical', trend: 'rising', resources: [{ title: 'MIT Digital Transformation', type: 'cert' }] },
      { name: 'Government Consulting', current: 93, market: 88, level: 'expert', priority: 'critical', trend: 'stable', resources: [] },
      { name: 'PMU/TSU Leadership', current: 91, market: 85, level: 'expert', priority: 'critical', trend: 'stable', resources: [] },
      { name: 'Stakeholder Management', current: 92, market: 90, level: 'expert', priority: 'high', trend: 'stable', resources: [] },
      { name: 'Strategy Development', current: 88, market: 90, level: 'proficient', priority: 'high', trend: 'rising', resources: [{ title: 'INSEAD Strategy Cert', type: 'cert' }] },
      { name: 'Bid Management', current: 85, market: 80, level: 'expert', priority: 'medium', trend: 'stable', resources: [] },
    ],
  },
  {
    id: 'egovernance',
    label: 'E-Governance & Public Sector',
    color: '#3B82F6',
    skills: [
      { name: 'E-Governance Design', current: 90, market: 85, level: 'expert', priority: 'critical', trend: 'rising', resources: [] },
      { name: 'Digital Public Infrastructure', current: 82, market: 90, level: 'proficient', priority: 'critical', trend: 'rising', timeToClose: '2–3 months', resources: [{ title: 'DPI Open Source Course (CDPI)', type: 'course' }, { title: 'DPG Alliance Community', type: 'community' }] },
      { name: 'GovTech Procurement', current: 85, market: 80, level: 'expert', priority: 'high', trend: 'stable', resources: [] },
      { name: 'NeGD/MeitY Frameworks', current: 88, market: 82, level: 'expert', priority: 'high', trend: 'stable', resources: [] },
      { name: 'Smart Cities Architecture', current: 78, market: 75, level: 'proficient', priority: 'medium', trend: 'stable', resources: [] },
    ],
  },
  {
    id: 'health',
    label: 'Digital Health & Public Health IT',
    color: '#10B981',
    skills: [
      { name: 'Health Information Systems', current: 88, market: 85, level: 'expert', priority: 'critical', trend: 'rising', resources: [] },
      { name: 'DHIS2 / HMIS', current: 72, market: 82, level: 'developing', priority: 'high', trend: 'rising', timeToClose: '1–2 months', resources: [{ title: 'DHIS2 Fundamentals (HISP)', type: 'course' }, { title: 'DHIS2 Academy Certification', type: 'cert' }] },
      { name: 'ABDM / Digital Health Policy', current: 78, market: 88, level: 'developing', priority: 'critical', trend: 'rising', timeToClose: '2–3 months', resources: [{ title: 'NHA ABDM Sandbox', type: 'course' }, { title: 'Abdm.gov.in Documentation', type: 'book' }] },
      { name: 'Health Systems Strengthening', current: 90, market: 86, level: 'expert', priority: 'critical', trend: 'stable', resources: [] },
      { name: 'Digital Health Strategy', current: 85, market: 88, level: 'proficient', priority: 'high', trend: 'rising', resources: [{ title: 'WHO Digital Health Strategy Guide', type: 'book' }] },
      { name: 'eSanjeevani / Telemedicine', current: 68, market: 78, level: 'developing', priority: 'medium', trend: 'rising', timeToClose: '1 month', resources: [{ title: 'MoHFW Telemedicine Guidelines', type: 'book' }] },
    ],
  },
  {
    id: 'donor',
    label: 'Donor & Development Sector',
    color: '#8B5CF6',
    skills: [
      { name: 'World Bank Project Management', current: 92, market: 85, level: 'expert', priority: 'critical', trend: 'stable', resources: [] },
      { name: 'Results-Based Management', current: 88, market: 88, level: 'expert', priority: 'high', trend: 'stable', resources: [] },
      { name: 'M&E Frameworks (SMART/LFA)', current: 90, market: 86, level: 'expert', priority: 'high', trend: 'stable', resources: [] },
      { name: 'Donor Coordination', current: 86, market: 82, level: 'expert', priority: 'high', trend: 'stable', resources: [] },
      { name: 'USAID/FCDO Frameworks', current: 62, market: 78, level: 'developing', priority: 'medium', trend: 'stable', timeToClose: '3–4 months', resources: [{ title: 'USAID ADS Online Modules', type: 'course' }, { title: 'FCDO Smart Rules', type: 'book' }] },
    ],
  },
  {
    id: 'emerging',
    label: 'Emerging & High-Demand',
    color: '#EF4444',
    skills: [
      { name: 'AI Governance', current: 72, market: 92, level: 'developing', priority: 'critical', trend: 'rising', timeToClose: '3–4 months', resources: [{ title: 'Stanford HAI AI Policy Course', type: 'course' }, { title: 'OECD AI Policy Observatory', type: 'community' }, { title: 'NITI Aayog Responsible AI Principles', type: 'book' }] },
      { name: 'Data Analytics / BI', current: 72, market: 85, level: 'developing', priority: 'high', trend: 'rising', timeToClose: '2–3 months', resources: [{ title: 'Power BI (Microsoft Learn)', type: 'course' }, { title: 'Tableau Public Certification', type: 'cert' }] },
      { name: 'Cloud Architecture (AWS/GCP)', current: 52, market: 78, level: 'gap', priority: 'medium', trend: 'rising', timeToClose: '4–6 months', resources: [{ title: 'AWS Cloud Practitioner', type: 'cert' }, { title: 'GCP Digital Leader Cert', type: 'cert' }] },
      { name: 'Agile / Scrum at Scale', current: 75, market: 82, level: 'developing', priority: 'medium', trend: 'stable', timeToClose: '1–2 months', resources: [{ title: 'SAFe Agilist Certification', type: 'cert' }] },
      { name: 'Data Privacy (DPDP Act)', current: 65, market: 88, level: 'developing', priority: 'critical', trend: 'rising', timeToClose: '1 month', resources: [{ title: 'DPDP Act 2023 Commentary', type: 'book' }, { title: 'NASSCOM Data Privacy Course', type: 'course' }] },
    ],
  },
]

const RADAR_DATA = [
  { skill: 'Core Consulting', current: 91, market: 88 },
  { skill: 'E-Governance', current: 85, market: 84 },
  { skill: 'Digital Health', current: 80, market: 85 },
  { skill: 'Donor Sector', current: 84, market: 84 },
  { skill: 'AI & Emerging', current: 67, market: 85 },
]

const LEVEL_CONFIG: Record<SkillLevel, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  expert: { label: 'Expert', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: <Star className="h-3 w-3" /> },
  proficient: { label: 'Proficient', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  developing: { label: 'Developing', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: <TrendingUp className="h-3 w-3" /> },
  gap: { label: 'Gap', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: <Circle className="h-3 w-3" /> },
}

const PRIORITY_DOT: Record<Priority, string> = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-400',
}

const RESOURCE_TYPE_BADGE: Record<string, string> = {
  course: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cert: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  book: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  community: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

// Flatten all skills for the gap analysis
const ALL_SKILLS = SKILL_CATEGORIES.flatMap(c => c.skills.map(s => ({ ...s, category: c.label, categoryColor: c.color })))
const GAP_SKILLS = ALL_SKILLS.filter(s => s.current < s.market).sort((a, b) => (b.market - b.current) - (a.market - a.current))

// ─── Sub-components ────────────────────────────────────────────

function SkillBar({ skill, color }: { skill: Skill; color: string }) {
  const levelConfig = LEVEL_CONFIG[skill.level]
  const gap = skill.market - skill.current
  const hasGap = gap > 0

  return (
    <div className="space-y-1.5 group">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('h-1.5 w-1.5 flex-shrink-0 rounded-full', PRIORITY_DOT[skill.priority])} title={`${skill.priority} priority`} />
          <span className="text-xs font-medium text-foreground truncate">{skill.name}</span>
          {skill.trend === 'rising' && (
            <TrendingUp className="h-3 w-3 flex-shrink-0 text-emerald-500" />
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold', levelConfig.bg, levelConfig.color)}>
            {levelConfig.icon}
            {levelConfig.label}
          </span>
          <span className="text-xs font-bold text-foreground w-8 text-right">{skill.current}%</span>
        </div>
      </div>
      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${skill.current}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute h-full rounded-full"
          style={{ backgroundColor: color }}
        />
        {hasGap && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${gap}%`, left: `${skill.current}%` }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="absolute h-full rounded-r-full bg-muted-foreground/20"
            style={{ left: `${skill.current}%` }}
            title={`Gap: ${gap}%`}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Your level: {skill.current}%</span>
        <span>Market demand: {skill.market}%</span>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────

type Tab = 'overview' | 'gaps' | 'roadmap'

export default function SkillsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [expandedCat, setExpandedCat] = useState<string | null>('core')

  const expertCount = ALL_SKILLS.filter(s => s.level === 'expert').length
  const gapCount = ALL_SKILLS.filter(s => s.current < s.market).length
  const criticalGaps = GAP_SKILLS.filter(s => s.priority === 'critical')

  return (
    <div className="animate-in space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Skills Roadmap</h2>
          <p className="text-sm text-muted-foreground">
            Gap analysis, learning priorities, and upskilling plan for your target roles
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Sparkles className="h-3.5 w-3.5" />}
          onClick={() => toast.info('Generating personalized roadmap from your bookmarked jobs...')}
        >
          Generate from Jobs
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Expert Skills', value: expertCount, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Skills with Gaps', value: gapCount, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Critical Gaps', value: criticalGaps.length, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Overall Score', value: '82%', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn('rounded-xl border p-4 text-center', stat.bg)}
          >
            <p className={cn('text-2xl font-extrabold', stat.color)}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
        {(
          [
            { id: 'overview' as Tab, label: 'Skill Overview', icon: <BarChart3 className="h-3.5 w-3.5" /> },
            { id: 'gaps' as Tab, label: 'Gap Analysis', icon: <Target className="h-3.5 w-3.5" /> },
            { id: 'roadmap' as Tab, label: 'Learning Roadmap', icon: <BookOpen className="h-3.5 w-3.5" /> },
          ]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
              activeTab === tab.id
                ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Radar Chart */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-1">Skills vs Market Demand</h3>
                <p className="text-xs text-muted-foreground mb-4">Radar view across your 5 skill domains</p>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                    <Radar name="Market Demand" dataKey="market" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Your Skills" dataKey="current" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="mt-3 flex items-center gap-4 justify-center text-xs">
                  <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500" /><span className="text-muted-foreground">Your Skills</span></div>
                  <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-amber-500" /><span className="text-muted-foreground">Market Demand</span></div>
                </div>
              </div>

              {/* Overall Legend */}
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-bold text-foreground mb-3">Skill Level Distribution</h3>
                  {Object.entries(LEVEL_CONFIG).map(([level, config]) => {
                    const count = ALL_SKILLS.filter(s => s.level === level as SkillLevel).length
                    const pct = Math.round(count / ALL_SKILLS.length * 100)
                    return (
                      <div key={level} className="mb-2.5">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={cn('flex items-center gap-1.5 font-medium', config.color)}>
                            {config.icon}{config.label}
                          </span>
                          <span className="text-muted-foreground">{count} skills ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div className="h-full rounded-full bg-current transition-all" style={{ width: `${pct}%`, color: config.color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-xs font-bold text-foreground mb-2">Priority Legend</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(['critical', 'high', 'medium', 'low'] as Priority[]).map(p => (
                      <div key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className={cn('h-2.5 w-2.5 rounded-full flex-shrink-0', PRIORITY_DOT[p])} />
                        {p.charAt(0).toUpperCase() + p.slice(1)} priority
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              {SKILL_CATEGORIES.map((cat) => (
                <div key={cat.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-bold text-foreground">{cat.label}</span>
                      <span className="text-xs text-muted-foreground">{cat.skills.length} skills</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Avg: {Math.round(cat.skills.reduce((s, k) => s + k.current, 0) / cat.skills.length)}%
                      </span>
                      {expandedCat === cat.id ? <TrendingUp className="h-4 w-4 text-muted-foreground" /> : <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedCat === cat.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
                          {cat.skills.map((skill) => (
                            <SkillBar key={skill.name} skill={skill} color={cat.color} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'gaps' && (
          <motion.div key="gaps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Gap Bar Chart */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-1">Skills Gap Size (Market - Current)</h3>
              <p className="text-xs text-muted-foreground mb-4">Larger bar = bigger gap to close</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={GAP_SKILLS.slice(0, 10).map(s => ({ name: s.name.length > 20 ? s.name.slice(0, 18) + '…' : s.name, gap: s.market - s.current, priority: s.priority }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} width={140} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--foreground)' }} />
                  <Bar dataKey="gap" name="Gap Size" radius={[0, 4, 4, 0]}>
                    {GAP_SKILLS.slice(0, 10).map((entry, i) => (
                      <Cell key={i} fill={entry.priority === 'critical' ? '#EF4444' : entry.priority === 'high' ? '#F59E0B' : '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                {[{ color: 'bg-red-500', label: 'Critical' }, { color: 'bg-amber-500', label: 'High' }, { color: 'bg-blue-500', label: 'Medium' }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5"><div className={cn('h-2.5 w-2.5 rounded-full', l.color)} />{l.label}</div>
                ))}
              </div>
            </div>

            {/* Critical Gaps */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Critical Priority Gaps — Act Now
              </h3>
              <div className="space-y-3">
                {criticalGaps.map((skill, i) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-bold text-foreground">{skill.name}</p>
                          {skill.trend === 'rising' && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              <TrendingUp className="h-2.5 w-2.5" /> Rising demand
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{skill.category}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Current: <strong className="text-foreground">{skill.current}%</strong></span>
                          <span>Market: <strong className="text-foreground">{skill.market}%</strong></span>
                          <span className="text-red-600 dark:text-red-400 font-semibold">Gap: -{skill.market - skill.current}%</span>
                          {skill.timeToClose && (
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {skill.timeToClose} to close</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {skill.resources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {skill.resources.map((res) => (
                          <span key={res.title} className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', RESOURCE_TYPE_BADGE[res.type])}>
                            {res.type === 'cert' ? <Award className="h-2.5 w-2.5" /> : res.type === 'course' ? <BookOpen className="h-2.5 w-2.5" /> : <ExternalLink className="h-2.5 w-2.5" />}
                            {res.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'roadmap' && (
          <motion.div key="roadmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* 90-day plan */}
            <div className="rounded-xl border border-gold-500/20 bg-gradient-to-br from-gold-500/5 to-transparent p-5">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="h-5 w-5 text-gold-500" />
                <h3 className="text-sm font-bold text-foreground">Your 90-Day Upskilling Roadmap</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    phase: 'Days 1–30',
                    title: 'Quick Wins — High Impact, Low Effort',
                    color: 'border-emerald-500/30 bg-emerald-500/5',
                    headerColor: 'text-emerald-600 dark:text-emerald-400',
                    items: [
                      { skill: 'DPDP Act 2023', action: 'Read the Act + NASSCOM compliance guide. 1-page summary.', time: '3–5 hours' },
                      { skill: 'eSanjeevani / Telemedicine', action: 'Complete MoHFW guidelines + hands-on demo walkthrough.', time: '4–6 hours' },
                      { skill: 'AI Governance Basics', action: 'Read NITI Aayog Responsible AI paper + OECD AI principles.', time: '4–5 hours' },
                    ],
                  },
                  {
                    phase: 'Days 31–60',
                    title: 'Core Gaps — Structured Learning',
                    color: 'border-amber-500/30 bg-amber-500/5',
                    headerColor: 'text-amber-600 dark:text-amber-400',
                    items: [
                      { skill: 'DHIS2 Certification', action: 'Complete HISP DHIS2 Fundamentals online course (free). Earn certificate.', time: '20–25 hours' },
                      { skill: 'ABDM Ecosystem', action: 'Complete NHA Sandbox walkthrough + attend 2 ABDM community webinars.', time: '10–15 hours' },
                      { skill: 'Data Analytics', action: 'Complete Microsoft Power BI Learning Path (free). Build 1 sample health dashboard.', time: '15–20 hours' },
                    ],
                  },
                  {
                    phase: 'Days 61–90',
                    title: 'Strategic Depth — Differentiation',
                    color: 'border-blue-500/30 bg-blue-500/5',
                    headerColor: 'text-blue-600 dark:text-blue-400',
                    items: [
                      { skill: 'AI Governance Deep Dive', action: 'Stanford HAI AI Policy course OR write a 1000-word LinkedIn article on AI governance in Indian public health.', time: '15–20 hours' },
                      { skill: 'Digital Public Infrastructure', action: 'Deep-dive CDPI open resources. Attend 1 DPI ecosystem event/webinar.', time: '8–10 hours' },
                      { skill: 'AWS / Cloud Basics', action: 'AWS Cloud Practitioner Essentials (free on AWS Skill Builder). Sit the exam.', time: '20–25 hours' },
                    ],
                  },
                ].map((phase) => (
                  <div key={phase.phase} className={cn('rounded-xl border p-4', phase.color)}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn('text-xs font-bold', phase.headerColor)}>{phase.phase}</span>
                      <span className="text-xs text-muted-foreground">— {phase.title}</span>
                    </div>
                    <div className="space-y-2">
                      {phase.items.map((item) => (
                        <div key={item.skill} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/50" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground">{item.skill}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{item.action}</p>
                          </div>
                          <div className="flex-shrink-0 text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certification Targets */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-gold-500" />
                High-Value Certifications to Add
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { cert: 'DHIS2 Fundamentals', org: 'HISP / WHO Collaborating Centre', time: '2–3 weeks', value: 'High', relevance: 'Mandatory for many digital health roles' },
                  { cert: 'AWS Cloud Practitioner', org: 'Amazon Web Services', time: '3–4 weeks', value: 'Medium', relevance: 'Opens cloud architecture + gov cloud roles' },
                  { cert: 'SAFe Agilist (SA)', org: 'Scaled Agile', time: '2–3 days', value: 'Medium', relevance: 'Government IT transformation programs' },
                  { cert: 'PMI-ACP (Agile PM)', org: 'Project Management Institute', time: '2–3 months', value: 'High', relevance: 'Complements PMP, shows agile evolution' },
                  { cert: 'AI for Leaders', org: 'INSEAD / MIT Sloan', time: '4–6 weeks', value: 'Very High', relevance: 'Executive AI governance positioning' },
                  { cert: 'Google Project Mgmt Cert', org: 'Google / Coursera', time: '4–6 months', value: 'Low', relevance: 'Optional — already have PMP' },
                ].map((cert, i) => {
                  const valueColor = cert.value === 'Very High' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' : cert.value === 'High' ? 'text-gold-600 dark:text-gold-400 bg-gold-100 dark:bg-gold-900/30' : cert.value === 'Medium' ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' : 'text-muted-foreground bg-muted'
                  return (
                    <motion.div key={cert.cert} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground">{cert.cert}</p>
                          <p className="text-[11px] text-muted-foreground">{cert.org}</p>
                        </div>
                        <span className={cn('flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', valueColor)}>{cert.value}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{cert.time}</span>
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">{cert.relevance}</p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
