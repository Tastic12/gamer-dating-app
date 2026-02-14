'use client'

import { useState } from 'react'
import { differenceInYears } from 'date-fns'
import {
  Heart,
  X,
  MapPin,
  Gamepad2,
  Mic,
  MicOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { DiscoveryProfile } from '@/app/(main)/discover/actions'
import { cn } from '@/lib/utils'

interface DiscoveryCardProps {
  profile: DiscoveryProfile
  onLike: () => void
  onPass: () => void
  isActioning: boolean
}

export function DiscoveryCard({ profile, onLike, onPass, isActioning }: DiscoveryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const age = differenceInYears(new Date(), new Date(profile.date_of_birth))

  return (
    <Card className="overflow-hidden">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-6">
        {/* Avatar */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background text-4xl font-bold text-primary shadow-lg">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Name & Basic Info */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">{profile.display_name}</h2>
          <p className="text-muted-foreground">
            {age} years old
            {profile.pronouns && ` • ${profile.pronouns}`}
          </p>
          {profile.region && (
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {profile.region}
            </p>
          )}
        </div>

        {/* Compatibility Score */}
        {profile.compatibility_score > 0 && (
          <div className="absolute right-4 top-4">
            <Badge variant="secondary" className="bg-background/80">
              {profile.compatibility_score} match points
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="space-y-4 p-6">
        {/* Platforms */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Platforms</p>
          <div className="flex flex-wrap gap-2">
            {profile.platforms.map((platform) => (
              <Badge key={platform} variant="secondary">
                <Gamepad2 className="mr-1 h-3 w-3" />
                {platform}
              </Badge>
            ))}
          </div>
        </div>

        {/* Top Games */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Top Games</p>
          <div className="flex flex-wrap gap-2">
            {profile.top_games.map((game, i) => (
              <Badge key={i} variant="outline">
                {game}
              </Badge>
            ))}
          </div>
        </div>

        {/* Playstyle & Voice */}
        <div className="flex items-center gap-4 text-sm">
          <span className="capitalize">
            <span className="font-medium">{profile.playstyle}</span> player
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            {profile.voice_chat ? (
              <>
                <Mic className="h-3 w-3" /> Voice chat
              </>
            ) : (
              <>
                <MicOff className="h-3 w-3" /> No voice
              </>
            )}
          </span>
        </div>

        {/* Expandable Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>

        {expanded && (
          <div className="space-y-4 border-t pt-4">
            {/* Genres */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Favorite Genres</p>
              <div className="flex flex-wrap gap-1">
                {profile.favorite_genres.map((genre) => (
                  <Badge key={genre} variant="outline" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Play Times */}
            {profile.typical_play_times.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Usually plays</p>
                <p className="text-sm">{profile.typical_play_times.join(', ')}</p>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">About</p>
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            size="lg"
            className={cn(
              'flex-1 border-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground',
              isActioning && 'opacity-50'
            )}
            onClick={onPass}
            disabled={isActioning}
          >
            <X className="mr-2 h-5 w-5" />
            Pass
          </Button>
          <Button
            size="lg"
            className={cn(
              'flex-1 bg-green-600 hover:bg-green-700',
              isActioning && 'opacity-50'
            )}
            onClick={onLike}
            disabled={isActioning}
          >
            <Heart className="mr-2 h-5 w-5" />
            Like
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
