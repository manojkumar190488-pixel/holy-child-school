import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Job,
  Recruiter,
  Bookmark,
  BookmarkFolder,
  Application,
  AnalyticsData,
  SearchResult,
  SearchFilters,
  SortOption,
  CoverLetter,
  OutreachMessage,
  AIGenerationRequest,
  AIGenerationResponse,
  Notification,
  User,
  UserPreferences,
  ScoringWeights,
} from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

// ============================================================
// Axios Instance
// ============================================================

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor — inject auth token
  client.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor — handle errors globally
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          window.location.href = '/'
        }
      }
      return Promise.reject(error)
    }
  )

  return client
}

export const apiClient = createApiClient()

// ============================================================
// Generic Request Helper
// ============================================================

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<ApiResponse<T>>(config)
  return response.data.data
}

// ============================================================
// Jobs API
// ============================================================

export interface GetJobsParams {
  page?: number
  pageSize?: number
  search?: string
  filters?: Partial<SearchFilters>
  sortBy?: SortOption
}

export const jobsApi = {
  getJobs: async (params: GetJobsParams = {}): Promise<SearchResult> => {
    const {
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      search = '',
      filters = {},
      sortBy = 'match_score',
    } = params

    return request<SearchResult>({
      method: 'GET',
      url: '/jobs',
      params: {
        page,
        page_size: pageSize,
        search,
        sort_by: sortBy,
        sources: filters.sources?.join(','),
        locations: filters.locations?.join(','),
        remote_types: filters.remoteTypes?.join(','),
        seniority_levels: filters.seniorityLevels?.join(','),
        min_match_score: filters.minMatchScore,
        max_match_score: filters.maxMatchScore,
        posted_after: filters.postedAfter,
        industries: filters.industries?.join(','),
        skills: filters.skills?.join(','),
        salary_min: filters.salaryMin,
        salary_max: filters.salaryMax,
        is_bookmarked: filters.isBookmarked,
      },
    })
  },

  getJob: async (id: string): Promise<Job> => {
    return request<Job>({
      method: 'GET',
      url: `/jobs/${id}`,
    })
  },

  searchJobs: async (query: string, filters?: Partial<SearchFilters>): Promise<SearchResult> => {
    return request<SearchResult>({
      method: 'POST',
      url: '/jobs/search',
      data: { query, filters },
    })
  },

  getSimilarJobs: async (jobId: string, limit = 5): Promise<Job[]> => {
    return request<Job[]>({
      method: 'GET',
      url: `/jobs/${jobId}/similar`,
      params: { limit },
    })
  },

  getRecommendations: async (limit = 10): Promise<Job[]> => {
    return request<Job[]>({
      method: 'GET',
      url: '/jobs/recommendations',
      params: { limit },
    })
  },

  hideJob: async (jobId: string): Promise<void> => {
    return request<void>({
      method: 'POST',
      url: `/jobs/${jobId}/hide`,
    })
  },

  getDailyDigest: async (): Promise<{ jobs: Job[]; sentAt: string; count: number }> => {
    return request({
      method: 'POST',
      url: '/jobs/digest',
    })
  },
}

// ============================================================
// Bookmarks API
// ============================================================

export const bookmarksApi = {
  getBookmarks: async (folderId?: string): Promise<PaginatedResponse<Bookmark>> => {
    return request<PaginatedResponse<Bookmark>>({
      method: 'GET',
      url: '/bookmarks',
      params: { folder_id: folderId },
    })
  },

  bookmarkJob: async (jobId: string, folderId?: string, notes?: string): Promise<Bookmark> => {
    return request<Bookmark>({
      method: 'POST',
      url: '/bookmarks',
      data: { job_id: jobId, folder_id: folderId, notes },
    })
  },

  unbookmarkJob: async (bookmarkId: string): Promise<void> => {
    return request<void>({
      method: 'DELETE',
      url: `/bookmarks/${bookmarkId}`,
    })
  },

  updateBookmark: async (bookmarkId: string, data: Partial<Bookmark>): Promise<Bookmark> => {
    return request<Bookmark>({
      method: 'PATCH',
      url: `/bookmarks/${bookmarkId}`,
      data,
    })
  },

  getFolders: async (): Promise<BookmarkFolder[]> => {
    return request<BookmarkFolder[]>({
      method: 'GET',
      url: '/bookmarks/folders',
    })
  },

  createFolder: async (name: string, color: string): Promise<BookmarkFolder> => {
    return request<BookmarkFolder>({
      method: 'POST',
      url: '/bookmarks/folders',
      data: { name, color },
    })
  },

  deleteFolder: async (folderId: string): Promise<void> => {
    return request<void>({
      method: 'DELETE',
      url: `/bookmarks/folders/${folderId}`,
    })
  },
}

