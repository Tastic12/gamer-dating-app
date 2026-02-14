'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { PLATFORMS, GENRES, PLAYSTYLES, REGIONS } from '@/lib/constants'
import type { DiscoveryFilters } from '@/app/(main)/discover/actions'
import { cn } from '@/lib/utils'
import {
  Gamepad2,
  Globe,
  Mic,
  MicOff,
  Swords,
  Sparkles,
  Target,
  RotateCcw,
  Filter,
  Zap,
} from 'lucide-react'

interface FilterPanelProps {
  open: boolean
  onClose: () => void
  filters: DiscoveryFilters
  onApply: (filters: DiscoveryFilters) => void
}

// Platform icons mapping
const platformIcons: Record<string, string> = {
  PC: '🖥️',
  PlayStation: '🎮',
  Xbox: '🎮',
  Nintendo: '🕹️',
  Mobile: '📱',
}

// Genre colors for visual variety
const genreColors: Record<string, string> = {
  FPS: 'from-red-500/20 to-orange-500/20 border-red-500/30 hover:border-red-500/60',
  'Battle Royale': 'from-orange-500/20 to-yellow-500/20 border-orange-500/30 hover:border-orange-500/60',
  MOBA: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-500/60',
  RPG: 'from-blue-500/20 to-purple-500/20 border-blue-500/30 hover:border-blue-500/60',
  'MMO/MMORPG': 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30 hover:border-indigo-500/60',
  'Sports/Racing': 'from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-500/60',
  'Fighting Games': 'from-red-600/20 to-rose-500/20 border-red-600/30 hover:border-red-600/60',
  'Strategy/RTS': 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 hover:border-amber-500/60',
  Survival: 'from-stone-500/20 to-zinc-500/20 border-stone-500/30 hover:border-stone-500/60',
  Horror: 'from-slate-700/30 to-slate-900/30 border-slate-600/30 hover:border-slate-500/60',
  'Puzzle/Casual': 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 hover:border-cyan-500/60',
  Sandbox: 'from-lime-500/20 to-green-500/20 border-lime-500/30 hover:border-lime-500/60',
  'Simulation': 'from-teal-500/20 to-cyan-500/20 border-teal-500/30 hover:border-teal-500/60',
  'Indie': 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30 hover:border-fuchsia-500/60',
  'Co-op/Party': 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 hover:border-yellow-500/60',
}

