'use client'

import { useMemo, useState } from 'react'
import {
  Briefcase,
  Star,
  PlusCircle,
  CheckCircle2,
  Send,
  RefreshCw,
  Clock,
  ExternalLink,
  Globe2,
  Building2,
  Landmark,
  IndianRupee,
  CalendarClock,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from 'recharts'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { AIRecommendations } from '@/components/dashboard/AIRecommendations'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { Button } from '@/components/ui/Button'
import { MatchScoreCircle } from '@/components/jobs/MatchScoreCircle'
import { useRecommendations } from '@/hooks/useJobs'
import { createMockJob } from '@/lib/api'
import { cn, getInitials, stringToColor } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

// Dynamic greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Mock data — reflects the GovIntel AI candidate profile: 17+ yrs VP Digital & Advisory,
// government consulting, digital health, public finance, infrastructure, smart governance,
// power sector, policing, postal modernization, World Bank / ADB / JICA / AIIB.
const TREND_DATA = [
  { date: 'Jul 26', gov: 6, remote: 4, freelance: 3, multilateral: 5, total: 18 },
  { date: 'Jul 27', gov: 8, remote: 5, freelance: 4, multilateral: 6, total: 23 },
  { date: 'Jul 28', gov: 7, remote: 6, freelance: 5, multilateral: 7, total: 25 },
  { date: 'Jul 29', gov: 10, remote: 7, freelance: 5, multilateral: 8, total: 30 },
  { date: 'Jul 30', gov: 9, remote: 8, freelance: 6, multilateral: 9, total: 32 },
  { date: 'Jul 31', gov: 12, remote: 8, freelance: 7, multilateral: 10, total: 37 },
  { date: 'Aug 1', gov: 13, remote: 9, freelance: 8, multilateral: 11, total: 41 },
]

const RADAR_DATA = [
  { skill: 'Govt Consulting', required: 95, possessed: 96 },
  { skill: 'Digital Transform.', required: 92, possessed: 94 },
  { skill: 'Multilateral (WB/ADB)', required: 90, possessed: 92 },
  { skill: 'Procurement/Bid Mgmt', required: 85, possessed: 88 },
  { skill: 'PMU Setup', required: 88, possessed: 90 },
  { skill: 'AI Governance', required: 78, possessed: 70 },
]

type OpportunityCategory = 'all' | 'remote' | 'ncr_leadership' | 'freelance' | 'government' | 'multilateral'

interface Opportunity {
  id: string
  title: string
  company: string
  location: string
  opportunityType: 'full_time' | 'remote' | 'freelance'
  isGovernment: boolean
  isMultilateral: boolean
  matchScore: number
  valueInr?: number // for freelance/consulting assignments
  deadline?: string
  source: string
}

const OPPORTUNITIES: Opportunity[] = [
  { id: 'o1', title: 'Practice Head – Government Consulting', company: 'PwC India', location: 'Gurgaon, NCR', opportunityType: 'full_time', isGovernment: true, isMultilateral: false, matchScore: 96, source: 'linkedin' },
  { id: 'o2', title: 'Director, Public Sector Advisory', company: 'Deloitte India', location: 'Delhi, NCR', opportunityType: 'full_time', isGovernment: true, isMultilateral: false, matchScore: 94, source: 'naukri' },
  { id: 'o3', title: 'Associate Partner – Digital Transformation', company: 'EY India', location: 'Noida, NCR', opportunityType: 'full_time', isGovernment: true, isMultilateral: false, matchScore: 92, source: 'linkedin' },
  { id: 'o4', title: 'VP – Smart Governance Practice', company: 'KPMG India', location: 'Gurugram, NCR', opportunityType: 'full_time', isGovernment: true, isMultilateral: false, matchScore: 91, source: 'iimjobs' },
  { id: 'o5', title: 'Digital Health PMU Lead', company: 'World Bank', location: 'Washington DC (Remote-eligible)', opportunityType: 'remote', isGovernment: true, isMultilateral: true, matchScore: 97, source: 'worldbank' },
  { id: 'o6', title: 'Senior Governance Specialist', company: 'ADB', location: 'Remote — Asia Pacific', opportunityType: 'remote', isGovernment: true, isMultilateral: true, matchScore: 95, source: 'adb' },
  { id: 'o7', title: 'Public Financial Management Advisor', company: 'JICA', location: 'Remote — South Asia', opportunityType: 'remote', isGovernment: true, isMultilateral: true, matchScore: 90, source: 'reliefweb' },
  { id: 'o8', title: 'Infrastructure Investment Advisor', company: 'AIIB', location: 'Remote — Global', opportunityType: 'remote', isGovernment: true, isMultilateral: true, matchScore: 89, source: 'aiib' },
  { id: 'o9', title: 'Digital Transformation Advisor (Fractional)', company: 'GIZ', location: 'Remote — Global', opportunityType: 'remote', isGovernment: true, isMultilateral: false, matchScore: 87, source: 'giz' },
  { id: 'o10', title: 'Strategic Advisor – GovTech', company: 'FCDO', location: 'Remote — UK/Global', opportunityType: 'remote', isGovernment: true, isMultilateral: false, matchScore: 85, source: 'fcdo' },
  { id: 'o11', title: 'Power Sector Reform Consulting Assignment', company: 'ADB-funded State Programme', location: 'India (Project-based)', opportunityType: 'freelance', isGovernment: true, isMultilateral: true, matchScore: 93, valueInr: 1_800_000, deadline: '2026-08-15', source: 'talmix' },
  { id: 'o12', title: 'DPR & Bid Management Advisory', company: 'State Infrastructure Board', location: 'India (Project-based)', opportunityType: 'freelance', isGovernment: true, isMultilateral: false, matchScore: 88, valueInr: 650_000, deadline: '2026-08-10', source: 'cppp' },
  { id: 'o13', title: 'PMU Technical Advisory — Postal Modernization', company: 'Government of India', location: 'India (Project-based)', opportunityType: 'freelance', isGovernment: true, isMultilateral: false, matchScore: 90, valueInr: 950_000, deadline: '2026-08-22', source: 'gem' },
  { id: 'o14', title: 'Policing Modernization Technology Advisory', company: 'State Home Department', location: 'India (Project-based)', opportunityType: 'freelance', isGovernment: true, isMultilateral: false, matchScore: 84, valueInr: 400_000, deadline: '2026-09-01', source: 'cppp' },
  { id: 'o15', title: 'Public Finance Management Reform Consultant', company: 'World Bank / JICA', location: 'India (Project-based)', opportunityType: 'freelance', isGovernment: true, isMultilateral: true, matchScore: 95, valueInr: 2_600_000, deadline: '2026-08-12', source: 'worldbank' },
  { id: 'o16', title: 'Director, Digital Health Practice', company: 'Rodic Consultants', location: 'Delhi, NCR', opportunityType: 'full_time', isGovernment: true, isMultilateral: false, matchScore: 93, source: 'linkedin' },
  { id: 'o17', title: 'Partner – Public Sector Consulting', company: 'Primus Partners', location: 'Gurgaon, NCR', opportunityType: 'full_time', isGovernment: true, isMultilateral: false, matchScore: 92, source: 'iimjobs' },
  { id: 'o18', title: 'Practice Lead — Advisory (Infrastructure)', company: 'NISG', location: 'Faridabad, NCR', opportunityType: 'full_time', isGovernment: true, isMultilateral: false, matchScore: 86, source: 'naukri' },
  { id: 'o19', title: 'Smart Governance Advisory Lead', company: 'TCIL', location: 'Ghaziabad, NCR', opportunityType: 'full_time', isGovernment: true, isMultilateral: false, matchScore: 83, source: 'devnetjobs' },
  { id: 'o20', title: 'Digital Public Infrastructure Strategy Advisor', company: 'UNICEF', location: 'Remote — Global', opportunityType: 'remote', isGovernment: true, isMultilateral: true, matchScore: 82, source: 'unicef' },
]

const DEADLINES = OPPORTUNITIES
  .filter((o) => o.deadline)
  .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())

