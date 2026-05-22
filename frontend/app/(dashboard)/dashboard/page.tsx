'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Star,
  PlusCircle,
  CheckCircle2,
  Send,
  RefreshCw,
  Clock,
  ExternalLink,
  Sparkles,
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
import { SourceBadge, RemoteBadge, ScoreBadge } from '@/components/ui/Badge'
import { MatchScoreCircle } from '@/components/jobs/MatchScoreCircle'
import { useRecommendations } from '@/hooks/useJobs'
import { createMockJob } from '@/lib/api'
import { formatRelativeDate, getInitials, stringToColor } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

// Dynamic greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Mock data — reflects actual candidate domain: digital transformation, e-governance, public health IT
const TREND_DATA = [
  { date: 'May 15', linkedin: 8, naukri: 5, devnet: 4, reliefweb: 3, total: 20 },
  { date: 'May 16', linkedin: 12, naukri: 6, devnet: 5, reliefweb: 4, total: 27 },
  { date: 'May 17', linkedin: 10, naukri: 7, devnet: 6, reliefweb: 5, total: 28 },
  { date: 'May 18', linkedin: 15, naukri: 8, devnet: 7, reliefweb: 4, total: 34 },
  { date: 'May 19', linkedin: 13, naukri: 9, devnet: 8, reliefweb: 6, total: 36 },
  { date: 'May 20', linkedin: 18, naukri: 10, devnet: 9, reliefweb: 5, total: 42 },
  { date: 'May 21', linkedin: 16, naukri: 11, devnet: 10, reliefweb: 7, total: 44 },
]

const RADAR_DATA = [
  { skill: 'Digital Transform.', required: 95, possessed: 95 },
  { skill: 'E-Governance', required: 90, possessed: 92 },
  { skill: 'Public Health IT', required: 85, possessed: 88 },
  { skill: 'PMU / TSU', required: 88, possessed: 90 },
  { skill: 'Stakeholder Mgmt', required: 90, possessed: 92 },
  { skill: 'Data Analytics', required: 80, possessed: 72 },
]

const MOCK_RECENT_JOBS = [
  createMockJob({ id: '1', title: 'Senior Digital Transformation Advisor', company: { name: 'World Bank Group' }, matchScore: { overall: 96, breakdown: { skills: 96, experience: 95, location: 94, seniority: 97, industry: 96, compensation: 93 }, matchedSkills: ['Digital Transformation', 'E-Governance', 'PMU'], missingSkills: [], reasoning: '', confidence: 0.97 } }),
  createMockJob({ id: '2', title: 'Chief Digital Officer – Health', company: { name: 'UNDP India' }, matchScore: { overall: 91, breakdown: { skills: 92, experience: 90, location: 90, seniority: 93, industry: 91, compensation: 88 }, matchedSkills: ['Public Health IT', 'E-Governance', 'Leadership'], missingSkills: ['DHIS2'], reasoning: '', confidence: 0.93 } }),
  createMockJob({ id: '3', title: 'Director, E-Governance Practice', company: { name: 'Deloitte Government' }, matchScore: { overall: 89, breakdown: { skills: 88, experience: 90, location: 88, seniority: 92, industry: 89, compensation: 86 }, matchedSkills: ['E-Governance', 'Digital Transformation', 'Consulting'], missingSkills: ['Salesforce Gov'], reasoning: '', confidence: 0.92 } }),
  createMockJob({ id: '4', title: 'PMU Lead – Health Systems', company: { name: 'Asian Development Bank' }, matchScore: { overall: 94, breakdown: { skills: 93, experience: 95, location: 90, seniority: 95, industry: 94, compensation: 91 }, matchedSkills: ['PMU', 'Health Systems', 'Donor Coordination'], missingSkills: [], reasoning: '', confidence: 0.96 } }),
  createMockJob({ id: '5', title: 'Senior Consultant, Digital Health', company: { name: 'ICF International' }, matchScore: { overall: 84, breakdown: { skills: 82, experience: 86, location: 82, seniority: 86, industry: 84, compensation: 82 }, matchedSkills: ['Digital Health', 'HIS', 'Consulting'], missingSkills: ['PEPFAR Experience'], reasoning: '', confidence: 0.88 } }),
]

