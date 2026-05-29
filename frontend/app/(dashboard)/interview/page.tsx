'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  BookOpen,
  MessageSquare,
  Target,
  Star,
  CheckCircle2,
  Play,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type QuestionCategory = 'Behavioral' | 'Technical' | 'Case Study' | 'Leadership'

const UPCOMING_INTERVIEWS = [
  {
    org: 'WHO India',
    role: 'National IT Advisor',
    type: 'Panel Interview',
    date: 'May 30, 2026',
    time: '11:00 AM',
    panel: 'Dr. Anand Krishnamurthy + 2 others',
    prepReady: true,
    matchScore: 85,
    color: 'border-l-teal-500',
    orgColor: 'bg-teal-600',
    initials: 'WHO',
  },
  {
    org: 'GIZ India',
    role: 'Senior Programme Manager, Digital Governance',
    type: 'Final HR Round',
    date: 'June 3, 2026',
    time: '2:30 PM',
    panel: 'Ms. Renata Fischer, Country Director',
    prepReady: true,
    matchScore: 83,
    color: 'border-l-purple-500',
    orgColor: 'bg-purple-600',
    initials: 'GIZ',
  },
]

const COMPANY_BRIEF = {
  mandate: 'WHO India supports the Ministry of Health & Family Welfare in strengthening India\'s health systems through technical assistance, policy advisory, and programme support across communicable disease control, maternal-child health, NHM, and digital health transformation.',
  budget: 'Annual India programme budget: ~$85 million (2024–25)',
  programs: ['National Health Mission (NHM) digital systems advisory', 'Ayushman Bharat Digital Mission (ABDM)', 'Integrated Disease Surveillance Programme (IDSP)', 'COVID-19 Technical Working Group participation', 'UHIS — Unified Health Interface strategy'],
  keyContacts: ['Dr. Roderico Ofrin — WHO India Representative', 'Dr. Priya Agarwal — Digital Health Lead', 'Dr. Anand Krishnamurthy — NHM Programme Officer'],
}

const ROLE_COMPETENCIES = [
  'Health information systems design and governance',
  'Digital public health strategy (ABDM, HMIS, HIS)',
  'Stakeholder management — MoHFW, NHA, state governments',
  'PMU/TSU leadership for large national health programmes',
  'Donor coordination and reporting (WHO, GFATM, GIZ)',
  'Policy advisory at national and state level',
  'Team leadership and capacity building',
]

const LIKELY_QUESTIONS = [
  { q: 'Walk me through your most significant digital health transformation programme. What was your role and what measurable outcomes did you deliver?', cat: 'Behavioral' },
  { q: 'How would you approach harmonising ABDM with existing state HMIS systems given the political and technical complexity involved?', cat: 'Technical' },
  { q: 'A state government is resistant to adopting the federal HMIS platform. How do you manage this stakeholder challenge?', cat: 'Case Study' },
  { q: 'Describe your experience leading cross-functional teams across government, development partners, and technology vendors.', cat: 'Behavioral' },
  { q: 'What is your understanding of the Unified Health Interface (UHI) and how would you position WHO\'s advisory role?', cat: 'Technical' },
  { q: 'How do you prioritise competing programme demands when resources are constrained?', cat: 'Leadership' },
  { q: 'Tell me about a time you influenced senior government officials to adopt a digital initiative they were initially opposed to.', cat: 'Behavioral' },
  { q: 'Design a 90-day onboarding plan for a National IT Advisor at WHO India.', cat: 'Case Study' },
  { q: 'How do you ensure data quality and interoperability across disparate health IT systems at scale?', cat: 'Technical' },
  { q: 'What distinguishes exceptional programme leadership from good management in the development sector?', cat: 'Leadership' },
]

const STAR_RESPONSES = [
  {
    question: 'Tell me about your most significant digital health transformation.',
    s: 'Led the national rollout of a state-integrated HMIS platform across 6 states as PMU Lead for a World Bank-funded health programme.',
    t: 'Replace fragmented paper-based systems with a unified digital platform handling 40M+ patient records, with a 24-month mandate and ₹85 crore budget.',
    a: 'Designed the PMU governance structure, onboarded 3 technology partners, negotiated state MoUs, ran change management workshops for 12,000 health workers, and established a data quality framework.',
    r: 'Achieved 94% facility-level adoption in 18 months, reduced reporting lag from 45 to 3 days, and received a World Bank "satisfactory" implementation rating — enabling a $12M follow-on tranche.',
  },
  {
    question: 'How have you managed a resistant government stakeholder?',
    s: 'During ABDM Phase 1 rollout, a state Health Secretary was publicly opposed to the federation model, creating a political risk to the programme timeline.',
    t: 'Secure state buy-in within 6 weeks to avoid a delay in the central programme schedule affecting 5 other states.',
    a: 'Arranged a bilateral visit with the state\'s e-gov success case, co-designed a state-specific implementation roadmap that preserved local data sovereignty, and presented a risk-sharing MoU.',
    r: 'State signed the MoU within 4 weeks. State went on to become a pilot-state leader and was featured in the national ABDM showcase at Vigyan Bhawan.',
  },
]