const PIPELINE_STAGES = [
  { label: 'Applied', count: 6, color: 'bg-blue-500' },
  { label: 'Screening', count: 3, color: 'bg-amber-500' },
  { label: 'Interview', count: 2, color: 'bg-purple-500' },
  { label: 'Offer', count: 1, color: 'bg-emerald-500' },
]

const CATEGORY_TABS: { id: OpportunityCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Top 20 Opportunities', icon: <Star className="h-3.5 w-3.5" /> },
  { id: 'remote', label: 'Top 10 Remote', icon: <Globe2 className="h-3.5 w-3.5" /> },
  { id: 'ncr_leadership', label: 'Top 10 Delhi NCR Leadership', icon: <Building2 className="h-3.5 w-3.5" /> },
  { id: 'freelance', label: 'Consulting Assignments', icon: <Briefcase className="h-3.5 w-3.5" /> },
  { id: 'government', label: 'Government', icon: <Landmark className="h-3.5 w-3.5" /> },
  { id: 'multilateral', label: 'Multilateral', icon: <Globe2 className="h-3.5 w-3.5" /> },
]

function filterOpportunities(category: OpportunityCategory): Opportunity[] {
  let rows = [...OPPORTUNITIES].sort((a, b) => b.matchScore - a.matchScore)
  switch (category) {
    case 'remote':
      rows = rows.filter((o) => o.opportunityType === 'remote')
      break
    case 'ncr_leadership':
      rows = rows.filter((o) => o.opportunityType === 'full_time')
      break
    case 'freelance':
      rows = rows.filter((o) => o.opportunityType === 'freelance')
      break
    case 'government':
      rows = rows.filter((o) => o.isGovernment)
      break
    case 'multilateral':
      rows = rows.filter((o) => o.isMultilateral)
      break
    default:
      break
  }
  const limit = category === 'all' ? 20 : 10
  return rows.slice(0, limit)
}

