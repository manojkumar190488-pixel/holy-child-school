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

// Mock data
const TREND_DATA = [
  { date: 'May 15', linkedin: 12, indeed: 8, naukri: 5, other: 3, total: 28 },
  { date: 'May 16', linkedin: 18, indeed: 10, naukri: 7, other: 4, total: 39 },
  { date: 'May 17', linkedin: 15, indeed: 9, naukri: 6, other: 5, total: 35 },
  { date: 'May 18', linkedin: 22, indeed: 14, naukri: 8, other: 3, total: 47 },
  { date: 'May 19', linkedin: 19, indeed: 11, naukri: 9, other: 6, total: 45 },
  { date: 'May 20', linkedin: 28, indeed: 16, naukri: 10, other: 4, total: 58 },
  { date: 'May 21', linkedin: 24, indeed: 13, naukri: 11, other: 7, total: 55 },
]

const RADAR_DATA = [
  { skill: 'Strategy', required: 90, possessed: 88 },
  { skill: 'Finance', required: 80, possessed: 75 },
  { skill: 'Leadership', required: 85, possessed: 92 },
  { skill: 'Analytics', required: 75, possessed: 70 },
  { skill: 'M&A', required: 70, possessed: 60 },
  { skill: 'Consulting', required: 95, possessed: 95 },
]

const MOCK_RECENT_JOBS = [
  createMockJob({ id: '1', matchScore: { overall: 94, breakdown: { skills: 95, experience: 92, location: 90, seniority: 96, industry: 93, compensation: 90 }, matchedSkills: ['Strategy', 'Leadership', 'M&A'], missingSkills: ['Salesforce'], reasoning: '', confidence: 0.95 } }),
  createMockJob({ id: '2', title: 'VP Strategy', company: { name: 'Boston Consulting Group' }, matchScore: { overall: 89, breakdown: { skills: 88, experience: 90, location: 85, seniority: 92, industry: 88, compensation: 85 }, matchedSkills: ['Strategy', 'Financial Modeling'], missingSkills: ['Python'], reasoning: '', confidence: 0.92 } }),
  createMockJob({ id: '3', title: 'Director of Operations', company: { name: 'Deloitte' }, matchScore: { overall: 78, breakdown: { skills: 75, experience: 80, location: 78, seniority: 80, industry: 76, compensation: 75 }, matchedSkills: ['Operations', 'Leadership'], missingSkills: ['Six Sigma', 'Lean'], reasoning: '', confidence: 0.84 } }),
  createMockJob({ id: '4', title: 'Head of Corporate Strategy', company: { name: 'Bain & Company' }, matchScore: { overall: 91, breakdown: { skills: 90, experience: 92, location: 88, seniority: 93, industry: 91, compensation: 88 }, matchedSkills: ['Strategy', 'Consulting', 'Leadership'], missingSkills: ['Data Science'], reasoning: '', confidence: 0.93 } }),
  createMockJob({ id: '5', title: 'Senior Manager, Transformation', company: { name: 'PricewaterhouseCoopers' }, matchScore: { overall: 82, breakdown: { skills: 80, experience: 84, location: 80, seniority: 84, industry: 82, compensation: 80 }, matchedSkills: ['Transformation', 'Change Management'], missingSkills: [], reasoning: '', confidence: 0.88 } }),
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
          <h2 className="text-2xl font-extrabold text-foreground">Good morning, Alexandra</h2>
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
          value={1247}
          change={12}
          changeLabel="vs last week"
          icon={<Briefcase className="h-5 w-5" />}
          color="gold"
          index={0}
        />
        <StatsCard
          label="High Match (>80%)"
          value={83}
          change={8}
          changeLabel="3 new today"
          icon={<Star className="h-5 w-5" />}
          color="green"
          index={1}
        />
        <StatsCard
          label="New Today"
          value={24}
          change={-5}
          changeLabel="across all sources"
          icon={<PlusCircle className="h-5 w-5" />}
          color="blue"
          index={2}
        />
        <StatsCard
          label="Applications"
          value={7}
          change={40}
          changeLabel="2 interviews scheduled"
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
              <Line type="monotone" dataKey="indeed" stroke="#2164F3" strokeWidth={2} dot={false} name="Indeed" />
              <Line type="monotone" dataKey="naukri" stroke="#FF7555" strokeWidth={2} dot={false} name="Naukri" />
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
