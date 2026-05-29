'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Newspaper, Clock, Star, TrendingUp, Bell, Calendar, Zap,
  ArrowRight, MapPin, Building2, CheckCircle2, ExternalLink,
  Settings, RefreshCw, ChevronRight, Users, Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatsCard } from '@/components/dashboard/StatsCard'

interface DigestOpportunity {
  id: string
  rank: number
  title: string
  company: string
  location: string
  type: string
  matchScore: number
  salary?: string
  postedAgo: string
  tags: string[]
  isNew?: boolean
  isUrgent?: boolean
}

interface MarketInsight {
  id: string
  title: string
  summary: string
  trend: 'up' | 'down' | 'neutral'
  trendValue: string
  icon: React.ReactNode
  color: string
}

interface RecruiterActivity {
  id: string
  name: string
  company: string
  jobsPosted: number
  role: string
  postedAgo: string
  color: string
}

const TOP_OPPORTUNITIES: DigestOpportunity[] = [
  { id: 'd1', rank: 1, title: 'VP, Digital Transformation Programs', company: 'World Bank Group', location: 'Washington DC / Remote', type: 'International Development', matchScore: 96, salary: '$180K–$220K', postedAgo: '2h ago', tags: ['PMU', 'Digital Governance'], isNew: true },
  { id: 'd2', rank: 2, title: 'PMU Director – Digital Health', company: 'Asian Development Bank', location: 'Manila / Hybrid', type: 'Development Finance', matchScore: 95, salary: '$150K–$190K', postedAgo: '4h ago', tags: ['PMU', 'Digital Health'], isNew: true },
  { id: 'd3', rank: 3, title: 'Country Director, Digital Health', company: 'UNDP India', location: 'New Delhi', type: 'UN Agency', matchScore: 93, salary: '₹55–70L', postedAgo: '6h ago', tags: ['Health IT', 'UN'], isNew: true },
  { id: 'd4', rank: 4, title: 'National IT Advisor – Health Systems', company: 'WHO India', location: 'New Delhi', type: 'UN Agency', matchScore: 91, postedAgo: '8h ago', tags: ['HIS', 'ABDM', 'Public Health'] },
  { id: 'd5', rank: 5, title: 'Principal Consultant, E-Governance', company: 'Deloitte Government', location: 'Delhi / Hybrid', type: 'Management Consulting', matchScore: 89, salary: '₹45–55L', postedAgo: '10h ago', tags: ['E-Governance', 'MeitY'] },
  { id: 'd6', rank: 6, title: 'Senior Advisor, Digital Health Strategy', company: 'Gates Foundation', location: 'Remote / Seattle', type: 'Philanthropy', matchScore: 90, salary: '$120K–$150K', postedAgo: '12h ago', tags: ['Digital Health', 'Strategy'], isUrgent: true },
  { id: 'd7', rank: 7, title: 'Director, Health Informatics Practice', company: 'ICF International', location: 'Remote / Washington DC', type: 'Development Consulting', matchScore: 88, salary: '$130K–$160K', postedAgo: '14h ago', tags: ['Health Informatics', 'HIS'] },
  { id: 'd8', rank: 8, title: 'Digital Transformation Lead', company: 'GIZ India', location: 'New Delhi', type: 'Bilateral Agency', matchScore: 88, salary: '₹40–50L', postedAgo: '16h ago', tags: ['Digital Transformation', 'Development'] },
  { id: 'd9', rank: 9, title: 'Practice Lead, Digital Public Infrastructure', company: 'EY India', location: 'Delhi / Mumbai', type: 'Big 4 Consulting', matchScore: 87, salary: '₹50–65L', postedAgo: '18h ago', tags: ['DPI', 'E-Governance'] },
  { id: 'd10', rank: 10, title: 'Senior Manager, Health Technology', company: 'PwC India', location: 'Gurugram', type: 'Big 4 Consulting', matchScore: 86, salary: '₹45–58L', postedAgo: '20h ago', tags: ['Health Tech', 'Consulting'] },
  { id: 'd11', rank: 11, title: 'Associate Director, Global Health IT', company: 'Accenture Federal', location: 'Remote / DC', type: 'Tech Consulting', matchScore: 85, salary: '$115K–$145K', postedAgo: '1d ago', tags: ['Global Health', 'IT Advisory'] },
  { id: 'd12', rank: 12, title: 'Public Health Program Manager', company: 'UNICEF India', location: 'New Delhi', type: 'UN Agency', matchScore: 85, postedAgo: '1d ago', tags: ['PMU', 'Public Health', 'UN'] },
  { id: 'd13', rank: 13, title: 'Senior Consultant, International Development', company: 'Dalberg Advisors', location: 'New Delhi', type: 'Development Consulting', matchScore: 84, salary: '₹38–48L', postedAgo: '1d ago', tags: ['Development', 'Strategy'] },
  { id: 'd14', rank: 14, title: 'Chief Digital Officer – e-Health', company: 'Apollo Hospitals Group', location: 'Hyderabad / Hybrid', type: 'Healthcare', matchScore: 83, salary: '₹55–75L', postedAgo: '1d ago', tags: ['e-Health', 'Digital Transformation'] },
  { id: 'd15', rank: 15, title: 'Program Director, Digital Governance', company: 'KPMG India', location: 'Delhi / Hybrid', type: 'Big 4 Consulting', matchScore: 83, salary: '₹42–55L', postedAgo: '1d ago', tags: ['Governance', 'Digital'] },
  { id: 'd16', rank: 16, title: 'Senior Consultant, Smart Cities', company: 'Infosys BPM', location: 'Bangalore / Remote', type: 'IT Services', matchScore: 81, salary: '₹35–45L', postedAgo: '2d ago', tags: ['Smart Cities', 'E-Governance'] },
  { id: 'd17', rank: 17, title: 'Technical Advisor, Digital Health', company: 'JSI Research & Training', location: 'Remote / New Delhi', type: 'Development Consulting', matchScore: 80, salary: '$95K–$115K', postedAgo: '2d ago', tags: ['Digital Health', 'USAID'] },
  { id: 'd18', rank: 18, title: 'Project Director, Health IT Systems', company: 'TCS Government', location: 'New Delhi', type: 'IT Services', matchScore: 79, salary: '₹30–40L', postedAgo: '2d ago', tags: ['HIS', 'Government IT'] },
  { id: 'd19', rank: 19, title: 'E-Health Programme Manager', company: 'NIC / NICSI', location: 'New Delhi', type: 'Government', matchScore: 77, postedAgo: '2d ago', tags: ['NIC', 'E-Health', 'Government'] },
  { id: 'd20', rank: 20, title: 'Senior Associate, Digital Inclusion', company: 'Omidyar Network', location: 'Bangalore / Remote', type: 'Impact Investing', matchScore: 74, salary: '₹32–42L', postedAgo: '2d ago', tags: ['Digital Inclusion', 'DPI'] },
]

