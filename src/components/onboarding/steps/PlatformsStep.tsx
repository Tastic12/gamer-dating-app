'use client'

import { useState } from 'react'
import { Monitor, Gamepad2, MonitorSmartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLATFORMS } from '@/lib/constants'
import type { CreateProfileInput } from '@/lib/validations/profile'
import { cn } from '@/lib/utils'

interface PlatformsStepProps {
  data: Partial<CreateProfileInput>
  updateData: (data: Partial<CreateProfileInput>) => void
  onNext: () => void
  onBack: () => void
}

const platformIcons: Record<string, React.ReactNode> = {
  PC: <Monitor className="h-8 w-8" />,
  PlayStation: <Gamepad2 className="h-8 w-8" />,
  Xbox: <Gamepad2 className="h-8 w-8" />,
  'Nintendo Switch': <Gamepad2 className="h-8 w-8" />,
  Mobile: <MonitorSmartphone className="h-8 w-8" />,
}

export function PlatformsStep({ data, updateData, onNext, onBack }: PlatformsStepProps) {
  const [selected, setSelected] = useState<string[]>(data.platforms || [])
  const [error, setError] = useState<string | null>(null)

  const togglePlatform = (platform: string) => {
    setSelected((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    )
    setError(null)
  }

  const handleNext = () => {
    if (selected.length === 0) {
      setError('Please select at least one platform')
      return
    }
    updateData({ platforms: selected as CreateProfileInput['platforms'] })
    onNext()
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Select all the platforms you play on. This helps us match you with compatible players.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PLATFORMS.map((platform) => (
          <button
            key={platform}
            type="button"
            onClick={() => togglePlatform(platform)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
              selected.includes(platform)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50'
            )}
          >
            {platformIcons[platform]}
            <span className="text-sm font-medium">{platform}</span>
          </button>
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
