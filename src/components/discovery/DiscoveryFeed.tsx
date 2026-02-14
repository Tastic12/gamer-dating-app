'use client'

import { useState, useEffect, useRef } from 'react'
import { Filter, Loader2, RefreshCw, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DiscoveryCard } from './DiscoveryCard'
import { FilterPanel } from './FilterPanel'
import { MatchModal } from './MatchModal'
import { getDiscoveryProfiles, createSwipe, type DiscoveryProfile, type DiscoveryFilters } from '@/app/(main)/discover/actions'

interface DiscoveryFeedProps {
  userId: string
}

export function DiscoveryFeed({ userId }: DiscoveryFeedProps) {
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<DiscoveryFilters>({})
  const [matchedProfile, setMatchedProfile] = useState<DiscoveryProfile | null>(null)
  const [isActioning, setIsActioning] = useState(false)
  const hasFetched = useRef(false)

  const loadProfiles = async (newFilters?: DiscoveryFilters) => {
    setIsLoading(true)
    setError(null)
    
    const { profiles: newProfiles, error: loadError } = await getDiscoveryProfiles(
      userId,
      newFilters ?? filters,
      20,
      0
    )
    
    if (loadError) {
      setError(loadError)
    } else {
      setProfiles(newProfiles)
      setCurrentIndex(0)
    }
    
    setIsLoading(false)
  }

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      loadProfiles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSwipe = async (action: 'like' | 'pass') => {
    if (isActioning || currentIndex >= profiles.length) return
    
    const currentProfile = profiles[currentIndex]
    setIsActioning(true)
    
    const { success, isMatch, error: swipeError } = await createSwipe(
      userId,
      currentProfile.id,
      action
    )
    
    if (!success) {
      console.error('Swipe failed:', swipeError)
    }
    
    if (isMatch) {
      setMatchedProfile(currentProfile)
    }
    
    // Move to next profile
    setCurrentIndex((prev) => prev + 1)
    setIsActioning(false)
    
    // Load more if running low
    if (currentIndex >= profiles.length - 3) {
      const { profiles: moreProfiles } = await getDiscoveryProfiles(
        userId,
        filters,
        20,
        profiles.length
      )
      if (moreProfiles.length > 0) {
        setProfiles((prev) => [...prev, ...moreProfiles])
      }
    }
  }

  const handleApplyFilters = (newFilters: DiscoveryFilters) => {
    setFilters(newFilters)
    setShowFilters(false)
    loadProfiles(newFilters)
  }

  const currentProfile = profiles[currentIndex]
  const hasMoreProfiles = currentIndex < profiles.length

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="mb-4 text-muted-foreground">{error}</p>
        <Button onClick={() => loadProfiles()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Discover</h1>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Profile Card or Empty State */}
      {hasMoreProfiles && currentProfile ? (
        <DiscoveryCard
          profile={currentProfile}
          onLike={() => handleSwipe('like')}
          onPass={() => handleSwipe('pass')}
          isActioning={isActioning}
        />
      ) : (
        <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">No more profiles</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            You&apos;ve seen everyone for now. Check back later or adjust your filters.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => loadProfiles()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setShowFilters(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Adjust Filters
            </Button>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      <FilterPanel
        open={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />

      {/* Match Modal */}
      <MatchModal
        profile={matchedProfile}
        onClose={() => setMatchedProfile(null)}
      />
    </div>
  )
}
