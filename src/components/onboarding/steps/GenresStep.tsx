'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GENRES, MAX_GENRES } from '@/lib/constants'
import type { CreateProfileInput } from '@/lib/validations/profile'
import { cn } from '@/lib/utils'

interface GenresStepProps {
  data: Partial<CreateProfileInput>
  updateData: (data: Partial<CreateProfileInput>) => void
  onNext: () => void
  onBack: () => void
}

export function GenresStep({ data, updateData, onNext, onBack }: GenresStepProps) {
  const [selected, setSelected] = useState<string[]>(data.favorite_genres || [])
  const [error, setError] = useState<string | null>(null)

  const toggleGenre = (genre: string) => {
    setSelected((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre)
      }
      if (prev.length >= MAX_GENRES) {
        setError(`You can select up to ${MAX_GENRES} genres`)
        return prev
      }
      setError(null)
      return [...prev, genre]
    })
  }

  const handleNext = () => {
    if (selected.length === 0) {
      setError('Please select at least one genre')
      return
    }
    updateData({ favorite_genres: selected as CreateProfileInput['favorite_genres'] })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          What types of games do you enjoy? Select up to {MAX_GENRES} genres.
        </p>
        <p className="text-xs text-muted-foreground">
          {selected.length}/{MAX_GENRES} selected
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => (
          <Badge
            key={genre}
            variant={selected.includes(genre) ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer px-3 py-2 text-sm transition-colors',
              selected.includes(genre)
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'hover:bg-accent'
            )}
            onClick={() => toggleGenre(genre)}
          >
            {genre}
          </Badge>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="button" onClick={handleNext} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  )
}
