'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PLATFORMS, GENRES, PLAYSTYLES, REGIONS } from '@/lib/constants'
import type { DiscoveryFilters } from '@/app/(main)/discover/actions'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  open: boolean
  onClose: () => void
  filters: DiscoveryFilters
  onApply: (filters: DiscoveryFilters) => void
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

  const handleApply = () => {
    onApply(localFilters)
  }

  const handleReset = () => {
    setLocalFilters({})
  }

  const hasFilters =
    (localFilters.platforms?.length || 0) > 0 ||
    (localFilters.genres?.length || 0) > 0 ||
    (localFilters.regions?.length || 0) > 0 ||
    localFilters.playstyle ||
    localFilters.voiceChat !== undefined

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Find your perfect gaming match</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Platforms */}
          <div className="space-y-3">
            <Label>Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <Badge
                  key={platform}
                  variant={localFilters.platforms?.includes(platform) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => togglePlatform(platform)}
                >
                  {platform}
                </Badge>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-3">
            <Label>Genres</Label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <Badge
                  key={genre}
                  variant={localFilters.genres?.includes(genre) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer text-xs',
                    localFilters.genres?.includes(genre) && 'bg-primary'
                  )}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Playstyle */}
          <div className="space-y-3">
            <Label>Playstyle</Label>
            <Select
              value={localFilters.playstyle || 'any'}
              onValueChange={(v) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  playstyle: v === 'any' ? undefined : v,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any playstyle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any playstyle</SelectItem>
                {PLAYSTYLES.map((style) => (
                  <SelectItem key={style} value={style} className="capitalize">
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Chat */}
          <div className="space-y-3">
            <Label>Voice Chat</Label>
            <Select
              value={
                localFilters.voiceChat === undefined
                  ? 'any'
                  : localFilters.voiceChat
                    ? 'yes'
                    : 'no'
              }
              onValueChange={(v) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  voiceChat: v === 'any' ? undefined : v === 'yes',
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="yes">Uses voice chat</SelectItem>
                <SelectItem value="no">No voice chat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Regions */}
          <div className="space-y-3">
            <Label>Regions</Label>
            <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
              {REGIONS.map((region) => (
                <Badge
                  key={region}
                  variant={localFilters.regions?.includes(region) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleRegion(region)}
                >
                  {region}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 flex-col gap-2 sm:flex-col">
          <Button onClick={handleApply} className="w-full">
            Apply Filters
          </Button>
          {hasFilters && (
            <Button variant="outline" onClick={handleReset} className="w-full">
              Reset All
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
