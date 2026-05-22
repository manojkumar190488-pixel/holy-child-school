'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Users,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
} from 'recharts'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { cn } from '@/lib/utils'
import { CHART_COLORS } from '@/lib/constants'

// Mock analytics data — digital transformation, e-governance, public health IT, development sector
const TREND_DATA = [
  { date: 'May 1', jobs: 18, matches: 9, applied: 1 },
  { date: 'May 5', jobs: 24, matches: 13, applied: 2 },
  { date: 'May 8', jobs: 31, matches: 17, applied: 2 },
  { date: 'May 11', jobs: 28, matches: 14, applied: 3 },
  { date: 'May 15', jobs: 38, matches: 22, applied: 4 },
  { date: 'May 18', jobs: 35, matches: 19, applied: 3 },
  { date: 'May 21', jobs: 44, matches: 27, applied: 5 },
]

const SOURCE_DATA = [
  { name: 'LinkedIn', value: 38, color: CHART_COLORS.linkedin },
  { name: 'Naukri / iimjobs', value: 20, color: CHART_COLORS.naukri },
  { name: 'DevNetJobs', value: 16, color: '#10B981' },
  { name: 'ReliefWeb', value: 13, color: '#8B5CF6' },
  { name: 'World Bank / ADB', value: 9, color: '#F59E0B' },
  { name: 'Other', value: 4, color: CHART_COLORS.other },
]

const SCORE_DIST = [
  { range: '0-40%', count: 34 },
  { range: '40-50%', count: 82 },
  { range: '50-60%', count: 148 },
  { range: '60-70%', count: 204 },
  { range: '70-80%', count: 186 },
  { range: '80-90%', count: 143 },
  { range: '90-100%', count: 50 },
]

const TOP_COMPANIES = [
  { company: 'World Bank Group', jobs: 18, avgScore: 91 },
  { company: 'UNDP', jobs: 14, avgScore: 89 },
  { company: 'Deloitte Government', jobs: 22, avgScore: 85 },
  { company: 'Asian Development Bank', jobs: 12, avgScore: 88 },
  { company: 'EY India', jobs: 19, avgScore: 82 },
  { company: 'GIZ India', jobs: 11, avgScore: 84 },
  { company: 'ICF International', jobs: 9, avgScore: 80 },
  { company: 'UNICEF', jobs: 8, avgScore: 87 },
]

const SKILLS_GAP = [
  { skill: 'Digital Transformation', required: 95, possessed: 95 },
  { skill: 'E-Governance', required: 90, possessed: 92 },
  { skill: 'PMU / TSU', required: 88, possessed: 90 },
  { skill: 'Public Health IT', required: 85, possessed: 88 },
  { skill: 'Data Analytics', required: 82, possessed: 72 },
  { skill: 'Cloud/AWS', required: 75, possessed: 52 },
]

const WEEKLY_TREND = [
  { week: 'W1', newJobs: 26, matched: 13, applied: 2 },
  { week: 'W2', newJobs: 34, matched: 19, applied: 3 },
  { week: 'W3', newJobs: 38, matched: 21, applied: 3 },
  { week: 'W4', newJobs: 47, matched: 27, applied: 5 },
]

