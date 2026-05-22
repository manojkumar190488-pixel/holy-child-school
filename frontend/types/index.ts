// ============================================================
// Core Domain Types
// ============================================================

export type MatchScoreRange = 'high' | 'medium' | 'low'
export type ApplicationStatus = 'interested' | 'applied' | 'interviewing' | 'offered' | 'rejected'
export type RemoteType = 'remote' | 'hybrid' | 'onsite'
export type SeniorityLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'director' | 'vp' | 'c-level'
export type JobSource = 'linkedin' | 'indeed' | 'glassdoor' | 'naukri' | 'wellfound' | 'lever' | 'greenhouse' | 'workday' | 'direct' | 'other'
export type ThemeMode = 'light' | 'dark' | 'system'
export type NotificationType = 'new_job' | 'digest' | 'match' | 'reminder' | 'system'

// ============================================================
// User & Auth
// ============================================================

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  title?: string
  company?: string
  location?: string
  resumeUrl?: string
  resumeLastUpdated?: string
  createdAt: string
  updatedAt: string
  preferences: UserPreferences
}

export interface UserPreferences {
  preferredRoles: string[]
  preferredLocations: string[]
  preferredIndustries: string[]
  remotePreference: RemoteType[]
  seniorityLevels: SeniorityLevel[]
  minMatchScore: number
  salaryMin?: number
  salaryMax?: number
  currency: string
  emailDigestEnabled: boolean
  emailDigestTime: string
  telegramEnabled: boolean
  telegramChatId?: string
  whatsappEnabled: boolean
  whatsappNumber?: string
  notifications: NotificationPreferences
}

export interface NotificationPreferences {
  newHighMatchJob: boolean
  dailyDigest: boolean
  weeklyReport: boolean
  applicationReminders: boolean
  recruiterMessages: boolean
}

// ============================================================
// Jobs
// ============================================================

export interface Job {
  id: string
  title: string
  company: CompanyInfo
  location: string
  remoteType: RemoteType
  seniorityLevel: SeniorityLevel
  source: JobSource
  sourceUrl: string
  sourceJobId?: string
  description: string
  descriptionHtml?: string
  requirements: string[]
  responsibilities: string[]
  qualifications: string[]
  skills: string[]
  salary?: SalaryRange
  postedAt: string
  scrapedAt: string
  expiresAt?: string
  isActive: boolean
  matchScore: MatchScore
  aiSummary?: string
  whyRelevant?: string
  recruiter?: RecruiterInfo
  applicationUrl?: string
  industries: string[]
  benefits?: string[]
  teamSize?: string
  fundingStage?: string
  isBookmarked: boolean
  isHidden: boolean
  applicationStatus?: ApplicationStatus
}

export interface CompanyInfo {
  name: string
  logoUrl?: string
  website?: string
  industry?: string
  size?: string
  founded?: number
  description?: string
  headquarters?: string
  linkedinUrl?: string
}

export interface SalaryRange {
  min?: number
  max?: number
  currency: string
  period: 'hourly' | 'monthly' | 'annually'
  isEstimated: boolean
}

export interface MatchScore {
  overall: number
  breakdown: MatchScoreBreakdown
  matchedSkills: string[]
  missingSkills: string[]
  reasoning: string
  confidence: number
}

export interface MatchScoreBreakdown {
  skills: number
  experience: number
  location: number
  seniority: number
  industry: number
  compensation: number
}

// ============================================================
// Recruiter
// ============================================================

export interface Recruiter {
  id: string
  name: string
  email?: string
  phone?: string
  title?: string
  company: string
  companyLogoUrl?: string
  linkedinUrl?: string
  linkedinId?: string
  location?: string
  jobsPosted: number
  lastActive?: string
  firstSeen: string
  interactionScore: number
  notes?: string
  tags: string[]
  isManuallyAdded: boolean
  jobs: JobReference[]
}

export interface JobReference {
  id: string
  title: string
  company: string
  postedAt: string
}

export interface RecruiterInfo {
  name?: string
  email?: string
  linkedinUrl?: string
  title?: string
  company?: string
}

// ============================================================
// Bookmarks
// ============================================================

export interface Bookmark {
  id: string
  jobId: string
  job: Job
  folderId?: string
  notes?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  reminder?: string
}

export interface BookmarkFolder {
  id: string
  name: string
  color: string
  icon?: string
  count: number
  createdAt: string
}

// ============================================================
// Applications
// ============================================================

