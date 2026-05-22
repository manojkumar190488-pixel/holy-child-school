'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  MapPin,
  Clock,
  Building2,
  Globe,
  Users,
  DollarSign,
  Sparkles,
  FileText,
  MessageSquare,
  ClipboardList,
  CheckCircle2,
  Linkedin,
  Star,
} from 'lucide-react'
import { MatchScoreCircle } from '@/components/jobs/MatchScoreCircle'
import { MatchedMissingSkills } from '@/components/jobs/SkillTags'
import { SourceBadge, RemoteBadge, SeniorityBadge, ScoreBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { JobCard } from '@/components/jobs/JobCard'
import { CoverLetterModal } from '@/components/ai/CoverLetterModal'
import { OutreachModal } from '@/components/ai/OutreachModal'
import { createMockJob } from '@/lib/api'
import {
  formatRelativeDate,
  formatDate,
  getScoreLabel,
  getInitials,
  stringToColor,
  formatSalary,
  getScoreTextColor,
} from '@/lib/utils'
import { toast } from 'sonner'

// Mock job data
const getMockJob = (id: string) =>
  createMockJob({
    id,
    title: 'Senior Strategy Consultant',
    description: `We are seeking a highly motivated Senior Strategy Consultant to join our global strategy practice. In this role, you will work closely with C-suite executives at Fortune 500 companies to develop and implement transformative strategies.

You will lead complex engagements across multiple industries, driving strategic insight and tangible business impact. The ideal candidate brings deep analytical capabilities, executive presence, and a track record of delivering measurable results.

This is an exceptional opportunity for a seasoned consultant looking to make a step-change in their career trajectory.`,
    requirements: [
      'MBA from a top-tier business school',
      '5-8 years of management consulting experience at a top-tier firm (MBB preferred)',
      'Demonstrated expertise in corporate strategy, M&A, and business transformation',
      'Experience managing cross-functional teams and senior client relationships',
      'Outstanding analytical, communication, and problem-solving skills',
      'Strong financial modeling and data analysis capabilities',
    ],
    responsibilities: [
      'Lead full-cycle consulting engagements from problem structuring to implementation',
      'Develop strategic frameworks and actionable recommendations for C-suite clients',
      'Build and manage client relationships at the executive level',
      'Mentor and develop junior team members',
      'Drive business development and proposal development activities',
      'Deliver presentations to boards and executive committees',
    ],
    skills: ['Strategy', 'Financial Modeling', 'M&A', 'Due Diligence', 'Leadership', 'Consulting', 'Excel', 'PowerPoint'],
    salary: { min: 180000, max: 220000, currency: 'USD', period: 'annually', isEstimated: false },
    industries: ['Consulting', 'Strategy', 'Finance'],
    benefits: ['Comprehensive health insurance', 'Annual bonus (30-40%)', 'Equity participation', '401(k) matching', 'Flexible work arrangements', 'Professional development budget'],
    matchScore: {
      overall: 94,
      breakdown: { skills: 95, experience: 92, location: 90, seniority: 96, industry: 94, compensation: 91 },
      matchedSkills: ['Strategy', 'Financial Modeling', 'Leadership', 'Consulting', 'M&A'],
      missingSkills: ['Due Diligence', 'Agile'],
      reasoning: 'Exceptional match on strategic consulting skills, seniority level, and industry background. Strong alignment with preferred compensation range. Minor gaps in due diligence and agile methodologies which can be quickly addressed.',
      confidence: 0.96,
    },
    aiSummary: 'This is an exceptional role at a top-tier consulting firm with strong compensation and growth potential. The 94% match score reflects deep alignment across your strategic consulting background, leadership experience, and target seniority level.',
    whyRelevant: 'Directly matches your strategy consulting background at senior level with strong leadership component.',
    recruiter: {
      name: 'Sarah Mitchell',
      title: 'Senior Recruiter, Consulting Practice',
      company: 'McKinsey & Company',
      email: 'sarah.mitchell@mckinsey.com',
      linkedinUrl: 'https://linkedin.com/in/sarah-mitchell-recruiter',
    },
    company: {
      name: 'McKinsey & Company',
      industry: 'Management Consulting',
      size: '30,000+',
      founded: 1926,
      headquarters: 'New York, NY',
      website: 'https://mckinsey.com',
      linkedinUrl: 'https://linkedin.com/company/mckinsey',
      description: "McKinsey & Company is a global management consulting firm that serves leading businesses, governments, and nonprofits. We help organizations build the capabilities, leadership, and culture to achieve and sustain their most important goals.",
    },
  })

const SIMILAR_JOBS = [
  createMockJob({ id: 'sim1', title: 'Strategy Manager', company: { name: 'BCG' }, matchScore: { overall: 89, breakdown: { skills: 88, experience: 90, location: 85, seniority: 92, industry: 88, compensation: 85 }, matchedSkills: ['Strategy', 'Leadership'], missingSkills: ['M&A'], reasoning: '', confidence: 0.91 } }),
  createMockJob({ id: 'sim2', title: 'Principal, Corporate Strategy', company: { name: 'Bain' }, matchScore: { overall: 86, breakdown: { skills: 85, experience: 87, location: 84, seniority: 88, industry: 86, compensation: 84 }, matchedSkills: ['Strategy', 'Consulting'], missingSkills: [], reasoning: '', confidence: 0.88 } }),
  createMockJob({ id: 'sim3', title: 'VP Strategy', company: { name: 'Oliver Wyman' }, matchScore: { overall: 82, breakdown: { skills: 80, experience: 84, location: 80, seniority: 84, industry: 82, compensation: 80 }, matchedSkills: ['Strategy'], missingSkills: ['Digital'], reasoning: '', confidence: 0.85 } }),
]

const ScoreBreakdownBar = ({
  label,
  value,
  max = 100,
}: {
  label: string
  value: number
  max?: number
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-bold ${getScoreTextColor(value)}`}>{value}%</span>
    </div>
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{
          background:
            value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444',
        }}
      />
    </div>
  </div>
)

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const job = getMockJob(jobId)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [showOutreach, setShowOutreach] = useState(false)

  const companyInitials = getInitials(job.company.name)
  const companyBgColor = stringToColor(job.company.name)

  const handleTrack = () => {
    toast.success('Added to Application Tracker', { description: 'Moved to "Interested" column.' })
  }

  return (
    <div className="space-y-5 animate-in">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </button>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-5 lg:col-span-2">
          {/* Job Header Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              {/* Company Logo */}
              <div
                className="h-16 w-16 flex-shrink-0 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md"
                style={{ backgroundColor: companyBgColor }}
              >
                {companyInitials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h1 className="text-xl font-extrabold text-foreground">{job.title}</h1>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <span className="font-semibold text-foreground">{job.company.name}</span>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </div>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatRelativeDate(job.postedAt)}
                      </div>
                    </div>
                  </div>
                  {/* Large Match Score */}
                  <MatchScoreCircle score={job.matchScore.overall} size="lg" showLabel />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <SourceBadge source={job.source} />
                  <RemoteBadge type={job.remoteType} />
                  <SeniorityBadge level={job.seniorityLevel} />
                  {job.salary && (
                    <div className="flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
                      <DollarSign className="h-3 w-3" />
                      {formatSalary(job.salary.min, job.salary.max, job.salary.currency, job.salary.period)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-2 pt-5 border-t border-border">
              <Button
                variant="primary"
                size="md"
                leftIcon={<ExternalLink className="h-4 w-4" />}
                onClick={() => window.open(job.sourceUrl, '_blank')}
              >
                Apply Now
              </Button>
              <Button
                variant="outline"
                size="md"
                leftIcon={isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                onClick={() => {
                  setIsBookmarked((p) => !p)
                  toast.success(isBookmarked ? 'Bookmark removed' : 'Job bookmarked!')
                }}
              >
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button
                variant="outline"
                size="md"
                leftIcon={<ClipboardList className="h-4 w-4" />}
                onClick={handleTrack}
              >
                Track Application
              </Button>
              <Button
                variant="outline"
                size="md"
                leftIcon={<FileText className="h-4 w-4" />}
                onClick={() => setShowCoverLetter(true)}
              >
                Cover Letter
              </Button>
              <Button
                variant="outline"
                size="md"
                leftIcon={<MessageSquare className="h-4 w-4" />}
                onClick={() => setShowOutreach(true)}
              >
                Outreach
              </Button>
            </div>
          </div>

          {/* AI Summary */}
          {job.aiSummary && (
            <div className="rounded-xl border border-gold-500/30 bg-gradient-to-br from-gold-500/10 to-transparent p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gold-100 dark:bg-gold-900/30">
                  <Sparkles className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground mb-1">AI Analysis</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{job.aiSummary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Why This Fits */}
          {job.matchScore.reasoning && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Why This Fits You
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {job.matchScore.reasoning}
              </p>
              <MatchedMissingSkills
                matchedSkills={job.matchScore.matchedSkills}
                missingSkills={job.matchScore.missingSkills}
              />
            </div>
          )}

          {/* Score Breakdown */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Match Score Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(job.matchScore.breakdown).map(([key, value]) => (
                <ScoreBreakdownBar
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={value as number}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <Star className="h-4 w-4 text-gold-500" />
              <p className="text-xs font-medium text-muted-foreground">
                AI confidence:{' '}
                <span className="text-foreground">
                  {Math.round(job.matchScore.confidence * 100)}%
                </span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Job Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Requirements + Responsibilities */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Responsibilities</h3>
              <ul className="space-y-2">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-500" />
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Benefits & Perks</h3>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit) => (
                  <span
                    key={benefit}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Company Info */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">About {job.company.name}</h3>
            <div className="space-y-3">
              {[
                { icon: <Building2 className="h-4 w-4" />, label: 'Industry', value: job.company.industry },
                { icon: <Users className="h-4 w-4" />, label: 'Company Size', value: job.company.size },
                { icon: <MapPin className="h-4 w-4" />, label: 'Headquarters', value: job.company.headquarters },
                { icon: <Clock className="h-4 w-4" />, label: 'Founded', value: job.company.founded?.toString() },
              ].map(
                ({ icon, label, value }) =>
                  value && (
                    <div key={label} className="flex items-center gap-3">
                      <div className="text-muted-foreground">{icon}</div>
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium text-foreground">{value}</p>
                      </div>
                    </div>
                  )
              )}
            </div>
            {job.company.description && (
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed line-clamp-4">
                {job.company.description}
              </p>
            )}
            {job.company.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gold-600 dark:text-gold-400 hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                Visit Website
              </a>
            )}
          </div>

          {/* Recruiter Info */}
          {job.recruiter && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Recruiter</h3>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {job.recruiter.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{job.recruiter.name}</p>
                  <p className="text-xs text-muted-foreground">{job.recruiter.title}</p>
                  <p className="text-xs text-muted-foreground">{job.recruiter.company}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {job.recruiter.linkedinUrl && (
                  <a
                    href={job.recruiter.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-[#0A66C2]/30 bg-[#0A66C2]/10 px-3 py-2 text-xs font-medium text-[#0A66C2] dark:text-blue-400 transition-colors hover:bg-[#0A66C2]/20"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    Connect on LinkedIn
                  </a>
                )}
                <Button
                  variant="outline"
                  size="xs"
                  fullWidth
                  onClick={() => setShowOutreach(true)}
                  leftIcon={<MessageSquare className="h-3 w-3" />}
                >
                  Draft Outreach
                </Button>
              </div>
            </div>
          )}

          {/* Similar Jobs */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Similar Opportunities</h3>
            <div className="space-y-3">
              {SIMILAR_JOBS.map((similar) => {
                const initials = getInitials(similar.company.name)
                const bg = stringToColor(similar.company.name)
                return (
                  <a
                    key={similar.id}
                    href={`/jobs/${similar.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div
                      className="h-8 w-8 flex-shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: bg }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {similar.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{similar.company.name}</p>
                    </div>
                    <ScoreBadge score={similar.matchScore.overall} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CoverLetterModal
        isOpen={showCoverLetter}
        onClose={() => setShowCoverLetter(false)}
        job={job}
      />
      <OutreachModal
        isOpen={showOutreach}
        onClose={() => setShowOutreach(false)}
        job={job}
        recruiter={job.recruiter}
      />
    </div>
  )
}