// ============================================================
// Applications API
// ============================================================

export const applicationsApi = {
  getApplications: async (): Promise<Application[]> => {
    return request<Application[]>({
      method: 'GET',
      url: '/applications',
    })
  },

  createApplication: async (jobId: string, status: string = 'interested'): Promise<Application> => {
    return request<Application>({
      method: 'POST',
      url: '/applications',
      data: { job_id: jobId, status },
    })
  },

  updateApplication: async (id: string, data: Partial<Application>): Promise<Application> => {
    return request<Application>({
      method: 'PATCH',
      url: `/applications/${id}`,
      data,
    })
  },

  deleteApplication: async (id: string): Promise<void> => {
    return request<void>({
      method: 'DELETE',
      url: `/applications/${id}`,
    })
  },

  moveApplication: async (id: string, newStatus: string): Promise<Application> => {
    return request<Application>({
      method: 'POST',
      url: `/applications/${id}/move`,
      data: { status: newStatus },
    })
  },
}

// ============================================================
// Recruiters API
// ============================================================

export const recruitersApi = {
  getRecruiters: async (page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedResponse<Recruiter>> => {
    return request<PaginatedResponse<Recruiter>>({
      method: 'GET',
      url: '/recruiters',
      params: { page, page_size: pageSize },
    })
  },

  getRecruiter: async (id: string): Promise<Recruiter> => {
    return request<Recruiter>({
      method: 'GET',
      url: `/recruiters/${id}`,
    })
  },

  addRecruiter: async (data: Partial<Recruiter>): Promise<Recruiter> => {
    return request<Recruiter>({
      method: 'POST',
      url: '/recruiters',
      data,
    })
  },

  updateRecruiter: async (id: string, data: Partial<Recruiter>): Promise<Recruiter> => {
    return request<Recruiter>({
      method: 'PATCH',
      url: `/recruiters/${id}`,
      data,
    })
  },

  deleteRecruiter: async (id: string): Promise<void> => {
    return request<void>({
      method: 'DELETE',
      url: `/recruiters/${id}`,
    })
  },

  exportRecruiters: async (): Promise<Blob> => {
    const response = await apiClient.get('/recruiters/export', {
      responseType: 'blob',
    })
    return response.data
  },
}

// ============================================================
// Analytics API
// ============================================================

export const analyticsApi = {
  getAnalytics: async (period = '30d'): Promise<AnalyticsData> => {
    return request<AnalyticsData>({
      method: 'GET',
      url: '/analytics',
      params: { period },
    })
  },

  getOverview: async (): Promise<AnalyticsData['overview']> => {
    return request<AnalyticsData['overview']>({
      method: 'GET',
      url: '/analytics/overview',
    })
  },
}

// ============================================================
// AI Features API
// ============================================================

export const aiApi = {
  generateCoverLetter: async (
    req: AIGenerationRequest
  ): Promise<AIGenerationResponse<CoverLetter>> => {
    return request<AIGenerationResponse<CoverLetter>>({
      method: 'POST',
      url: '/ai/cover-letter',
      data: req,
      timeout: 60000,
    })
  },

  generateOutreach: async (
    req: AIGenerationRequest & { platform: string; recruiterId?: string }
  ): Promise<AIGenerationResponse<OutreachMessage>> => {
    return request<AIGenerationResponse<OutreachMessage>>({
      method: 'POST',
      url: '/ai/outreach',
      data: req,
      timeout: 60000,
    })
  },

  getSearchSuggestions: async (query: string): Promise<{ suggestions: string[] }> => {
    return request({
      method: 'GET',
      url: '/ai/search-suggestions',
      params: { q: query },
    })
  },

  sendDigest: async (): Promise<{ sent: boolean; jobCount: number; sentAt: string }> => {
    return request({
      method: 'POST',
      url: '/ai/send-digest',
    })
  },
}

// ============================================================
// User & Settings API
// ============================================================

export const userApi = {
  getProfile: async (): Promise<User> => {
    return request<User>({
      method: 'GET',
      url: '/user/profile',
    })
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return request<User>({
      method: 'PATCH',
      url: '/user/profile',
      data,
    })
  },

  updatePreferences: async (prefs: Partial<UserPreferences>): Promise<UserPreferences> => {
    return request<UserPreferences>({
      method: 'PATCH',
      url: '/user/preferences',
      data: prefs,
    })
  },

  updateScoringWeights: async (weights: ScoringWeights): Promise<ScoringWeights> => {
    return request<ScoringWeights>({
      method: 'PUT',
      url: '/user/scoring-weights',
      data: weights,
    })
  },

  uploadResume: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData()
    formData.append('resume', file)
    return request({
      method: 'POST',
      url: '/user/resume',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ============================================================
// Notifications API
// ============================================================

export const notificationsApi = {
  getNotifications: async (unreadOnly = false): Promise<Notification[]> => {
    return request<Notification[]>({
      method: 'GET',
      url: '/notifications',
      params: { unread_only: unreadOnly },
    })
  },

  markAsRead: async (id: string): Promise<void> => {
    return request<void>({
      method: 'POST',
      url: `/notifications/${id}/read`,
    })
  },

  markAllAsRead: async (): Promise<void> => {
    return request<void>({
      method: 'POST',
      url: '/notifications/read-all',
    })
  },
}

// ============================================================
// Mock data helpers for development
// ============================================================

export function createMockJob(overrides: Partial<Job> = {}): Job {
  const id = Math.random().toString(36).slice(2)
  return {
    id,
    title: 'Senior Strategy Consultant',
    company: {
      name: 'McKinsey & Company',
      logoUrl: undefined,
      industry: 'Consulting',
      size: '10000+',
    },
    location: 'New York, NY',
    remoteType: 'hybrid',
    seniorityLevel: 'senior',
    source: 'linkedin',
    sourceUrl: 'https://linkedin.com/jobs/view/123',
    description: 'We are looking for a Senior Strategy Consultant to join our team...',
    requirements: ['MBA or equivalent', '5+ years consulting experience', 'Strong analytical skills'],
    responsibilities: ['Lead client engagements', 'Develop strategic frameworks'],
    qualifications: ['MBA preferred', 'Big 4 or MBB experience'],
    skills: ['Strategy', 'Financial Modeling', 'M&A', 'Due Diligence', 'Leadership'],
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    scrapedAt: new Date().toISOString(),
    isActive: true,
    matchScore: {
      overall: 87,
      breakdown: {
        skills: 90,
        experience: 85,
        location: 80,
        seniority: 95,
        industry: 88,
        compensation: 75,
      },
      matchedSkills: ['Strategy', 'Financial Modeling', 'Leadership'],
      missingSkills: ['M&A', 'Due Diligence'],
      reasoning: 'Strong alignment on strategic consulting skills and seniority level.',
      confidence: 0.92,
    },
    aiSummary: 'Excellent opportunity at a top-tier consulting firm for a seasoned strategist.',
    whyRelevant: 'Matches your background in strategy consulting and leadership roles.',
    industries: ['Consulting', 'Finance'],
    isBookmarked: false,
    isHidden: false,
    ...overrides,
  }
}