const CASE_STUDIES = [
  {
    title: 'Health IT Integration at Scale',
    scenario: 'A state government has 4 parallel health IT systems (NHM, ABDM, CGHS, state-funded) with no interoperability. WHO has been tasked to advise on a unified architecture. How do you proceed?',
    framework: 'Assess → Architect → Pilot → Scale',
    hints: ['Start with landscape mapping and stakeholder interest matrix', 'Propose FHIR-based interoperability layer rather than consolidation', 'Identify quick-win integration (NHM + ABDM) for proof-of-concept', 'Build state data governance committee before technical work'],
  },
  {
    title: 'Programme Recovery Under Political Pressure',
    scenario: 'A national digital health initiative is 6 months behind schedule with a change of Health Secretary. Programme KPIs are at risk. As National IT Advisor, what is your 30-day plan?',
    framework: 'Diagnose → Re-baseline → Communicate → Recover',
    hints: ['Conduct a rapid programme health assessment with PMU', 'Re-forecast with revised realistic milestones', 'Brief new Secretary with a "state of the programme" dashboard', 'Identify 2-3 quick wins to restore confidence in first 90 days'],
  },
]

const TALKING_POINTS = [
  'My 15+ years span both the technology implementation and policy advisory dimensions of digital health — rare in the development sector.',
  'I have direct experience with ABDM, NHM HMIS, and state-level digital health rollouts — I can contribute from Day 1.',
  'I bring a multilateral mindset: I understand how WHO, World Bank, ADB, and bilateral donors like GIZ operate and how to align their priorities.',
  'I am passionate about building institutional capacity, not just delivering projects — your M&E and knowledge management agenda resonates strongly with me.',
  'I see this role as a platform to contribute to India\'s digital health journey at a critical juncture — NHM\'s next phase, ABDM scaling, and UHI maturity.',
]

const QUESTION_BANK: { q: string; cat: QuestionCategory }[] = [
  { q: 'Describe a situation where you had to make a difficult decision with incomplete data.', cat: 'Behavioral' },
  { q: 'How do you approach change management in a government digital transformation?', cat: 'Behavioral' },
  { q: 'Explain FHIR and its relevance to interoperable health IT systems.', cat: 'Technical' },
  { q: 'What KPIs would you set for an ABDM district rollout in 12 months?', cat: 'Technical' },
  { q: 'A ₹50 crore digital health programme is delivering only 40% of planned outputs. Diagnose the root causes.', cat: 'Case Study' },
  { q: 'How do you build a high-performance team in a matrix organisation?', cat: 'Leadership' },
  { q: 'What is your philosophy on stakeholder communication during programme delays?', cat: 'Leadership' },
  { q: 'Design a digital health governance framework for a mid-sized Indian state.', cat: 'Case Study' },
]

const CAT_COLORS: Record<QuestionCategory, string> = {
  Behavioral: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Technical: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'Case Study': 'bg-gold-500/10 text-gold-600 dark:text-gold-400',
  Leadership: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
}