export function FilterPanel({ open, onClose, filters, onApply }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<DiscoveryFilters>(filters)

  const togglePlatform = (platform: string) => {
    setLocalFilters((prev) => {
      const current = prev.platforms || []
      if (current.includes(platform)) {
        return { ...prev, platforms: current.filter((p) => p !== platform) }
      }
      return { ...prev, platforms: [...current, platform] }
    })
  }

  const toggleGenre = (genre: string) => {
    setLocalFilters((prev) => {
      const current = prev.genres || []
      if (current.includes(genre)) {
        return { ...prev, genres: current.filter((g) => g !== genre) }
      }
      return { ...prev, genres: [...current, genre] }
    })
  }

  const toggleRegion = (region: string) => {
    setLocalFilters((prev) => {
      const current = prev.regions || []
      if (current.includes(region)) {
        return { ...prev, regions: current.filter((r) => r !== region) }
      }
      return { ...prev, regions: [...current, region] }
    })
  }

  const togglePlaystyle = (playstyle: string) => {
    setLocalFilters((prev) => {
      if (prev.playstyle === playstyle) {
        return { ...prev, playstyle: undefined }
      }
      return { ...prev, playstyle }
    })
  }

  const toggleVoiceChat = (value: boolean | undefined) => {
    setLocalFilters((prev) => {
      if (prev.voiceChat === value) {
        return { ...prev, voiceChat: undefined }
      }
      return { ...prev, voiceChat: value }
    })
  }

  const handleApply = () => {
    onApply(localFilters)
  }

  const handleReset = () => {
    setLocalFilters({})
  }

  const activeFilterCount =
    (localFilters.platforms?.length || 0) +
    (localFilters.genres?.length || 0) +
    (localFilters.regions?.length || 0) +
    (localFilters.playstyle ? 1 : 0) +
    (localFilters.voiceChat !== undefined ? 1 : 0)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l-2 border-primary/20 bg-gradient-to-b from-background via-background to-primary/5 sm:max-w-lg"
      >
        <SheetHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/25">
              <Filter className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <SheetTitle className="text-xl">Find Your Player 2</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {activeFilterCount > 0
                  ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`
                  : 'Customize your search'}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-8 px-1">
          {/* Platforms Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold tracking-tight">Platforms</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PLATFORMS.map((platform) => {
                const isSelected = localFilters.platforms?.includes(platform)
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={cn(
                      'group relative flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-md shadow-primary/10'
                        : 'border-muted-foreground/20 bg-card/50 hover:border-primary/40 hover:bg-card'
                    )}
                  >
                    <span className="text-lg">{platformIcons[platform] || '🎮'}</span>
                    <span>{platform}</span>
                    {isSelected && (
                      <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Genres Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-primary" />
              <h3 className="font-semibold tracking-tight">Genres</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => {
                const isSelected = localFilters.genres?.includes(genre)
                const colorClass = genreColors[genre] || 'from-primary/20 to-primary/10 border-primary/30'
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                      isSelected
                        ? `bg-gradient-to-r ${colorClass} shadow-sm`
                        : 'border-muted-foreground/20 bg-card/30 hover:bg-card/60'
                    )}
                  >
                    {genre}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Playstyle Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold tracking-tight">Playstyle</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PLAYSTYLES.map((style) => {
                const isSelected = localFilters.playstyle === style
                const styleConfig = {
                  casual: { icon: '☕', label: 'Casual', color: 'from-green-500 to-emerald-500' },
                  competitive: { icon: '🏆', label: 'Competitive', color: 'from-red-500 to-orange-500' },
                  both: { icon: '⚡', label: 'Both', color: 'from-purple-500 to-pink-500' },
                }[style] || { icon: '🎮', label: style, color: 'from-primary to-primary' }

                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => togglePlaystyle(style)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 transition-all duration-200',
                      isSelected
                        ? `border-transparent bg-gradient-to-br ${styleConfig.color} text-white shadow-lg`
                        : 'border-muted-foreground/20 bg-card/50 hover:border-primary/40 hover:bg-card'
                    )}
                  >
                    <span className="text-2xl">{styleConfig.icon}</span>
                    <span className="text-sm font-medium capitalize">{styleConfig.label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Voice Chat Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              <h3 className="font-semibold tracking-tight">Voice Chat</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toggleVoiceChat(true)}
                className={cn(
                  'flex items-center justify-center gap-3 rounded-xl border-2 px-4 py-4 transition-all duration-200',
                  localFilters.voiceChat === true
                    ? 'border-green-500/50 bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400'
                    : 'border-muted-foreground/20 bg-card/50 hover:border-green-500/30 hover:bg-card'
                )}
              >
                <Mic className="h-5 w-5" />
                <span className="font-medium">Voice On</span>
              </button>
              <button
                type="button"
                onClick={() => toggleVoiceChat(false)}
                className={cn(
                  'flex items-center justify-center gap-3 rounded-xl border-2 px-4 py-4 transition-all duration-200',
                  localFilters.voiceChat === false
                    ? 'border-slate-500/50 bg-gradient-to-br from-slate-500/20 to-zinc-500/20 text-slate-600 dark:text-slate-400'
                    : 'border-muted-foreground/20 bg-card/50 hover:border-slate-500/30 hover:bg-card'
                )}
              >
                <MicOff className="h-5 w-5" />
                <span className="font-medium">Voice Off</span>
              </button>
            </div>
          </section>

          {/* Regions Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-semibold tracking-tight">Regions</h3>
            </div>
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-lg border border-muted-foreground/10 bg-card/30 p-3">
              {REGIONS.map((region) => {
                const isSelected = localFilters.regions?.includes(region)
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                      isSelected
                        ? 'border-primary/50 bg-primary/20 text-primary'
                        : 'border-muted-foreground/20 bg-card/50 hover:border-primary/30 hover:bg-card'
                    )}
                  >
                    {region}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        <SheetFooter className="mt-8 flex-col gap-3 border-t border-muted-foreground/10 pt-6 sm:flex-col">
          <Button
            onClick={handleApply}
            className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 py-6 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            <Zap className="h-5 w-5" />
            Apply Filters
          </Button>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All Filters
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