export default function DashboardPage() {
  const { data: recommendations, isLoading: recLoading } = useRecommendations(5)
  const [isSendingDigest, setIsSendingDigest] = useState(false)

  const handleSendDigest = async () => {
    setIsSendingDigest(true)
    await new Promise((r) => setTimeout(r, 1500))
    setIsSendingDigest(false)
    toast.success('Daily digest sent!', { description: '12 top opportunities delivered to your inbox.' })
  }

  const displayJobs = recommendations || MOCK_RECENT_JOBS.slice(0, 5)

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">{getGreeting()}, Manoj</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You have <span className="font-semibold text-gold-600 dark:text-gold-400">3 new high-match opportunities</span> since yesterday.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => toast.info('Refreshing intelligence feed...')}
          >
            Refresh Feed
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
          value={847}
          change={18}
          changeLabel="vs last week"
          icon={<Briefcase className="h-5 w-5" />}
          color="gold"
          index={0}
        />
        <StatsCard
          label="High Match (>80%)"
          value={64}
          change={11}
          changeLabel="5 new today"
          icon={<Star className="h-5 w-5" />}
          color="green"
          index={1}
        />
        <StatsCard
          label="New Today"
          value={44}
          change={22}
          changeLabel="across 8 platforms"
          icon={<PlusCircle className="h-5 w-5" />}
          color="blue"
          index={2}
        />
        <StatsCard
          label="Active Applications"
          value={5}
          change={25}
          changeLabel="1 interview pending"
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="purple"
          index={3}
        />
      </div>

      {/* AI Recommendations */}
      <AIRecommendations jobs={displayJobs} isLoading={recLoading} />

      {/* Charts + Activity row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Trend Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Opportunity Volume</h3>
              <p className="text-xs text-muted-foreground">Last 7 days across platforms</p>
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
              <Line type="monotone" dataKey="linkedin" stroke="#0A66C2" strokeWidth={2} dot={false} name="LinkedIn" />
              <Line type="monotone" dataKey="naukri" stroke="#FF7555" strokeWidth={2} dot={false} name="Naukri" />
              <Line type="monotone" dataKey="devnet" stroke="#10B981" strokeWidth={2} dot={false} name="DevNet/ReliefWeb" />
              <Line type="monotone" dataKey="reliefweb" stroke="#8B5CF6" strokeWidth={2} dot={false} name="UN/World Bank" />
              <Line type="monotone" dataKey="total" stroke="#F59E0B" strokeWidth={2.5} dot={false} name="Total" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <ActivityFeed />
      </div>

      {/* Recent Opportunities + Skills Radar */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Jobs Table */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Recent Opportunities</h3>
              <p className="text-xs text-muted-foreground">Latest AI-matched jobs</p>
            </div>
            <Link href="/jobs">
              <Button variant="ghost" size="xs" rightIcon={<ExternalLink className="h-3 w-3" />}>
                View All
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {MOCK_RECENT_JOBS.map((job) => {
              const initials = getInitials(job.company.name)
              const bgColor = stringToColor(job.company.name)
              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted group"
                >
                  <div
                    className="h-9 w-9 flex-shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: bgColor }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors truncate">
                      {job.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{job.company.name}</p>
                      <span className="text-muted-foreground">·</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatRelativeDate(job.postedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <SourceBadge source={job.source} />
                    <MatchScoreCircle score={job.matchScore.overall} size="xs" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Skills Radar */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-foreground">Skills Match Radar</h3>
            <p className="text-xs text-muted-foreground">Your skills vs market demand</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
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
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Coverage score</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">87%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[87%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
