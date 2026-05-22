'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Sparkles, X, Loader2, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearch } from '@/hooks/useSearch'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  autoFocus?: boolean
  defaultValue?: string
  showSuggestions?: boolean
}

const RECENT_SEARCHES_KEY = 'recent_searches'

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return
  try {
    const recent = getRecentSearches()
    const updated = [query, ...recent.filter((q) => q !== query)].slice(0, 5)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch {
    // Ignore
  }
}

export function SearchBar({
  onSearch,
  placeholder = 'Search jobs with AI — try "senior consultant in fintech"',
  className,
  size = 'md',
  autoFocus = false,
  defaultValue = '',
  showSuggestions = true,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const { query, setQuery, clearSearch, suggestions, isSearching } = useSearch(defaultValue, {
    debounceMs: 300,
    minQueryLength: 2,
  })

  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (q: string = query) => {
    if (!q.trim()) return
    saveRecentSearch(q.trim())
    setRecentSearches(getRecentSearches())
    setIsFocused(false)
    onSearch?.(q.trim())
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') {
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  const showDropdown =
    isFocused &&
    showSuggestions &&
    (suggestions.length > 0 || recentSearches.length > 0 || query.length === 0)

  const sizeClasses = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-sm px-4',
    lg: 'h-12 text-base px-5',
  }

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border bg-card transition-all duration-200',
          isFocused
            ? 'border-gold-500 ring-2 ring-gold-500/20 shadow-glow'
            : 'border-border hover:border-gold-500/50',
          sizeClasses[size]
        )}
      >
        {isSearching ? (
          <Loader2 className={cn('shrink-0 animate-spin text-gold-500', iconSizes[size])} />
        ) : (
          <Search className={cn('shrink-0 text-muted-foreground', iconSizes[size])} />
        )}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        <div className="flex items-center gap-1 shrink-0">
          {query && (
            <button
              onClick={() => {
                clearSearch()
                inputRef.current?.focus()
              }}
              className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className={iconSizes[size]} />
            </button>
          )}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted px-2 py-0.5">
            <Sparkles className="h-3 w-3 text-gold-500" />
            <span className="text-xs font-medium text-muted-foreground">AI</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-card shadow-lg overflow-hidden"
          >
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recent Searches
                </div>
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => {
                      setQuery(search)
                      handleSubmit(search)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {search}
                  </button>
                ))}
              </div>
            )}

            {query.length === 0 && (
              <div className="border-t border-border p-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Suggested
                </div>
                {[
                  'Senior Strategy Consultant',
                  'Director of Operations',
                  'VP Finance remote',
                  'Management Consultant MBB',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion)
                      handleSubmit(suggestion)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <TrendingUp className="h-3.5 w-3.5 shrink-0 text-gold-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {query.length >= 2 && suggestions.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  AI Suggestions
                </div>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion)
                      handleSubmit(suggestion)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-gold-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {query.length >= 2 && (
              <div className="border-t border-border p-2">
                <button
                  onClick={() => handleSubmit()}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gold-600 dark:text-gold-400 transition-colors hover:bg-gold-50 dark:hover:bg-gold-900/20"
                >
                  <Search className="h-3.5 w-3.5 shrink-0" />
                  Search for &ldquo;{query}&rdquo;
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBar
