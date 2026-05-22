'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { aiApi } from '@/lib/api'

export interface UseSearchOptions {
  debounceMs?: number
  minQueryLength?: number
  enabled?: boolean
}

export function useSearch(initialQuery = '', options: UseSearchOptions = {}) {
  const { debounceMs = 300, minQueryLength = 2, enabled = true } = options

  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [isTyping, setIsTyping] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsTyping(true)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
      setIsTyping(false)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, debounceMs])

  const { data: suggestions, isFetching: isFetchingSuggestions } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => aiApi.getSearchSuggestions(debouncedQuery),
    enabled: enabled && debouncedQuery.length >= minQueryLength,
    staleTime: 30_000,
    retry: false,
  })

  const clearSearch = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
  }, [])

  const setQueryImmediate = useCallback((q: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    setQuery(q)
    setDebouncedQuery(q)
    setIsTyping(false)
  }, [])

  return {
    query,
    setQuery,
    debouncedQuery,
    setQueryImmediate,
    clearSearch,
    isTyping,
    isFetchingSuggestions,
    suggestions: suggestions?.suggestions || [],
    isSearching: isTyping || isFetchingSuggestions,
  }
}

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