function formatInr(value: number): string {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)}Cr`
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)}L`
  return `₹${value.toLocaleString('en-IN')}`
}

const MOCK_RECENT_JOBS = [
  createMockJob({ id: '1', title: 'Digital Health PMU Lead', company: { name: 'World Bank' }, remoteType: 'remote', matchScore: { overall: 97, breakdown: { skills: 97, experience: 96, location: 95, seniority: 98, industry: 97, compensation: 94 }, matchedSkills: ['PMU Setup', 'Digital Health', 'World Bank Procurement'], missingSkills: [], reasoning: '', confidence: 0.98 } }),
  createMockJob({ id: '2', title: 'Practice Head – Government Consulting', company: { name: 'PwC India' }, location: 'Gurgaon, NCR', matchScore: { overall: 96, breakdown: { skills: 95, experience: 96, location: 100, seniority: 97, industry: 95, compensation: 93 }, matchedSkills: ['Government Consulting', 'Practice Head', 'Digital Transformation'], missingSkills: [], reasoning: '', confidence: 0.97 } }),
  createMockJob({ id: '3', title: 'Public Finance Management Reform Consultant', company: { name: 'World Bank / JICA' }, matchScore: { overall: 95, breakdown: { skills: 95, experience: 95, location: 90, seniority: 96, industry: 96, compensation: 96 }, matchedSkills: ['Public Finance', 'Procurement Advisory', 'Multilateral'], missingSkills: [], reasoning: '', confidence: 0.95 } }),
  createMockJob({ id: '4', title: 'Director, Public Sector Advisory', company: { name: 'Deloitte India' }, location: 'Delhi, NCR', matchScore: { overall: 94, breakdown: { skills: 93, experience: 94, location: 100, seniority: 95, industry: 93, compensation: 90 }, matchedSkills: ['Public Sector Advisory', 'Director', 'Government'], missingSkills: [], reasoning: '', confidence: 0.94 } }),
  createMockJob({ id: '5', title: 'Senior Governance Specialist', company: { name: 'ADB' }, remoteType: 'remote', matchScore: { overall: 95, breakdown: { skills: 94, experience: 95, location: 90, seniority: 95, industry: 96, compensation: 93 }, matchedSkills: ['Governance', 'ADB', 'Multilateral'], missingSkills: [], reasoning: '', confidence: 0.95 } }),
]

