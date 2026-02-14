'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  ChevronLeft,
  ChevronRight,
  User,
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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const age = differenceInYears(new Date(), new Date(profile.date_of_birth))
  
  const photos = profile.photo_urls || []
  const hasPhotos = photos.length > 0
  const hasMultiplePhotos = photos.length > 1

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <Card className="overflow-hidden">
      {/* Photo Gallery / Profile Header */}
      <div className="relative">
        {hasPhotos ? (
          <>
            {/* Main Photo */}
            <div className="relative aspect-[4/5] w-full bg-muted">
              <Image
                src={photos[currentPhotoIndex]}
                alt={`${profile.display_name}'s photo`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
                priority
              />
              
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Photo navigation arrows */}
              {hasMultiplePhotos && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/60"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/60"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              
              {/* Photo indicators */}
              {hasMultiplePhotos && (
                <div className="absolute left-0 right-0 top-3 flex justify-center gap-1 px-4">
                  {photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-all',
                        idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Name overlay on photo */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h2 className="text-2xl font-bold drop-shadow-lg">
                {profile.display_name}, {age}
              </h2>
              <p className="text-white/90 drop-shadow">
                {profile.pronouns && `${profile.pronouns} • `}
                {profile.region && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.region}
                  </span>
                )}
              </p>
            </div>

            {/* Compatibility Score Badge */}
            {profile.compatibility_score > 0 && (
              <div className="absolute right-3 top-10">
                <Badge className="bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm">
                  {profile.compatibility_score} match points
                </Badge>
              </div>
            )}
          </>
        ) : (
          /* Fallback when no photos */
          <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-6">
            {/* Avatar placeholder */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-background text-5xl font-bold text-primary shadow-lg">
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
