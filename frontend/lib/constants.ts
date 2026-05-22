import type { JobSource, SeniorityLevel, RemoteType, ApplicationStatus } from '@/types'

// ============================================================
// Job Sources
// ============================================================

export const JOB_SOURCES: Array<{
  value: JobSource
  label: string
  color: string
  bgColor: string
  textColor: string
}> = [
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-400' },
  { value: 'indeed', label: 'Indeed', color: '#2164F3', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', textColor: 'text-indigo-700 dark:text-indigo-400' },
  { value: 'glassdoor', label: 'Glassdoor', color: '#0CAA41', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400' },
  { value: 'naukri', label: 'Naukri', color: '#FF7555', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-400' },
  { value: 'wellfound', label: 'Wellfound', color: '#FB5A00', bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400' },
  { value: 'lever', label: 'Lever', color: '#5B2EA6', bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-700 dark:text-purple-400' },
  { value: 'greenhouse', label: 'Greenhouse', color: '#24BB55', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', textColor: 'text-emerald-700 dark:text-emerald-400' },
  { value: 'workday', label: 'Workday', color: '#F37020', bgColor: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-700 dark:text-amber-400' },
  { value: 'direct', label: 'Direct', color: '#64748B', bgColor: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-700 dark:text-slate-400' },
  { value: 'other', label: 'Other', color: '#94A3B8', bgColor: 'bg-gray-100 dark:bg-gray-800', textColor: 'text-gray-700 dark:text-gray-400' },
]

// ============================================================
// Seniority Levels
// ============================================================

export const SENIORITY_LEVELS: Array<{
  value: SeniorityLevel
  label: string
  shortLabel: string
  yearsMin?: number
  yearsMax?: number
}> = [
  { value: 'intern', label: 'Internship', shortLabel: 'Intern', yearsMin: 0, yearsMax: 1 },
  { value: 'junior', label: 'Junior / Entry Level', shortLabel: 'Junior', yearsMin: 0, yearsMax: 2 },
  { value: 'mid', label: 'Mid Level', shortLabel: 'Mid', yearsMin: 2, yearsMax: 5 },
  { value: 'senior', label: 'Senior', shortLabel: 'Senior', yearsMin: 5, yearsMax: 8 },
  { value: 'lead', label: 'Lead / Staff', shortLabel: 'Lead', yearsMin: 7, yearsMax: 12 },
  { value: 'principal', label: 'Principal / Architect', shortLabel: 'Principal', yearsMin: 10 },
  { value: 'director', label: 'Director', shortLabel: 'Director', yearsMin: 10 },
  { value: 'vp', label: 'VP / Vice President', shortLabel: 'VP', yearsMin: 12 },
  { value: 'c-level', label: 'C-Level / Executive', shortLabel: 'C-Suite', yearsMin: 15 },
]

// ============================================================
// Remote Types
// ============================================================

export const REMOTE_TYPES: Array<{
  value: RemoteType
  label: string
  icon: string
  color: string
}> = [
  { value: 'remote', label: 'Remote', icon: '🌍', color: 'text-green-600 dark:text-green-400' },
  { value: 'hybrid', label: 'Hybrid', icon: '🏠', color: 'text-blue-600 dark:text-blue-400' },
  { value: 'onsite', label: 'On-site', icon: '🏢', color: 'text-purple-600 dark:text-purple-400' },
]

// ============================================================
// Application Statuses
// ============================================================

export const APPLICATION_STATUSES: Array<{
  value: ApplicationStatus
  label: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
}> = [
  {
    value: 'interested',
    label: 'Interested',
    color: '#64748B',
    bgColor: 'bg-slate-50 dark:bg-slate-900/50',
    borderColor: 'border-slate-200 dark:border-slate-700',
    textColor: 'text-slate-600 dark:text-slate-400',
  },
  {
    value: 'applied',
    label: 'Applied',
    color: '#3B82F6',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    value: 'interviewing',
    label: 'Interviewing',
    color: '#F59E0B',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    value: 'offered',
    label: 'Offered',
    color: '#10B981',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    color: '#EF4444',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-600 dark:text-red-400',
  },
]

// ============================================================
// Industry Tags
// ============================================================

export const INDUSTRY_TAGS: string[] = [
  'Technology',
  'Finance',
  'Healthcare',
  'Consulting',
  'E-commerce',
  'FinTech',
  'SaaS',
  'EdTech',
  'HealthTech',
  'AI / ML',
  'Cybersecurity',
  'Cloud Computing',
  'Data Analytics',
  'Marketing',
  'Real Estate',
  'Manufacturing',
  'Media & Entertainment',
  'Logistics',
  'Telecommunications',
  'Energy',
  'Government',
  'Non-profit',
  'Startup',
  'Enterprise',
]

// ============================================================
// Skill Categories
// ============================================================

export const COMMON_SKILLS: string[] = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++',
  'React', 'Next.js', 'Node.js', 'FastAPI', 'Django', 'Spring Boot',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
  'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'Data Science', 'Data Engineering', 'Analytics',
  'Product Management', 'Project Management', 'Agile', 'Scrum',
  'Leadership', 'Strategy', 'Consulting', 'Business Development',
  'Financial Modeling', 'M&A', 'Due Diligence',
  'SQL', 'Spark', 'Hadoop', 'Kafka',
  'GraphQL', 'REST API', 'Microservices',
  'CI/CD', 'DevOps', 'SRE',
]

// ============================================================
// Navigation Items
// ============================================================

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/jobs', label: 'Jobs', icon: 'Briefcase' },
  { href: '/bookmarks', label: 'Bookmarks', icon: 'Bookmark' },
  { href: '/applications', label: 'Applications', icon: 'ClipboardList' },
  { href: '/recruiters', label: 'Recruiters', icon: 'Users' },
  { href: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
]

// ============================================================
// Dashboard Activity Types
// ============================================================

export const ACTIVITY_TYPES = {
  NEW_JOBS: 'new_jobs',
  DIGEST_SENT: 'digest_sent',
  SCRAPE_COMPLETE: 'scrape_complete',
  HIGH_MATCH: 'high_match',
  APPLICATION_UPDATE: 'application_update',
  RECRUITER_FOUND: 'recruiter_found',
} as const

// ============================================================
// Chart Colors
// ============================================================

export const CHART_COLORS = {
  linkedin: '#0A66C2',
  indeed: '#2164F3',
  glassdoor: '#0CAA41',
  naukri: '#FF7555',
  wellfound: '#FB5A00',
  lever: '#5B2EA6',
  greenhouse: '#24BB55',
  workday: '#F37020',
  direct: '#64748B',
  other: '#94A3B8',
  primary: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
}

// ============================================================
// Score Thresholds
// ============================================================

export const SCORE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 60,
  LOW: 0,
}

// ============================================================
// Pagination
// ============================================================

export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// ============================================================
// Date Formats
// ============================================================

export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  RELATIVE_THRESHOLD: 7, // days before showing absolute date
  ISO: "yyyy-MM-dd'T'HH:mm:ss'Z'",
}

// ============================================================
// Cover Letter Tones
// ============================================================

export const COVER_LETTER_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'creative', label: 'Creative' },
]

// ============================================================
// Outreach Platforms
// ============================================================

export const OUTREACH_PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn Message', maxChars: 300 },
  { value: 'email', label: 'Email', maxChars: 500 },
  { value: 'whatsapp', label: 'WhatsApp', maxChars: 200 },
]