export interface Application {
  id: string
  jobId: string
  job: Job
  status: ApplicationStatus
  appliedAt?: string
  notes?: string
  nextAction?: string
  nextActionDate?: string
  coverLetter?: string
  resume?: string
  interviewDates?: InterviewDate[]
  offerDetails?: OfferDetails
  rejectionReason?: string
  contacts: ApplicationContact[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface InterviewDate {
  id: string
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'hr' | 'final'
  scheduledAt: string
  duration?: number
  notes?: string
  outcome?: 'passed' | 'failed' | 'pending'
}

export interface OfferDetails {
  salary?: number
  currency?: string
  equity?: string
  startDate?: string
  deadline?: string
  benefits?: string[]
  notes?: string
}

export interface ApplicationContact {
  name: string
  email?: string
  role?: string
  linkedinUrl?: string
}

// ============================================================
// Analytics
// ============================================================

export interface AnalyticsData {
  overview: AnalyticsOverview
  trends: TrendData[]
  sourceBreakdown: SourceBreakdown[]
  matchScoreDistribution: ScoreDistribution[]
  topCompanies: TopCompany[]
  skillsGap: SkillGapData[]
  recruiterActivity: RecruiterActivityData[]
  weeklyStats: WeeklyStats[]
  applicationFunnel: ApplicationFunnelData[]
}

export interface AnalyticsOverview {
  totalOpportunities: number
  totalOpportunitiesChange: number
  highMatchCount: number
  highMatchChange: number
  newToday: number
  newTodayChange: number
  appliedCount: number
  appliedChange: number
  avgMatchScore: number
  avgMatchScoreChange: number
  bookmarkCount: number
  bookmarkChange: number
}

export interface TrendData {
  date: string
  linkedin: number
  indeed: number
  glassdoor: number
  naukri: number
  other: number
  total: number
}

export interface SourceBreakdown {
  source: string
  count: number
  percentage: number
  avgMatchScore: number
  color: string
}

export interface ScoreDistribution {
  range: string
  count: number
  percentage: number
}

export interface TopCompany {
  company: string
  logoUrl?: string
  jobCount: number
  avgMatchScore: number
  latestPost: string
}

export interface SkillGapData {
  skill: string
  required: number
  possessed: number
  gap: number
}

export interface RecruiterActivityData {
  day: string
  hour: number
  value: number
}

export interface WeeklyStats {
  week: string
  newJobs: number
  matchedJobs: number
  applications: number
  interviews: number
}

export interface ApplicationFunnelData {
  stage: string
  count: number
  percentage: number
}

// ============================================================
// Search
// ============================================================

export interface SearchResult {
  jobs: Job[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  query: string
  semanticQuery?: string
  filters: SearchFilters
  sortBy: SortOption
  executionTime: number
}

export interface SearchFilters {
  sources: JobSource[]
  locations: string[]
  remoteTypes: RemoteType[]
  seniorityLevels: SeniorityLevel[]
  minMatchScore: number
  maxMatchScore: number
  postedAfter?: string
  postedBefore?: string
  industries: string[]
  skills: string[]
  salaryMin?: number
  salaryMax?: number
  isBookmarked?: boolean
  applicationStatuses?: ApplicationStatus[]
}

export type SortOption = 'match_score' | 'posted_date' | 'relevance' | 'company' | 'salary'

export interface SearchSuggestion {
  text: string
  type: 'query' | 'skill' | 'company' | 'role' | 'location'
  count?: number
}

// ============================================================
// AI Features
// ============================================================

export interface CoverLetter {
  id: string
  jobId: string
  content: string
  version: number
  generatedAt: string
  tone: 'professional' | 'friendly' | 'formal' | 'creative'
  wordCount: number
}

export interface OutreachMessage {
  id: string
  recruiterId?: string
  jobId: string
  content: string
  platform: 'linkedin' | 'email' | 'whatsapp'
  tone: 'professional' | 'friendly' | 'direct'
  generatedAt: string
  characterCount: number
}

export interface AIGenerationRequest {
  jobId: string
  userId?: string
  customInstructions?: string
  tone?: string
}

export interface AIGenerationResponse<T> {
  data: T
  tokensUsed: number
  model: string
  generatedAt: string
}

// ============================================================
// Notifications
// ============================================================

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  metadata?: Record<string, unknown>
}

// ============================================================
// API Response Wrappers
// ============================================================

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: ApiError[]
  meta?: ApiMeta
}

export interface ApiError {
  code: string
  message: string
  field?: string
}

export interface ApiMeta {
  page?: number
  pageSize?: number
  total?: number
  totalPages?: number
  executionTime?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ============================================================
// UI State Types
// ============================================================

export interface DashboardStats {
  totalOpportunities: number
  totalOpportunitiesChange: number
  highMatchCount: number
  highMatchChange: number
  newToday: number
  newTodayChange: number
  appliedCount: number
  appliedChange: number
}

export interface FilterState {
  sources: JobSource[]
  locations: string[]
  remoteTypes: RemoteType[]
  seniorityLevels: SeniorityLevel[]
  minMatchScore: number
  maxMatchScore: number
  postedAfter: string
  industries: string[]
  skills: string[]
}

export type ViewMode = 'grid' | 'list'

export interface KanbanColumn {
  id: ApplicationStatus
  title: string
  color: string
  items: Application[]
}

// ============================================================
// Settings
// ============================================================

export interface ScoringWeights {
  skills: number
  experience: number
  location: number
  seniority: number
  industry: number
  compensation: number
}

export interface IntegrationSettings {
  googleConnected: boolean
  linkedinConnected: boolean
  telegramConnected: boolean
  whatsappConnected: boolean
  emailConnected: boolean
}
