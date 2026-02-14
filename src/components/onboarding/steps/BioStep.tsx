'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MAX_BIO_LENGTH } from '@/lib/constants'
import type { CreateProfileInput } from '@/lib/validations/profile'

interface BioStepProps {
  data: Partial<CreateProfileInput>
  updateData: (data: Partial<CreateProfileInput>) => void
  onNext: () => void
  onBack: () => void
}

const bioPrompts = [
  "What's your favorite gaming memory?",
  'What are you looking for in a gaming partner?',
  'Do you have any gaming goals or achievements you are proud of?',
  "What's your gaming setup like?",
]

export function BioStep({ data, updateData, onNext, onBack }: BioStepProps) {
  const [bio, setBio] = useState(data.bio || '')

  const handleNext = () => {
    updateData({ bio: bio.trim() || null })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="bio">About You (optional)</Label>
        <Textarea
          id="bio"
          placeholder="Tell other gamers a bit about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={MAX_BIO_LENGTH}
          rows={5}
          className="resize-none"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>This will appear on your profile</span>
          <span>
            {bio.length}/{MAX_BIO_LENGTH}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Need inspiration? Try answering:</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {bioPrompts.map((prompt, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary">•</span>
              {prompt}
            </li>
          ))}
        </ul>
      </div>

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