export default function InterviewPage() {
  const [activeInterview, setActiveInterview] = useState(0)
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)
  const [openStar, setOpenStar] = useState<number | null>(null)
  const [qbFilter, setQbFilter] = useState<QuestionCategory | 'All'>('All')

  const filteredQB =
    qbFilter === 'All' ? QUESTION_BANK : QUESTION_BANK.filter((q) => q.cat === qbFilter)

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Interview Intelligence Engine</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-generated prep kits, predicted questions, and STAR responses
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-gold-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-gold-400 transition-colors">
          <Play className="h-3.5 w-3.5" />
          Start Mock Interview
        </button>
      </div>

      {/* Upcoming Interviews */}
      <div className="grid gap-4 lg:grid-cols-2">
        {UPCOMING_INTERVIEWS.map((iv, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setActiveInterview(i)}
            className={cn(
              'w-full rounded-xl border-l-4 border border-border bg-card p-5 text-left hover:shadow-sm transition-all',
              iv.color,
              activeInterview === i ? 'ring-2 ring-gold-500/50' : ''
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0', iv.orgColor)}>
                  {iv.initials}
                </div>
                <div>
                  <p className="font-bold text-foreground">{iv.org}</p>
                  <p className="text-xs text-muted-foreground">{iv.role}</p>
                </div>
              </div>
              {iv.prepReady && (
                <span className="flex-shrink-0 flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Prep Kit Ready
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {iv.date} · {iv.time}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {iv.panel}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px]">
              <span className="text-muted-foreground">{iv.type}</span>
              <span className="text-border mx-1">·</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{iv.matchScore}% match</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Active Prep Kit — WHO India */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gold-500" />
            <h3 className="text-sm font-bold text-foreground">
              Prep Kit — {UPCOMING_INTERVIEWS[activeInterview].org}
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">{UPCOMING_INTERVIEWS[activeInterview].date}</span>
        </div>

        <div className="divide-y divide-border">
          {/* Company Brief */}
          <div className="px-5 py-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <Brain className="h-3.5 w-3.5 text-teal-500" />
              1. Company Brief
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{COMPANY_BRIEF.mandate}</p>
            <p className="text-xs text-muted-foreground mb-2">
              <span className="font-semibold text-foreground">Budget:</span> {COMPANY_BRIEF.budget}
            </p>
            <p className="text-xs font-semibold text-foreground mb-1.5">Key Programmes:</p>
            <ul className="space-y-1">
              {COMPANY_BRIEF.programs.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-teal-500" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Role Competencies */}
          <div className="px-5 py-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <Target className="h-3.5 w-3.5 text-blue-500" />
              2. Expected Competencies
            </h4>
            <div className="flex flex-wrap gap-2">
              {ROLE_COMPETENCIES.map((c, i) => (
                <span key={i} className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Likely Questions */}
          <div className="px-5 py-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
              3. Predicted Questions
            </h4>
            <div className="space-y-2">
              {LIKELY_QUESTIONS.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">{item.q}</p>
                  </div>
                  <span className={cn('flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold', CAT_COLORS[item.cat as QuestionCategory])}>
                    {item.cat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* STAR Responses */}
          <div className="px-5 py-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <Star className="h-3.5 w-3.5 text-gold-500" />
              4. STAR Responses
            </h4>
            <div className="space-y-3">
              {STAR_RESPONSES.map((r, i) => (
                <div key={i} className="rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setOpenStar(openStar === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <p className="text-xs font-semibold text-foreground text-left">{r.question}</p>
                    {openStar === i ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {openStar === i && (
                    <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-2">
                      {(['s', 't', 'a', 'r'] as const).map((key) => {
                        const labels = { s: 'Situation', t: 'Task', a: 'Action', r: 'Result' }
                        const colors = { s: 'text-blue-500', t: 'text-purple-500', a: 'text-gold-500', r: 'text-emerald-500' }
                        return (
                          <div key={key} className="flex gap-2">
                            <span className={cn('flex-shrink-0 w-16 text-[10px] font-bold uppercase', colors[key])}>
                              {labels[key]}
                            </span>
                            <p className="text-xs text-muted-foreground leading-relaxed">{r[key]}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Case Studies */}
          <div className="px-5 py-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <Award className="h-3.5 w-3.5 text-orange-500" />
              5. Case Study Scenarios
            </h4>
            <div className="space-y-3">
              {CASE_STUDIES.map((cs, i) => (
                <div key={i} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-bold text-foreground mb-2">{cs.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{cs.scenario}</p>
                  <p className="text-[10px] font-bold text-gold-600 dark:text-gold-400 mb-2">
                    Recommended Framework: {cs.framework}
                  </p>
                  <ul className="space-y-1">
                    {cs.hints.map((h, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                        <span className="text-gold-500 font-bold mt-px">→</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Talking Points */}
          <div className="px-5 py-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
              6. Executive Talking Points
            </h4>
            <div className="space-y-2">
              {TALKING_POINTS.map((tp, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {i + 1}
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">{tp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Question Bank */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-bold text-foreground">Question Bank</h3>
            <span className="text-xs text-muted-foreground">({QUESTION_BANK.length} questions)</span>
          </div>
          <div className="flex items-center gap-1">
            {(['All', 'Behavioral', 'Technical', 'Case Study', 'Leadership'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setQbFilter(cat)}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors',
                  qbFilter === cat
                    ? 'bg-gold-500 text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {filteredQB.map((item, i) => (
            <button
              key={i}
              onClick={() => setOpenQuestion(openQuestion === i ? null : i)}
              className="w-full flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors text-left"
            >
              <span className={cn('mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold', CAT_COLORS[item.cat])}>
                {item.cat}
              </span>
              <p className="flex-1 text-xs text-foreground leading-relaxed">{item.q}</p>
              <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
