'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BasicInfoStep } from './steps/BasicInfoStep'
import { PlatformsStep } from './steps/PlatformsStep'
import { GenresStep } from './steps/GenresStep'
import { GamesStep } from './steps/GamesStep'
import { PlaystyleStep } from './steps/PlaystyleStep'
import { BioStep } from './steps/BioStep'
import { ReviewStep } from './steps/ReviewStep'
import type { CreateProfileInput } from '@/lib/validations/profile'

const STEPS = [
  { id: 'basic', title: 'Basic Info', description: 'Tell us about yourself' },
  { id: 'platforms', title: 'Platforms', description: 'Where do you play?' },
  { id: 'genres', title: 'Genres', description: 'What do you like to play?' },
  { id: 'games', title: 'Favorite Games', description: 'Your top 3 games' },
  { id: 'playstyle', title: 'Playstyle', description: 'How do you play?' },
  { id: 'bio', title: 'Bio', description: 'Introduce yourself' },
  { id: 'review', title: 'Review', description: 'Review your profile' },
]

const STORAGE_KEY = 'onboarding_progress'

type OnboardingData = Partial<CreateProfileInput>

interface OnboardingWizardProps {
  userId: string
  initialDateOfBirth: string | null
}

export function OnboardingWizard({ userId, initialDateOfBirth }: OnboardingWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form data from localStorage or defaults
  const [formData, setFormData] = useState<OnboardingData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Convert date string back to Date object
          if (parsed.date_of_birth) {
            parsed.date_of_birth = new Date(parsed.date_of_birth)
          }
          return parsed
        } catch {
          // Invalid JSON, start fresh
        }
      }
    }
    return {
      date_of_birth: initialDateOfBirth ? new Date(initialDateOfBirth) : undefined,
      platforms: [],
      favorite_genres: [],
      top_games: [],
      typical_play_times: [],
      voice_chat: false,
    }
  })

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
    }
  }, [formData])

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Prepare the profile data
      const profileData = {
        id: userId,
        display_name: formData.display_name!,
        date_of_birth: formData.date_of_birth!.toISOString().split('T')[0],
        pronouns: formData.pronouns || null,
        region: formData.region!,
        bio: formData.bio || null,
        platforms: formData.platforms || [],
        favorite_genres: formData.favorite_genres || [],
        top_games: formData.top_games || [],
        playstyle: formData.playstyle || null,
        voice_chat: formData.voice_chat || false,
        typical_play_times: formData.typical_play_times || [],
        onboarding_completed: true,
        email_verified: true,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await supabase.from('profiles').upsert(profileData as any)

      if (insertError) {
        throw insertError
      }

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY)

      // Redirect to discover page
      router.push('/discover')
      router.refresh()
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100
  const currentStepInfo = STEPS[currentStep]

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2">
        {STEPS.map((step, index) => (
          <button
            key={step.id}
            onClick={() => goToStep(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === currentStep
                ? 'bg-primary'
                : index < currentStep
                  ? 'bg-primary/50'
                  : 'bg-muted'
            }`}
            aria-label={`Go to step ${index + 1}: ${step.title}`}
          />
        ))}
      </div>

      {/* Current step card */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStepInfo.title}</CardTitle>
          <CardDescription>{currentStepInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {currentStep === 0 && (
            <BasicInfoStep data={formData} updateData={updateFormData} onNext={nextStep} />
          )}
          {currentStep === 1 && (
            <PlatformsStep
              data={formData}
              updateData={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 2 && (
            <GenresStep
              data={formData}
              updateData={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 3 && (
            <GamesStep
              data={formData}
              updateData={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 4 && (
            <PlaystyleStep
              data={formData}
              updateData={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 5 && (
            <BioStep
              data={formData}
              updateData={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 6 && (
            <ReviewStep data={formData} onBack={prevStep} onEdit={goToStep}>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full" size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </ReviewStep>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
