'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  BookOpen,
  Star,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Target,
  Building2,
  Brain,
  Trophy,
  ArrowRight,
  Lightbulb,
  MessageSquare,
} from 'lucide-react'
import { cn, copyToClipboard } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────
type QuestionCategory =
  | 'competency'
  | 'technical'
  | 'leadership'
  | 'situational'
  | 'company'
  | 'strategic'

interface PrepQuestion {
  id: string
  category: QuestionCategory
  question: string
  hint: string
  starExample?: {
    situation: string
    task: string
    action: string
    result: string
  }
  tips: string[]
}

// ─── Data ─────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<QuestionCategory, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  competency: {
    label: 'Competency',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    icon: <Brain className="h-3.5 w-3.5" />,
  },
  technical: {
    label: 'Technical',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
    icon: <Target className="h-3.5 w-3.5" />,
  },
  leadership: {
    label: 'Leadership',
    color: 'text-gold-600 dark:text-gold-400',
    bg: 'bg-gold-100 dark:bg-gold-900/30 border-gold-200 dark:border-gold-800',
    icon: <Trophy className="h-3.5 w-3.5" />,
  },
  situational: {
    label: 'Situational',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    icon: <Lightbulb className="h-3.5 w-3.5" />,
  },
  company: {
    label: 'Company Fit',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800',
    icon: <Building2 className="h-3.5 w-3.5" />,
  },
  strategic: {
    label: 'Strategic',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800',
    icon: <Star className="h-3.5 w-3.5" />,
  },
}

