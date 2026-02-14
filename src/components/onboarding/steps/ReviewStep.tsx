'use client'

import { differenceInYears } from 'date-fns'
import { Pencil, MapPin, Gamepad2, Mic, MicOff, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CreateProfileInput } from '@/lib/validations/profile'

interface ReviewStepProps {
  data: Partial<CreateProfileInput>
  onBack: () => void
  onEdit: (step: number) => void
  children: React.ReactNode
}

export function ReviewStep({ data, onBack, onEdit, children }: ReviewStepProps) {
  const age = data.date_of_birth
    ? differenceInYears(new Date(), data.date_of_birth)
    : null

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Review your profile information before completing setup. You can edit any section by
        clicking the edit button.
      </p>

      {/* Basic Info */}
      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Basic Info</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(0)}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">{data.display_name}</span>
            {age && <span className="text-muted-foreground"> • {age} years old</span>}
          </p>
          {data.pronouns && <p className="text-muted-foreground">{data.pronouns}</p>}
          {data.region && (
            <p className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {data.region}
            </p>
          )}
        </div>
      </section>

      {/* Gaming Setup */}
      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Gaming Setup</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Platforms</p>
            <div className="flex flex-wrap gap-1">
              {data.platforms?.map((platform) => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  <Gamepad2 className="mr-1 h-3 w-3" />
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Favorite Genres */}
      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Favorite Genres</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {data.favorite_genres?.map((genre) => (
            <Badge key={genre} variant="outline" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>
      </section>

      {/* Top Games */}
      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Top Games</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </div>
        <ul className="space-y-1 text-sm">
          {data.top_games?.map((game, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {i + 1}
              </span>
              {game}
            </li>
          ))}
        </ul>
      </section>

      {/* Playstyle */}
      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Playstyle</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <p className="capitalize">
            <span className="font-medium">{data.playstyle}</span> player
          </p>
          <p className="flex items-center gap-1 text-muted-foreground">
            {data.voice_chat ? (
              <>
                <Mic className="h-3 w-3" /> Uses voice chat
              </>
            ) : (
              <>
                <MicOff className="h-3 w-3" /> Prefers no voice chat
              </>
            )}
          </p>
          {data.typical_play_times && data.typical_play_times.length > 0 && (
            <p className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              Plays: {data.typical_play_times.join(', ')}
            </p>
          )}
        </div>
      </section>

      {/* Bio */}
      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Bio</h3>
          <Button variant="ghost" size="sm" onClick={() => onEdit(5)}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
        </div>
        {data.bio ? (
          <p className="text-sm text-muted-foreground">{data.bio}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground">No bio added</p>
        )}
      </section>

      <div className="space-y-3 pt-4">
        {children}
        <Button type="button" variant="outline" onClick={onBack} className="w-full">
          Back
        </Button>
      </div>
    </div>
  )
}
