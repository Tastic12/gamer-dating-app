'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAX_TOP_GAMES } from '@/lib/constants'
import type { CreateProfileInput } from '@/lib/validations/profile'

interface GamesStepProps {
  data: Partial<CreateProfileInput>
  updateData: (data: Partial<CreateProfileInput>) => void
  onNext: () => void
  onBack: () => void
}

export function GamesStep({ data, updateData, onNext, onBack }: GamesStepProps) {
  const [games, setGames] = useState<string[]>(
    data.top_games?.length ? data.top_games : ['']
  )
  const [error, setError] = useState<string | null>(null)

  const updateGame = (index: number, value: string) => {
    const newGames = [...games]
    newGames[index] = value
    setGames(newGames)
    setError(null)
  }

  const addGame = () => {
    if (games.length < MAX_TOP_GAMES) {
      setGames([...games, ''])
    }
  }

  const removeGame = (index: number) => {
    if (games.length > 1) {
      setGames(games.filter((_, i) => i !== index))
    }
  }

  const handleNext = () => {
    const validGames = games.map((g) => g.trim()).filter((g) => g.length > 0)
    
    if (validGames.length === 0) {
      setError('Please add at least one game')
      return
    }

    if (validGames.some((g) => g.length > 50)) {
      setError('Game names must be less than 50 characters')
      return
    }

    updateData({ top_games: validGames })
    onNext()
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        What are your favorite games right now? Add up to {MAX_TOP_GAMES} games you&apos;re
        currently playing or love.
      </p>

      <div className="space-y-3">
        {games.map((game, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor={`game-${index}`} className="sr-only">
                Game {index + 1}
              </Label>
              <Input
                id={`game-${index}`}
                placeholder={`Game ${index + 1} (e.g., Valorant, Elden Ring)`}
                value={game}
                onChange={(e) => updateGame(index, e.target.value)}
                maxLength={50}
              />
            </div>
            {games.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeGame(index)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove game</span>
              </Button>
            )}
          </div>
        ))}
      </div>

      {games.length < MAX_TOP_GAMES && (
        <Button type="button" variant="outline" onClick={addGame} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add another game
        </Button>
      )}

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