const PREP_QUESTIONS: PrepQuestion[] = [
  {
    id: 'q1',
    category: 'leadership',
    question: 'Tell me about a time you led a complex digital transformation program for a government client. What were the key challenges and how did you manage stakeholder resistance?',
    hint: 'Focus on your PMU/TSU leadership experience and multi-stakeholder management.',
    starExample: {
      situation: 'Leading a state-level e-Governance transformation project with 18 departments, ₹150Cr budget, and conflicting political priorities.',
      task: 'Establish a PMU, align 200+ stakeholders, and deliver a unified citizen services portal within 18 months.',
      action: 'Created a governance framework with tiered steering committees, deployed RACI matrix, facilitated weekly cross-departmental workshops, and used data dashboards to demonstrate progress to skeptical IAS officials.',
      result: 'Delivered the portal 2 months ahead of schedule, 15% under budget. Citizen service delivery improved by 40%. Framework adopted as a state-wide standard.',
    },
    tips: [
      'Quantify impact — mention budget size, team size, timeline',
      'Highlight specific resistance you overcame (bureaucratic inertia, IT dept silos)',
      'Mention donor/ministry alignment if applicable',
      'Emphasize your stakeholder mapping approach',
    ],
  },
  {
    id: 'q2',
    category: 'technical',
    question: 'Walk us through your experience with Health Information Systems and digital health infrastructure. How have you approached HIS implementation in resource-constrained settings?',
    hint: 'Refer to HMIS/DHIS2 deployments, NHM work, or health sector digitization programs.',
    starExample: {
      situation: 'State Health Department lacked a unified HMIS across 500+ health facilities, leading to data gaps and delayed policy decisions.',
      task: 'Deploy and standardize a Health Information System with real-time reporting for 12 districts.',
      action: 'Conducted readiness assessment, selected open-source DHIS2, customized data elements to NHM requirements, trained 800+ health workers, and implemented data quality assurance protocols.',
      result: 'Achieved 87% facility reporting compliance (up from 34%), data turnaround reduced from 30 days to 48 hours. Integrated with national HMIS dashboard.',
    },
    tips: [
      'Mention specific platforms: DHIS2, HMIS, ABDM, eSanjeevani',
      'Discuss capacity building and change management',
      'Highlight M&E frameworks you used',
      'Reference compliance with NHM/MoHFW standards',
    ],
  },
  {
    id: 'q3',
    category: 'competency',
    question: 'Describe your experience managing a World Bank or multilateral donor-funded project. How did you handle fiduciary requirements and reporting obligations?',
    hint: 'Discuss procurement, disbursement conditions, aide-memoires, and donor coordination.',
    starExample: {
      situation: 'Appointed as PMU Lead for a $45M World Bank-funded urban governance project with strict procurement and reporting milestones.',
      task: 'Ensure full compliance with World Bank fiduciary standards while maintaining project velocity.',
      action: 'Built a dedicated procurement cell following WB guidelines, maintained a disbursement milestone tracker, organized quarterly aide-memoire sessions, and created real-time dashboards for the task team leader.',
      result: 'All 8 disbursement triggers met on time. Zero procurement irregularities flagged across 3 supervision missions. Project rated "Satisfactory" in all ISR assessments.',
    },
    tips: [
      'Use correct terminology: ISR, aide-mémoire, procurement plan, DLI',
      'Mention specific World Bank/ADB guidelines (Procurement Regulations 2016)',
      'Highlight your relationship with Task Team Leader (TTL)',
      'Discuss how you handled delays or scope changes',
    ],
  },
  {
    id: 'q4',
    category: 'strategic',
    question: 'How do you approach building an AI governance framework for a public sector client? What are the key ethical and implementation considerations?',
    hint: 'Show awareness of AI policy landscape: DPDP Act, NITI Aayog AI framework, EU AI Act principles.',
    starExample: {
      situation: 'State government wanted to deploy AI in citizen service delivery and policing but had no governance framework.',
      task: 'Develop an AI governance policy and implementation roadmap balancing innovation with accountability.',
      action: 'Benchmarked 12 global AI governance frameworks, conducted stakeholder consultations with departments and civil society, designed a tiered risk classification system, and drafted an AI ethics charter aligned with NITI Aayog\'s Responsible AI principles.',
      result: 'Framework approved by cabinet and adopted by 6 departments. Recognized by NASSCOM as a model state-level AI policy.',
    },
    tips: [
      'Reference NITI Aayog, MeitY, Digital India frameworks',
      'Mention data privacy (DPDP Act 2023) and consent architecture',
      'Discuss responsible AI principles: transparency, accountability, fairness',
      'Show awareness of algorithmic bias in public sector contexts',
    ],
  },
  {
    id: 'q5',
    category: 'situational',
    question: 'You join a consulting engagement and discover the client\'s existing PMU is dysfunctional — poor governance, missed milestones, team conflicts. How do you turn it around?',
    hint: 'Demonstrate diagnostic ability, change management skills, and political savvy.',
    starExample: {
      situation: 'Inherited a 2-year delayed NeGD project with a demoralized team, unclear KPIs, and fractured client relationships.',
      task: 'Stabilize the PMU and recover the project to get back on track within 90 days.',
      action: 'Conducted a rapid 2-week diagnostic, co-created a recovery plan with the client, restructured governance with clear RACI, implemented weekly progress rituals, and personally rebuilt trust with the ministry secretary.',
      result: '90-day recovery plan delivered 6 of 8 critical milestones. Team morale index improved from 3.2 to 7.8/10. Project extended and expanded with additional funding.',
    },
    tips: [
      'Show you diagnose before prescribing — listen first',
      'Emphasize quick wins in first 30 days',
      'Highlight stakeholder re-engagement strategy',
      'Mention how you protected team morale during crisis',
    ],
  },
  {
    id: 'q6',
    category: 'company',
    question: 'Why are you interested in this organization specifically, and what do you bring that others won\'t?',
    hint: 'Research the organization\'s current programs, challenges, and strategic priorities.',
    tips: [
      'Reference specific ongoing programs or initiatives of the organization',
      'Connect your domain expertise directly to their mandate',
      'Show you understand their operating model (bilateral vs multilateral, consulting vs implementation)',
      'Highlight your unique combination: government + health + digital + donor experience',
      'Prepare a 60-second narrative on your "unfair advantage"',
    ],
  },
  {
    id: 'q7',
    category: 'leadership',
    question: 'Describe your approach to building and managing high-performing, diverse consulting teams — especially in government/development sector settings.',
    hint: 'Government consulting teams often include IAS/IPS officials, domain experts, and external consultants — managing this mix requires finesse.',
    starExample: {
      situation: 'Leading a 22-member team across 4 states with a mix of national consultants, government secondees, and international technical advisors.',
      task: 'Create unified team culture and delivery standards despite varied organizational loyalties and compensation structures.',
      action: 'Implemented structured onboarding, created a team charter, established "1-team" culture through shared rituals, used individual development plans, and held fortnightly retrospectives.',
      result: 'Team retention at 94% over 3 years. 4 team members promoted to leadership roles. Delivery quality rated "Excellent" in 6 consecutive client reviews.',
    },
    tips: [
      'Mention how you handle government-private sector hybrid teams',
      'Discuss remote team management in multi-state programs',
      'Share how you develop junior consultants',
      'Highlight cross-cultural competence if relevant',
    ],
  },
  {
    id: 'q8',
    category: 'technical',
    question: 'How do you approach designing a Monitoring & Evaluation (M&E) framework for a large government program? What are the critical success factors?',
    hint: 'Shows your ability to move beyond activity-based M&E to results-based management.',
    starExample: {
      situation: 'A national health program had an M&E framework focused only on inputs and activities, with no outcome measurement.',
      task: 'Redesign the M&E system to track outcomes and enable real-time adaptive management.',
      action: 'Developed a Theory of Change, redesigned the results framework with SMART indicators, built a real-time MIS dashboard, trained 300+ district officers in data collection, and created monthly analytical reports for program management.',
      result: 'Program pivoted strategy twice based on M&E insights, saving ₹28Cr in resource allocation. Framework cited as best practice in WHO India annual report.',
    },
    tips: [
      'Reference Theory of Change, Logframe, Results-Based Management',
      'Mention data quality assessments (RDQA, SIMS)',
      'Discuss how M&E insights drove adaptive management decisions',
      'Mention experience with MIS tools: HMIS, DHIS2, custom dashboards',
    ],
  },
]