const HEATMAP_DATA = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => ({
    day,
    hour,
    value: Math.floor(Math.random() * 15),
  }))
).flat()

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`)

export default function AnalyticsPage() {
  return (
    <div className="animate-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Market Intelligence</h2>
          <p className="text-sm text-muted-foreground">
            30-day overview of your opportunity landscape
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                period === '30d'
                  ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/30'
                  : 'text-muted-foreground hover:bg-muted border border-transparent'
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="Total Opportunities" value={847} change={18} changeLabel="vs last month" icon={<BarChart3 className="h-5 w-5" />} color="gold" index={0} />
        <StatsCard label="High Match (>80%)" value={64} change={29} changeLabel="strong pipeline" icon={<Award className="h-5 w-5" />} color="green" index={1} />
        <StatsCard label="Avg Match Score" value={71} suffix="%" change={8} changeLabel="improvement" icon={<Target className="h-5 w-5" />} color="blue" index={2} />
        <StatsCard label="Recruiters Tracked" value={28} change={17} changeLabel="new contacts" icon={<Users className="h-5 w-5" />} color="purple" index={3} />
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Opportunity Volume Over Time */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Opportunity Volume</h3>
              <p className="text-xs text-muted-foreground">Jobs discovered, matched, applied</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              +18% this month
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="jobsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--foreground)' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="jobs" stroke="#F59E0B" fill="url(#jobsGrad)" strokeWidth={2} name="Total Jobs" />
              <Area type="monotone" dataKey="matches" stroke="#10B981" fill="url(#matchGrad)" strokeWidth={2} name="High Matches" />
              <Line type="monotone" dataKey="applied" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Applied" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Source Breakdown Pie */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-foreground">Source Breakdown</h3>
            <p className="text-xs text-muted-foreground">Jobs by platform</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={SOURCE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {SOURCE_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--foreground)' }} formatter={(value) => [`${value}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {SOURCE_DATA.slice(0, 4).map((source) => (
              <div key={source.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-muted-foreground">{source.name}</span>
                </div>
                <span className="font-semibold text-foreground">{source.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Score Distribution */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-foreground">Match Score Distribution</h3>
            <p className="text-xs text-muted-foreground">Number of jobs by match score range</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SCORE_DIST}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--foreground)' }} />
              <Bar dataKey="count" name="Jobs" radius={[4, 4, 0, 0]}>
                {SCORE_DIST.map((entry, index) => {
                  const pct = parseInt(entry.range)
                  const color = pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : pct >= 40 ? '#3B82F6' : '#94A3B8'
                  return <Cell key={index} fill={color} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Gap Radar */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-foreground">Skills Gap Analysis</h3>
            <p className="text-xs text-muted-foreground">Your skills vs market demand</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={SKILLS_GAP}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <Radar name="Market Demand" dataKey="required" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Your Skills" dataKey="possessed" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Companies + Weekly Trends */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Companies */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold text-foreground">Top Companies Posting</h3>
            <p className="text-xs text-muted-foreground">Most active recruiters in your space</p>
          </div>
          <div className="divide-y divide-border">
            {TOP_COMPANIES.map((company, i) => (
              <motion.div
                key={company.company}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-5 py-3 hover:bg-muted transition-colors"
              >
                <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{company.company}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground">{company.jobs}</p>
                  <p className="text-[11px] text-muted-foreground">jobs</p>
                </div>
                <div className="flex items-center gap-2 w-32 flex-shrink-0">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gold-500"
                      style={{ width: `${company.avgScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground w-9">{company.avgScore}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Weekly Trends */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-foreground">Weekly Activity</h3>
            <p className="text-xs text-muted-foreground">Your job search momentum</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY_TREND} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <YAxis dataKey="week" type="category" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--foreground)' }} />
              <Bar dataKey="newJobs" name="New Jobs" fill="#F59E0B" radius={[0, 3, 3, 0]} />
              <Bar dataKey="matched" name="Matched" fill="#10B981" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {[
              { label: 'Best day for job posts', value: 'Tuesday', color: 'text-gold-600 dark:text-gold-400' },
              { label: 'Peak match rate', value: 'Week 4 (38%)', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Avg response time', value: '4.2 days', color: 'text-blue-600 dark:text-blue-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn('font-semibold', color)}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recruiter Activity Heatmap */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-foreground">Recruiter Activity Heatmap</h3>
          <p className="text-xs text-muted-foreground">
            Best times to reach out — darker = more active
          </p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="flex gap-1 mb-1">
              <div className="w-8" />
              {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
                <div
                  key={h}
                  className="flex-1 text-center text-[10px] text-muted-foreground"
                >
                  {h}:00
                </div>
              ))}
            </div>
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-1 mb-1">
                <div className="w-8 text-[10px] text-muted-foreground text-right pr-1">{day}</div>
                {Array.from({ length: 24 }, (_, hour) => {
                  const val =
                    HEATMAP_DATA.find((d) => d.day === dayIdx && d.hour === hour)?.value || 0
                  const opacity = val / 15
                  return (
                    <div
                      key={hour}
                      title={`${day} ${hour}:00 — ${val} activities`}
                      className="h-5 flex-1 rounded-sm transition-colors cursor-default"
                      style={{
                        backgroundColor: `rgba(245, 158, 11, ${opacity})`,
                        border: `1px solid rgba(245, 158, 11, ${opacity * 0.5})`,
                      }}
                    />
                  )
                })}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {[0.1, 0.3, 0.5, 0.7, 1].map((op) => (
                <div
                  key={op}
                  className="h-3 w-6 rounded-sm"
                  style={{ backgroundColor: `rgba(245, 158, 11, ${op})` }}
                />
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