const MARKET_INSIGHTS: MarketInsight[] = [
  {
    id: 'i1',
    title: 'AI in Governance is Surging',
    summary: 'World Bank and UNDP have posted 34% more AI/digital governance roles this month. Roles combining PMU experience with AI implementation are commanding 28% salary premiums.',
    trend: 'up',
    trendValue: '+34% new roles',
    icon: <Zap className="h-4 w-4" />,
    color: 'from-gold-500/20 to-gold-400/10 border-gold-500/20',
  },
  {
    id: 'i2',
    title: 'Health Systems Digitization Wave',
    summary: 'ABDM roll-out is driving demand for experienced Health IT advisors. WHO, UNICEF and bilateral agencies are racing to build health digitization teams ahead of COP2026.',
    trend: 'up',
    trendValue: '+22% demand',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'from-emerald-500/20 to-emerald-400/10 border-emerald-500/20',
  },
  {
    id: 'i3',
    title: 'World Bank FY26 Project Pipeline',
    summary: 'World Bank India has 12 new digital and health projects entering preparation. Expected to generate 80+ advisory roles across PMU, M&E, and technical domains over the next 6 months.',
    trend: 'up',
    trendValue: '12 new projects',
    icon: <Globe className="h-4 w-4" />,
    color: 'from-blue-500/20 to-blue-400/10 border-blue-500/20',
  },
]