const COMPANY_RESEARCH_TIPS = [
  {
    org: 'World Bank Group',
    tips: [
      'Study their Country Partnership Framework for India — align your narrative to it',
      'Reference specific projects: NLTA, DPL, IPF operations you can add value to',
      'Understand safeguards policies and fiduciary requirements',
      'Know key country directors and sector leads',
      'Study their Digital Development Strategy 2022-2025',
    ],
  },
  {
    org: 'UNDP India',
    tips: [
      'Understand UN Sustainable Development Cooperation Framework for India',
      'Know UNDP\'s Accelerator Labs and innovation portfolio',
      'Reference India\'s VNR progress on relevant SDGs',
      'Study their Governance & Peacebuilding cluster priorities',
      'Know UNDP\'s procurement processes and NPSA/ICA contracts',
    ],
  },
  {
    org: 'Deloitte Government & Public Services',
    tips: [
      'Research their Government & Public Services practice focus areas',
      'Know their key government contracts (MeitY, NIC, state projects)',
      'Understand their "Human Capital" and "Future of Government" thought leadership',
      'Reference specific delivery frameworks they use: Agile Government, Cloud First',
      'Know their key partners and geography priorities',
    ],
  },
  {
    org: 'Asian Development Bank',
    tips: [
      'Study ADB Strategy 2030 — especially Governance & Institutional Capacity',
      'Know their India Resident Mission portfolio and sector priorities',
      'Understand TA (Technical Assistance) vs Loan projects distinction',
      'Reference ADB\'s Procurement Regulations and project administration',
      'Know their safeguards framework and social development priorities',
    ],
  },
]

const KEY_PHRASES = [
  { phrase: 'Results-based management', context: 'M&E, donor frameworks' },
  { phrase: 'Theory of Change', context: 'Program design, M&E' },
  { phrase: 'Aide-mémoire', context: 'World Bank/multilateral projects' },
  { phrase: 'Disbursement-linked indicators (DLIs)', context: 'PforR operations' },
  { phrase: 'Fiduciary risk assessment', context: 'Donor accountability' },
  { phrase: 'RACI matrix', context: 'PMU governance, stakeholder clarity' },
  { phrase: 'Adaptive management', context: 'M&E-informed pivots' },
  { phrase: 'Country systems alignment', context: 'Donor-government harmonization' },
  { phrase: 'Capacity building & sustainability', context: 'All development sector roles' },
  { phrase: 'Digital Public Infrastructure (DPI)', context: 'Tech modernization roles' },
  { phrase: 'Human-centered design', context: 'Citizen services, e-governance' },
  { phrase: 'Interoperability', context: 'HIS, digital health, e-gov platforms' },
]

// ─── Sub-components ────────────────────────────────────────────

function CategoryBadge({ category }: { category: QuestionCategory }) {
  const config = CATEGORY_CONFIG[category]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold', config.bg, config.color)}>
      {config.icon}
      {config.label}
    </span>
  )
}

