'use client'

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { jobsApi, bookmarksApi, applicationsApi } from '@/lib/api'
import type { SearchFilters, SortOption } from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

// ============================================================
// Query Keys
// ============================================================

export const jobQueryKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobQueryKeys.all, 'list'] as const,
  list: (params: object) => [...jobQueryKeys.lists(), params] as const,
  details: () => [...jobQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobQueryKeys.details(), id] as const,
  recommendations: () => [...jobQueryKeys.all, 'recommendations'] as const,
  similar: (id: string) => [...jobQueryKeys.all, 'similar', id] as const,
}

// ============================================================
// useJobs — paginated, filtered job list
// ============================================================

export interface UseJobsOptions {
  search?: string
  filters?: Partial<SearchFilters>
  sortBy?: SortOption
  pageSize?: number
  enabled?: boolean
}

export function useJobs(options: UseJobsOptions = {}) {
  const {
    search = '',
    filters = {},
    sortBy = 'match_score',
    pageSize = DEFAULT_PAGE_SIZE,
    enabled = true,
  } = options

  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: jobQueryKeys.list({ search, filters, sortBy, page, pageSize }),
    queryFn: () => jobsApi.getJobs({ page, pageSize, search, filters, sortBy }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  })

  const goToPage = useCallback((p: number) => setPage(p), [])
  const nextPage = useCallback(() => setPage((p) => p + 1), [])
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), [])

  // Reset page when filters change
  const resetPage = useCallback(() => setPage(1), [])

  return {
    jobs: data?.jobs || [],
    total: data?.total || 0,
    page,
    pageSize,
    totalPages: data ? Math.ceil(data.total / pageSize) : 0,
    hasNext: data ? page < Math.ceil(data.total / pageSize) : false,
    hasPrev: page > 1,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
  }
}

// ============================================================
// useJob — single job detail
// ============================================================

export function useJob(id: string, enabled = true) {
  return useQuery({
    queryKey: jobQueryKeys.detail(id),
    queryFn: () => jobsApi.getJob(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================
// useRecommendations — AI-recommended jobs
// ============================================================

export function useRecommendations(limit = 10) {
  return useQuery({
    queryKey: jobQueryKeys.recommendations(),
    queryFn: () => jobsApi.getRecommendations(limit),
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================
// useSimilarJobs
// ============================================================

export function useSimilarJobs(jobId: string, limit = 5) {
  return useQuery({
    queryKey: jobQueryKeys.similar(jobId),
    queryFn: () => jobsApi.getSimilarJobs(jobId, limit),
    enabled: !!jobId,
    staleTime: 10 * 60 * 1000,
  })
}

// ============================================================
// useBookmarkJob — mutation
// ============================================================

export function useBookmarkJob() {
  const queryClient = useQueryClient()

  const bookmarkMutation = useMutation({
    mutationFn: ({ jobId, folderId, notes }: { jobId: string; folderId?: string; notes?: string }) =>
      bookmarksApi.bookmarkJob(jobId, folderId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })

  const unbookmarkMutation = useMutation({
    mutationFn: (bookmarkId: string) => bookmarksApi.unbookmarkJob(bookmarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })

  return {
    bookmark: bookmarkMutation.mutateAsync,
    unbookmark: unbookmarkMutation.mutateAsync,
    isBookmarking: bookmarkMutation.isPending,
    isUnbookmarking: unbookmarkMutation.isPending,
  }
}

// ============================================================
// useTrackApplication — mutation
// ============================================================

export function useTrackApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status?: string }) =>
      applicationsApi.createApplication(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.all })
    },
  })
}

// ============================================================
// useHideJob — mutation
// ============================================================

export function useHideJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => jobsApi.hideJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.lists() })
    },
  })
}

// ============================================================
// useFilters — filter state management
// ============================================================

export function useFilters(initialFilters: Partial<SearchFilters> = {}) {
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    sources: [],
    locations: [],
    remoteTypes: [],
    seniorityLevels: [],
    minMatchScore: 0,
    maxMatchScore: 100,
    industries: [],
    skills: [],
    ...initialFilters,
  })

  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      sources: [],
      locations: [],
      remoteTypes: [],
      seniorityLevels: [],
      minMatchScore: 0,
      maxMatchScore: 100,
      industries: [],
      skills: [],
    })
  }, [])

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'minMatchScore' && (value as number) === 0) return count
    if (key === 'maxMatchScore' && (value as number) === 100) return count
    if (Array.isArray(value) && value.length === 0) return count
    if (!value) return count
    return count + 1
  }, 0)

  return {
    filters,
    updateFilter,
    setFilters,
    resetFilters,
    activeFilterCount,
  }
}