const RECRUITER_ACTIVITY: RecruiterActivity[] = [
  { id: 'rec1', name: 'Priya Sharma', company: 'Deloitte Government', jobsPosted: 4, role: 'Partner, Digital & Government', postedAgo: '3h ago', color: '#0A66C2' },
  { id: 'rec2', name: 'Rajesh Verma', company: 'World Bank Group', jobsPosted: 2, role: 'HR Business Partner', postedAgo: '6h ago', color: '#1A56DB' },
  { id: 'rec3', name: 'Anita Nair', company: 'UNDP India', jobsPosted: 3, role: 'Talent Acquisition Lead', postedAgo: '8h ago', color: '#0072BC' },
  { id: 'rec4', name: 'Vikram Singh', company: 'EY India', jobsPosted: 5, role: 'Senior Recruiter – Consulting', postedAgo: '12h ago', color: '#FFE600' },
  { id: 'rec5', name: 'Meera Pillai', company: 'GIZ India', jobsPosted: 2, role: 'HR Manager', postedAgo: '1d ago', color: '#009A4E' },
]

const scoreColor = (score: number) =>
  score >= 90 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
  score >= 80 ? 'text-gold-600 dark:text-gold-400 bg-gold-500/10 border-gold-500/20' :
  'text-amber-500 bg-amber-500/10 border-amber-500/20'