function StarCard({ star }: { star: NonNullable<PrepQuestion['starExample']> }) {
  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/30 overflow-hidden">
      <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
        {[
          { key: 'situation', label: 'S — Situation', value: star.situation, color: 'text-blue-600 dark:text-blue-400' },
          { key: 'task', label: 'T — Task', value: star.task, color: 'text-amber-600 dark:text-amber-400' },
          { key: 'action', label: 'A — Action', value: star.action, color: 'text-emerald-600 dark:text-emerald-400' },
          { key: 'result', label: 'R — Result', value: star.result, color: 'text-purple-600 dark:text-purple-400' },
        ].map(({ key, label, value, color }) => (
          <div key={key} className="p-3.5">
            <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-1', color)}>{label}</p>
            <p className="text-xs text-foreground leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuestionCard({ question, index }: { question: PrepQuestion; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopySTAR = async () => {
    if (!question.starExample) return
    const { situation, task, action, result } = question.starExample
    const text = `SITUATION:\n${situation}\n\nTASK:\n${task}\n\nACTION:\n${action}\n\nRESULT:\n${result}`
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded((p) => !p)}
        className="w-full text-left p-5 hover:bg-muted/30 transition-colors group"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground mt-0.5">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <CategoryBadge category={question.category} />
            </div>
            <p className="text-sm font-semibold text-foreground leading-relaxed">{question.question}</p>
            {question.hint && (
              <p className="mt-1.5 text-xs text-muted-foreground">{question.hint}</p>
            )}
          </div>
          <div className="flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
              {/* STAR Example */}
              {question.starExample && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-foreground">Sample STAR Answer</p>
                    <button
                      onClick={handleCopySTAR}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <StarCard star={question.starExample} />
                </div>
              )}

              {/* Tips */}
              {question.tips.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-foreground mb-2">Key Tips</p>
                  <ul className="space-y-1.5">
                    {question.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-gold-500" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────

type Tab = 'questions' | 'company' | 'phrases' | 'strategy'

export default function InterviewPrepPage() {
  const [activeTab, setActiveTab] = useState<Tab>('questions')
  const [filterCategory, setFilterCategory] = useState<QuestionCategory | 'all'>('all')

  const filteredQuestions =
    filterCategory === 'all'
      ? PREP_QUESTIONS
      : PREP_QUESTIONS.filter((q) => q.category === filterCategory)

  return (
    <div className="animate-in space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">AI Interview Prep</h2>
          <p className="text-sm text-muted-foreground">
            Domain-specific questions, STAR examples, and winning strategies for senior consulting roles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => toast.info('Generating new questions from your recent bookmarks...')}
          >
            Refresh Questions
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Mic className="h-3.5 w-3.5" />}
            onClick={() => toast.info('Mock interview mode coming soon!')}
          >
            Mock Interview
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Questions', value: PREP_QUESTIONS.length, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'With STAR Examples', value: PREP_QUESTIONS.filter(q => q.starExample).length, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Categories', value: Object.keys(CATEGORY_CONFIG).length, color: 'text-gold-600 dark:text-gold-400' },
          { label: 'Key Phrases', value: KEY_PHRASES.length, color: 'text-purple-600 dark:text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-4 text-center"
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
            { id: 'questions' as Tab, label: 'Interview Questions', icon: <MessageSquare className="h-3.5 w-3.5" /> },
            { id: 'company' as Tab, label: 'Company Research', icon: <Building2 className="h-3.5 w-3.5" /> },
            { id: 'phrases' as Tab, label: 'Power Phrases', icon: <BookOpen className="h-3.5 w-3.5" /> },
            { id: 'strategy' as Tab, label: 'Win Strategy', icon: <Trophy className="h-3.5 w-3.5" /> },
          ] as const
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
        {activeTab === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterCategory('all')}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                  filterCategory === 'all'
                    ? 'bg-gold-500/10 border-gold-500/30 text-gold-600 dark:text-gold-400'
                    : 'border-border text-muted-foreground hover:border-gold-500/30 hover:text-foreground'
                )}
              >
                All ({PREP_QUESTIONS.length})
              </button>
              {(Object.keys(CATEGORY_CONFIG) as QuestionCategory[]).map((cat) => {
                const count = PREP_QUESTIONS.filter(q => q.category === cat).length
                if (count === 0) return null
                const config = CATEGORY_CONFIG[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-semibold transition-colors flex items-center gap-1',
                      filterCategory === cat
                        ? cn(config.bg, config.color)
                        : 'border-border text-muted-foreground hover:border-gold-500/30 hover:text-foreground'
                    )}
                  >
                    {config.icon}
                    {config.label} ({count})
                  </button>
                )
              })}
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {filteredQuestions.map((q, i) => (
                <QuestionCard key={q.id} question={q} index={i} />
              ))}
            </div>

            {/* AI Generate More */}
            <div className="rounded-xl border border-dashed border-gold-500/30 bg-gold-500/5 p-5 text-center">
              <Sparkles className="mx-auto mb-2 h-5 w-5 text-gold-500" />
              <p className="text-sm font-semibold text-foreground">Generate Custom Questions</p>
              <p className="mt-1 text-xs text-muted-foreground">
                AI can generate role-specific questions based on a job description you paste
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => toast.info('Paste a job description and AI will generate tailored questions')}
              >
                Generate from JD
              </Button>
            </div>
          </motion.div>
        )}

        {activeTab === 'company' && (
          <motion.div
            key="company"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {COMPANY_RESEARCH_TIPS.map((org, i) => (
                <motion.div
                  key={org.org}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{org.org}</h3>
                  </div>
                  <ul className="space-y-2">
                    {org.tips.map((tip, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Star className="mt-0.5 h-3 w-3 flex-shrink-0 text-gold-500" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* General Research Framework */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Universal Company Research Framework</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    title: '24 Hours Before',
                    items: [
                      'Read annual report / strategic plan',
                      'Review recent press releases (last 90 days)',
                      'Study key leadership profiles on LinkedIn',
                      'Note any major contracts or program wins',
                      'Check Glassdoor for culture signals',
                    ],
                  },
                  {
                    title: 'Day of Interview',
                    items: [
                      'Review your prepared STAR examples',
                      'Print or have digital copies of your key achievements',
                      'Prepare 3 insightful questions to ask',
                      'Know the names of all interviewers',
                      'Arrive / log in 10 minutes early',
                    ],
                  },
                  {
                    title: 'Questions to Ask Them',
                    items: [
                      '"What does success look like in the first 90 days?"',
                      '"What are the biggest challenges in this program right now?"',
                      '"How does this team collaborate with government counterparts?"',
                      '"What growth have people in this role experienced?"',
                      '"What is the biggest opportunity you see ahead?"',
                    ],
                  },
                ].map((section) => (
                  <div key={section.title}>
                    <p className="text-xs font-bold text-foreground mb-2">{section.title}</p>
                    <ul className="space-y-1.5">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gold-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'phrases' && (
          <motion.div
            key="phrases"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-1">Domain Power Phrases</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Use these terms to signal sector expertise. They resonate with government consulting, development sector, and health IT interviewers.
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {KEY_PHRASES.map((item, i) => (
                  <motion.div
                    key={item.phrase}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-[10px] font-bold text-gold-600 dark:text-gold-400">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{item.phrase}</p>
                      <p className="text-[11px] text-muted-foreground">Use in: {item.context}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Opening/Closing Scripts */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Opening Narrative (60 sec)</h3>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-foreground leading-relaxed italic">
                    "I'm a senior consulting professional with 14+ years specializing in digital transformation for governments and development sector organizations. My work spans e-governance, public health IT, and PMU leadership for World Bank and bilateral donor projects across India. I'm particularly proud of [your top 2 achievements]. What draws me to this role is [specific fit]. I'd love to share more about how I can [specific value add]."
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  className="mt-2"
                  leftIcon={<Copy className="h-3 w-3" />}
                  onClick={async () => {
                    await copyToClipboard("I'm a senior consulting professional with 14+ years specializing in digital transformation for governments and development sector organizations.")
                    toast.success('Opening narrative copied!')
                  }}
                >
                  Copy Template
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Closing Strong (30 sec)</h3>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-foreground leading-relaxed italic">
                    "Based on what I've heard today, I'm even more excited about this opportunity. My [specific experience] directly aligns with your [specific challenge they mentioned]. I'm confident I can [specific outcome] within [timeframe]. I'd love to know — what would make this an ideal hire for you?"
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  className="mt-2"
                  leftIcon={<Copy className="h-3 w-3" />}
                  onClick={async () => {
                    await copyToClipboard("Based on what I've heard today, I'm even more excited about this opportunity.")
                    toast.success('Closing script copied!')
                  }}
                >
                  Copy Template
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'strategy' && (
          <motion.div
            key="strategy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Winning Strategy */}
            <div className="rounded-xl border border-gold-500/20 bg-gradient-to-br from-gold-500/5 to-transparent p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-gold-500" />
                <h3 className="text-sm font-bold text-foreground">Your Winning Differentiation Strategy</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: 'The Triple Intersection',
                    desc: 'You sit at the rare intersection of Government + Digital + Health. Most candidates bring one or two. You bring all three with 14+ years of delivery proof.',
                    action: 'Lead with this in your opening. Use "I operate at the intersection of..." framing.',
                  },
                  {
                    title: 'Donor Ecosystem Fluency',
                    desc: 'Your World Bank / multilateral experience is a premium differentiator. Most consultants know either government OR donors. You know both.',
                    action: 'For development sector roles: mention aide-mémoire, DLI, ISR in your answers — it signals insider knowledge.',
                  },
                  {
                    title: 'Implementation + Strategy',
                    desc: 'You can design AND deliver. Many senior consultants can only do one. Your PMU leadership proves you deliver at the ground level.',
                    action: 'Frame yourself as "strategy to execution" — not just advisory. Quantify your delivery impact.',
                  },
                  {
                    title: 'Cross-Sector Translation',
                    desc: 'You translate between IAS officers, NGO program heads, tech teams, and international consultants. This is extremely rare and valuable.',
                    action: 'Share examples where you bridged government-private-multilateral gaps in a single engagement.',
                  },
                ].map((point) => (
                  <div key={point.title} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm font-bold text-foreground mb-1">{point.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{point.desc}</p>
                    <div className="rounded-lg bg-gold-500/5 border border-gold-500/20 p-2">
                      <p className="text-[11px] font-semibold text-gold-600 dark:text-gold-400">{point.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Stages */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Multi-Round Interview Strategy</h3>
              <div className="space-y-3">
                {[
                  { round: 'Round 1 — HR Screen', objective: 'Pass the salary/culture fit filter', strategy: 'Be enthusiastic, align salary expectations, confirm logistics. Don\'t over-explain your experience.' },
                  { round: 'Round 2 — Domain Expert', objective: 'Prove technical depth', strategy: 'Use sector-specific terminology. Go deep on 2-3 flagship projects. Demonstrate M&E and governance fluency.' },
                  { round: 'Round 3 — Senior Leadership', objective: 'Strategic fit and leadership presence', strategy: 'Elevate the conversation. Talk about sector trends, policy environment, long-term transformation. Show executive presence.' },
                  { round: 'Round 4 — Case/Assessment', objective: 'Problem-solving and structured thinking', strategy: 'Structure before solving. Ask clarifying questions. Use data. Connect solution to real-world constraints.' },
                ].map((round) => (
                  <div key={round.round} className="flex gap-4 rounded-xl border border-border p-4">
                    <div className="flex-shrink-0 w-36">
                      <p className="text-xs font-bold text-foreground">{round.round}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{round.objective}</p>
                    </div>
                    <div className="flex-1 border-l border-border pl-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">{round.strategy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Negotiation */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-emerald-500" />
                Salary Negotiation Framework
              </h3>
              <div className="grid gap-3 md:grid-cols-3 text-xs">
                {[
                  { title: 'Anchor High', tip: 'Name a number 15-20% above your target. Employers expect negotiation. If they ask for current salary, share CTC with benefits.' },
                  { title: 'Value Before Number', tip: 'Before discussing salary, establish your value. Get the offer, then negotiate. Use "I\'m very interested — can you share the budget?" if pressured early.' },
                  { title: 'Total Package', tip: 'Negotiate the full package: ESOPs, variable pay, joining bonus, professional development, role expansion scope, and title. Salary is just one lever.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-lg border border-emerald-500/20 bg-card p-3">
                    <p className="font-bold text-foreground mb-1">{item.title}</p>
                    <p className="text-muted-foreground leading-relaxed">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
