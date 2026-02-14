'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, X } from 'lucide-react'
import { PhotoUpload } from './PhotoUpload'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateOfBirthPicker } from '@/components/ui/date-of-birth-picker'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validations/profile'
import {
  PLATFORMS,
  PRONOUNS,
  REGIONS,
  GENRES,
  PLAYSTYLES,
  PLAY_TIMES,
  MAX_GENRES,
  MAX_TOP_GAMES,
  MAX_BIO_LENGTH,
} from '@/lib/constants'
import type { Profile } from '@/types/database'
import { cn } from '@/lib/utils'

interface ProfileEditFormProps {
  profile: Profile
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photos, setPhotos] = useState<string[]>(profile.photo_urls || [])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      display_name: profile.display_name,
      date_of_birth: new Date(profile.date_of_birth),
      pronouns: profile.pronouns as UpdateProfileInput['pronouns'],
      region: profile.region as UpdateProfileInput['region'],
      bio: profile.bio || '',
      platforms: profile.platforms as UpdateProfileInput['platforms'],
      favorite_genres: profile.favorite_genres as UpdateProfileInput['favorite_genres'],
      top_games: profile.top_games,
      playstyle: profile.playstyle as UpdateProfileInput['playstyle'],
      voice_chat: profile.voice_chat,
      typical_play_times: profile.typical_play_times as UpdateProfileInput['typical_play_times'],
    },
  })

  const selectedPlatforms = watch('platforms') || []
  const selectedGenres = watch('favorite_genres') || []
  const selectedPlayTimes = watch('typical_play_times') || []
  const topGames = watch('top_games') || []
  const bio = watch('bio') || ''

  const togglePlatform = (platform: string) => {
    const current = selectedPlatforms as string[]
    if (current.includes(platform)) {
      setValue(
        'platforms',
        current.filter((p) => p !== platform) as UpdateProfileInput['platforms']
      )
    } else {
      setValue('platforms', [...current, platform] as UpdateProfileInput['platforms'])
    }
  }

  const toggleGenre = (genre: string) => {
    const current = selectedGenres as string[]
    if (current.includes(genre)) {
      setValue(
        'favorite_genres',
        current.filter((g) => g !== genre) as UpdateProfileInput['favorite_genres']
      )
    } else if (current.length < MAX_GENRES) {
      setValue('favorite_genres', [...current, genre] as UpdateProfileInput['favorite_genres'])
    }
  }

  const togglePlayTime = (time: string) => {
    const current = selectedPlayTimes as string[]
    if (current.includes(time)) {
      setValue(
        'typical_play_times',
        current.filter((t) => t !== time) as UpdateProfileInput['typical_play_times']
      )
    } else {
      setValue('typical_play_times', [...current, time] as UpdateProfileInput['typical_play_times'])
    }
  }

  const updateGame = (index: number, value: string) => {
    const newGames = [...topGames]
    newGames[index] = value
    setValue('top_games', newGames)
  }

  const addGame = () => {
    if (topGames.length < MAX_TOP_GAMES) {
      setValue('top_games', [...topGames, ''])
    }
  }

  const removeGame = (index: number) => {
    if (topGames.length > 1) {
      setValue(
        'top_games',
        topGames.filter((_, i) => i !== index)
      )
    }
  }

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      const updateData = {
        ...data,
        date_of_birth: data.date_of_birth?.toISOString().split('T')[0],
        top_games: data.top_games?.filter((g) => g.trim().length > 0),
        photo_urls: photos,
      }

      const { error: updateError } = await supabase
        .from('profiles')
        // @ts-expect-error - types not yet synced with Supabase
        .update(updateData)
        .eq('id', profile.id)

      if (updateError) throw updateError

      router.push('/profile')
      router.refresh()
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Profile Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add photos to show off your personality. Your first photo will be your main profile picture.
          </p>
        </CardHeader>
        <CardContent>
          <PhotoUpload
            userId={profile.id}
            currentPhotos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={6}
          />
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input id="display_name" {...register('display_name')} />
            {errors.display_name && (
              <p className="text-xs text-destructive">{errors.display_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Controller
              control={control}
              name="date_of_birth"
              render={({ field }) => (
                <DateOfBirthPicker
                  value={field.value}
                  onChange={field.onChange}
                  minAge={18}
                  maxAge={100}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pronouns">Pronouns</Label>
            <Controller
              control={control}
              name="pronouns"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pronouns" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRONOUNS.map((pronoun) => (
                      <SelectItem key={pronoun} value={pronoun}>
                        {pronoun}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Controller
              control={control}
              name="region"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              rows={4}
              maxLength={MAX_BIO_LENGTH}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/{MAX_BIO_LENGTH}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => (
              <Badge
                key={platform}
                variant={(selectedPlatforms as string[]).includes(platform) ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1"
                onClick={() => togglePlatform(platform)}
              >
                {platform}
              </Badge>
            ))}
          </div>
          {errors.platforms && (
            <p className="mt-2 text-xs text-destructive">{errors.platforms.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Genres */}
      <Card>
        <CardHeader>
          <CardTitle>Favorite Genres</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select up to {MAX_GENRES} ({(selectedGenres as string[]).length}/{MAX_GENRES})
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <Badge
                key={genre}
                variant={(selectedGenres as string[]).includes(genre) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer px-3 py-1',
                  !(selectedGenres as string[]).includes(genre) &&
                    (selectedGenres as string[]).length >= MAX_GENRES &&
                    'opacity-50'
                )}
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Games */}
      <Card>
        <CardHeader>
          <CardTitle>Top Games</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topGames.map((game, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Game ${index + 1}`}
                value={game}
                onChange={(e) => updateGame(index, e.target.value)}
                maxLength={50}
              />
              {topGames.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGame(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {topGames.length < MAX_TOP_GAMES && (
            <Button type="button" variant="outline" onClick={addGame} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add game
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Playstyle */}
      <Card>
        <CardHeader>
          <CardTitle>Playstyle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Style</Label>
            <Controller
              control={control}
              name="playstyle"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select playstyle" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAYSTYLES.map((style) => (
                      <SelectItem key={style} value={style} className="capitalize">
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Voice Chat</Label>
            <Controller
              control={control}
              name="voice_chat"
              render={({ field }) => (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={field.value ? 'default' : 'outline'}
                    onClick={() => field.onChange(true)}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={!field.value ? 'default' : 'outline'}
                    onClick={() => field.onChange(false)}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Play Times</Label>
            <div className="flex flex-wrap gap-2">
              {PLAY_TIMES.map((time) => (
                <Badge
                  key={time}
                  variant={(selectedPlayTimes as string[]).includes(time) ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => togglePlayTime(time)}
                >
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )
}