export default function DigestPage() {
  const [isSending, setIsSending] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const visibleOpportunities = showAll ? TOP_OPPORTUNITIES : TOP_OPPORTUNITIES.slice(0, 10)

  const handleSendDigest = async () => {
    setIsSending(true)
    await new Promise(r => setTimeout(r, 1500))
    setIsSending(false)
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 border border-gold-500/20">
              <Newspaper className="h-4 w-4 text-gold-500" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-foreground">Executive Digest</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Friday, 23 May 2026</span>
                <span className="text-muted-foreground">·</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Delivered 8:00 AM IST
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Settings className="h-3.5 w-3.5" />
            Schedule Settings
          </button>
          <button
            onClick={handleSendDigest}
            disabled={isSending}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
              isSending ? 'bg-gold-500/50 cursor-not-allowed text-navy-900' : 'bg-gold-500 hover:bg-gold-400 text-navy-900'
            )}
          >
            {isSending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
            {isSending ? 'Sending...' : 'Send Now'}
          </button>
        </div>
      </div>

      {/* AI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gold-500/20 bg-gradient-to-br from-gold-500/5 to-transparent p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-gold-500" />
          <span className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider">AI Market Summary</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          Today&apos;s market is particularly strong for your profile. The World Bank&apos;s FY26 digital governance pipeline has generated <span className="font-semibold text-gold-600 dark:text-gold-400">3 new VP-level roles</span> with excellent PMU/digital transformation alignment. ABDM expansion is driving a surge in Public Health IT advisory demand — UNDP, WHO, and UNICEF have posted 9 combined roles this week. Bilateral agencies (GIZ, USAID) are actively seeking digital transformation leads with your exact background. Top opportunity of the day: <span className="font-semibold text-foreground">World Bank VP Digital Transformation (96% match)</span> — deadline June 2.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="New Opportunities" value={20} change={22} changeLabel="vs yesterday" icon={<Newspaper className="h-5 w-5" />} color="gold" index={0} />
        <StatsCard label="High Match (>85%)" value={11} change={38} changeLabel="5 above 90%" icon={<Star className="h-5 w-5" />} color="green" index={1} />
        <StatsCard label="Avg Match Score" value={85} suffix="%" change={4} changeLabel="best day this week" icon={<TrendingUp className="h-5 w-5" />} color="blue" index={2} />
        <StatsCard label="Recruiter Activity" value={5} changeLabel="posted jobs today" icon={<Users className="h-5 w-5" />} color="purple" index={3} />
      </div>

      {/* Top Opportunities List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Top 20 Opportunities Today</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Ranked by AI match score — personalized for your profile</p>
          </div>
          <span className="text-xs text-muted-foreground">{TOP_OPPORTUNITIES.length} total</span>
        </div>
        <div className="divide-y divide-border">
          {visibleOpportunities.map((opp, i) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors group"
            >
              {/* Rank */}
              <span className={cn('flex-shrink-0 w-6 text-xs font-bold text-center', opp.rank <= 3 ? 'text-gold-600 dark:text-gold-400' : 'text-muted-foreground')}>
                {opp.rank}
              </span>

              {/* Company Icon */}
              <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-400/10 border border-blue-500/20 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-blue-400" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors truncate">
                    {opp.title}
                  </p>
                  {opp.isNew && (
                    <span className="flex-shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">NEW</span>
                  )}
                  {opp.isUrgent && (
                    <span className="flex-shrink-0 rounded-full bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-500">URGENT</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">{opp.company}</span>
                  <span className="text-muted-foreground">·</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {opp.location}
                  </div>
                  {opp.salary && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{opp.salary}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {opp.tags.map(tag => (
                    <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] text-muted-foreground">{opp.type}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end mt-0.5">
                    <Clock className="h-3 w-3" />
                    {opp.postedAgo}
                  </div>
                </div>
                <span className={cn('flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold', scoreColor(opp.matchScore))}>
                  <Zap className="h-3 w-3" />
                  {opp.matchScore}%
                </span>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        {!showAll && (
          <div className="border-t border-border p-4 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center gap-2 mx-auto text-sm font-semibold text-gold-600 dark:text-gold-400 hover:underline"
            >
              Show all 20 opportunities
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Market Insights */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Market Insights</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {MARKET_INSIGHTS.map((insight, i) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn('rounded-xl border bg-gradient-to-br p-5', insight.color)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border">
                  {insight.icon}
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  {insight.trendValue}
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground mb-2">{insight.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.summary}</p>
              <button className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-foreground hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                Read full analysis
                <ArrowRight className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recruiter Activity + Schedule Card */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recruiter Activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold text-foreground">Recruiter Activity Today</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Recruiters who posted jobs matching your profile</p>
          </div>
          <div className="divide-y divide-border">
            {RECRUITER_ACTIVITY.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted transition-colors group"
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: rec.color === '#FFE600' ? '#1A1A1A' : rec.color }}
                >
                  {rec.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">{rec.name}</p>
                  <p className="text-xs text-muted-foreground">{rec.role} · {rec.company}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground">{rec.jobsPosted}</p>
                  <p className="text-[11px] text-muted-foreground">jobs · {rec.postedAgo}</p>
                </div>
                <button className="flex-shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-card hover:text-foreground transition-colors">
                  Connect
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Schedule Settings Card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4 text-gold-500" />
            <h3 className="text-sm font-bold text-foreground">Digest Schedule</h3>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">Morning Digest</span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Daily at 8:00 AM IST</p>
            </div>
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">Evening Summary</span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Daily at 7:00 PM IST</p>
            </div>
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">Urgent Alerts</span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Instant — match &gt;90%</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Delivery channel</span>
              <span className="font-semibold text-foreground">Email + In-app</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Min match score</span>
              <span className="font-semibold text-gold-600 dark:text-gold-400">74%+</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Jobs per digest</span>
              <span className="font-semibold text-foreground">Up to 20</span>
            </div>
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors">
            <Settings className="h-3.5 w-3.5" />
            Manage Schedule
          </button>
        </div>
      </div>
    </div>
  )
}
