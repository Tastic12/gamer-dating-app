'use client'

import { useState } from 'react'
import { Mic, MicOff, Trophy, Coffee, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PLAY_TIMES, PLAYSTYLES } from '@/lib/constants'
import type { CreateProfileInput } from '@/lib/validations/profile'
import { cn } from '@/lib/utils'

interface PlaystyleStepProps {
  data: Partial<CreateProfileInput>
  updateData: (data: Partial<CreateProfileInput>) => void
  onNext: () => void
  onBack: () => void
}

const playstyleInfo = {
  casual: {
    icon: Coffee,
    label: 'Casual',
    description: 'I play for fun and relaxation',
  },
  competitive: {
    icon: Trophy,
    label: 'Competitive',
    description: 'I play to win and improve',
  },
  both: {
    icon: Users,
    label: 'Both',
    description: 'Depends on my mood and the game',
  },
}

export function PlaystyleStep({ data, updateData, onNext, onBack }: PlaystyleStepProps) {
  const [playstyle, setPlaystyle] = useState<string>(data.playstyle || '')
  const [voiceChat, setVoiceChat] = useState<boolean>(data.voice_chat ?? false)
  const [playTimes, setPlayTimes] = useState<string[]>(data.typical_play_times || [])
  const [error, setError] = useState<string | null>(null)

  const togglePlayTime = (time: string) => {
    setPlayTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  const handleNext = () => {
    if (!playstyle) {
      setError('Please select your playstyle')
      return
    }

    updateData({
      playstyle: playstyle as CreateProfileInput['playstyle'],
      voice_chat: voiceChat,
      typical_play_times: playTimes as CreateProfileInput['typical_play_times'],
    })
    onNext()
  }

  return (
    <div className="space-y-8">
      {/* Playstyle selection */}
      <div className="space-y-4">
        <Label className="text-base">How would you describe your playstyle?</Label>
        <RadioGroup value={playstyle} onValueChange={setPlaystyle} className="grid gap-3">
          {PLAYSTYLES.map((style) => {
            const info = playstyleInfo[style]
            const Icon = info.icon
            return (
              <Label
                key={style}
                htmlFor={style}
                className={cn(
                  'flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors',
                  playstyle === style
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <RadioGroupItem value={style} id={style} className="sr-only" />
                <Icon
                  className={cn(
                    'h-6 w-6',
                    playstyle === style ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <div>
                  <p className="font-medium">{info.label}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </div>
              </Label>
            )
          })}
        </RadioGroup>
      </div>

      {/* Voice chat preference */}
      <div className="space-y-4">
        <Label className="text-base">Do you use voice chat?</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setVoiceChat(true)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors',
              voiceChat
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/50'
            )}
          >
            <Mic className="h-5 w-5" />
            <span className="font-medium">Yes</span>
          </button>
          <button
            type="button"
            onClick={() => setVoiceChat(false)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors',
              !voiceChat
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/50'
            )}
          >
            <MicOff className="h-5 w-5" />
            <span className="font-medium">No</span>
          </button>
        </div>
      </div>

      {/* Play times */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">When do you usually play? (optional)</Label>
          <p className="text-sm text-muted-foreground">Select all that apply</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PLAY_TIMES.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => togglePlayTime(time)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                playTimes.includes(time)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {time}
            </button>
          ))}
        </div>
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