export default function DashboardPage() {
  const { data: recommendations, isLoading: recLoading } = useRecommendations(5)
  const [isSendingDigest, setIsSendingDigest] = useState(false)
  const [activeCategory, setActiveCategory] = useState<OpportunityCategory>('all')

  const handleSendDigest = async () => {
    setIsSendingDigest(true)
    await new Promise((r) => setTimeout(r, 1500))
    setIsSendingDigest(false)
    toast.success('Daily digest sent!', { description: '12 top opportunities delivered to your inbox.' })
  }

  const displayJobs = recommendations || MOCK_RECENT_JOBS.slice(0, 5)
  const visibleOpportunities = useMemo(() => filterOpportunities(activeCategory), [activeCategory])
  const totalRevenuePotential = useMemo(
    () => OPPORTUNITIES.filter((o) => o.valueInr).reduce((sum, o) => sum + (o.valueInr || 0), 0),
    []
  )

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">{getGreeting()}, Manoj</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You have <span className="font-semibold text-gold-600 dark:text-gold-400">3 new high-match opportunities</span> since the last discovery run.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => toast.info('Running discovery agent across all sources...')}
          >
            Run Discovery Agent
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={isSendingDigest}
            leftIcon={!isSendingDigest ? <Send className="h-3.5 w-3.5" /> : undefined}
            onClick={handleSendDigest}
          >
            Send Daily Digest
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="Total Opportunities"
          value={412}
          change={18}
          changeLabel="vs last week"
          icon={<Briefcase className="h-5 w-5" />}
          color="gold"
          index={0}
        />
        <StatsCard
          label="High Match (>80%)"
          value={41}
          change={11}
          changeLabel="alert threshold"
          icon={<Star className="h-5 w-5" />}
          color="green"
          index={1}
        />
        <StatsCard
          label="Leadership Positions"
          value={9}
          change={22}
          changeLabel="VP / Director / Partner"
          icon={<PlusCircle className="h-5 w-5" />}
          color="blue"
          index={2}
        />
        <StatsCard
          label="Revenue Potential"
          value={formatInr(totalRevenuePotential)}
          changeLabel="active consulting assignments"
          icon={<IndianRupee className="h-5 w-5" />}
          color="purple"
          index={3}
        />
      </div>

      {/* AI Recommendations */}
      <AIRecommendations jobs={displayJobs} isLoading={recLoading} />

      {/* Opportunity Command Center */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-3">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                activeCategory === tab.id
                  ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/30'
                  : 'text-muted-foreground hover:bg-muted border border-transparent'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="divide-y divide-border">
          {visibleOpportunities.map((opp) => {
            const initials = getInitials(opp.company)
            const bgColor = stringToColor(opp.company)
            return (
              <div key={opp.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted transition-colors group">
                <div
                  className="h-9 w-9 flex-shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: bgColor }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors truncate">
                    {opp.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    <p className="text-xs text-muted-foreground">{opp.company}</p>
                    <span className="text-muted-foreground">·</span>
                    <p className="text-xs text-muted-foreground">{opp.location}</p>
                    {opp.valueInr && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{formatInr(opp.valueInr)}</span>
                      </>
                    )}
                    {opp.deadline && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          due {new Date(opp.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="hidden sm:inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    {opp.source}
                  </span>
                  <MatchScoreCircle score={opp.matchScore} size="xs" />
                </div>
              </div>
            )
          })}
          {visibleOpportunities.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No opportunities in this category yet.</div>
          )}
        </div>
      </div>

      {/* Charts + Activity row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Trend Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Opportunity Volume</h3>
              <p className="text-xs text-muted-foreground">Last 7 days across sources</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              +18% this week
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--foreground)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="gov" stroke="#0A66C2" strokeWidth={2} dot={false} name="Government / NCR" />
              <Line type="monotone" dataKey="remote" stroke="#10B981" strokeWidth={2} dot={false} name="Remote" />
              <Line type="monotone" dataKey="freelance" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Consulting Assignments" />
              <Line type="monotone" dataKey="multilateral" stroke="#F59E0B" strokeWidth={2} dot={false} name="Multilateral" />
              <Line type="monotone" dataKey="total" stroke="#EF4444" strokeWidth={2.5} dot={false} name="Total" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <ActivityFeed />
      </div>

      {/* Upcoming Deadlines + Application Pipeline + Skills Radar */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upcoming Deadlines */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Upcoming Deadlines</h3>
              <p className="text-xs text-muted-foreground">Consulting assignment submission dates</p>
            </div>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="divide-y divide-border">
            {DEADLINES.map((d) => {
              const daysLeft = Math.ceil((new Date(d.deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <div key={d.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{d.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{d.company}</p>
                  </div>
                  <span className={cn('flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold',
                    daysLeft <= 7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  )}>
                    {daysLeft}d left
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Application Pipeline */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Application Pipeline</h3>
              <p className="text-xs text-muted-foreground">Applied → Screening → Interview → Offer</p>
            </div>
            <Link href="/applications">
              <Button variant="ghost" size="xs" rightIcon={<ExternalLink className="h-3 w-3" />}>View</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{stage.label}</span>
                  <span className="font-bold text-foreground">{stage.count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full rounded-full', stage.color)} style={{ width: `${(stage.count / PIPELINE_STAGES[0].count) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Radar */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-foreground">Weighted Score Coverage</h3>
            <p className="text-xs text-muted-foreground">Profile vs. GovIntel scoring model</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
              />
              <Radar
                name="Required"
                dataKey="required"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
              <Radar
                name="Possessed"
                dataKey="possessed"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
