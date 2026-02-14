import { z } from 'zod'
import { differenceInYears } from 'date-fns'
import {
  PLATFORMS,
  GENRES,
  PLAYSTYLES,
  PLAY_TIMES,
  PRONOUNS,
  REGIONS,
  MIN_AGE,
  MAX_TOP_GAMES,
  MAX_GENRES,
  MAX_BIO_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  MAX_PHOTOS,
} from '@/lib/constants'

export const displayNameSchema = z
  .string()
  .min(MIN_DISPLAY_NAME_LENGTH, `Display name must be at least ${MIN_DISPLAY_NAME_LENGTH} characters`)
  .max(MAX_DISPLAY_NAME_LENGTH, `Display name must be less than ${MAX_DISPLAY_NAME_LENGTH} characters`)
  .regex(/^[a-zA-Z0-9_]+$/, 'Display name can only contain letters, numbers, and underscores')

export const dateOfBirthSchema = z.date().refine(
  (date) => {
    const age = differenceInYears(new Date(), date)
    return age >= MIN_AGE
  },
  { message: `You must be at least ${MIN_AGE} years old` }
)

export const pronounsSchema = z.enum(PRONOUNS).optional().nullable()

export const regionSchema = z.enum(REGIONS, {
  errorMap: () => ({ message: 'Please select a region' }),
})

export const bioSchema = z
  .string()
  .max(MAX_BIO_LENGTH, `Bio must be less than ${MAX_BIO_LENGTH} characters`)
  .optional()
  .nullable()

export const platformsSchema = z
  .array(z.enum(PLATFORMS))
  .min(1, 'Please select at least one platform')

export const genresSchema = z
  .array(z.enum(GENRES))
  .min(1, 'Please select at least one genre')
  .max(MAX_GENRES, `Please select up to ${MAX_GENRES} genres`)

export const topGamesSchema = z
  .array(
    z
      .string()
      .min(1, 'Game name cannot be empty')
      .max(50, 'Game name must be less than 50 characters')
  )
  .min(1, 'Please add at least one favorite game')
  .max(MAX_TOP_GAMES, `Please add up to ${MAX_TOP_GAMES} games`)

export const playstyleSchema = z.enum(PLAYSTYLES, {
  errorMap: () => ({ message: 'Please select a playstyle' }),
})

export const voiceChatSchema = z.boolean()

export const playTimesSchema = z.array(z.enum(PLAY_TIMES)).optional()

export const photoUrlsSchema = z
  .array(z.string().url())
  .max(MAX_PHOTOS, `You can upload up to ${MAX_PHOTOS} photos`)
  .optional()

// Complete profile schema for creation
export const createProfileSchema = z.object({
  display_name: displayNameSchema,
  date_of_birth: dateOfBirthSchema,
  pronouns: pronounsSchema,
  region: regionSchema,
  bio: bioSchema,
  platforms: platformsSchema,
  favorite_genres: genresSchema,
  top_games: topGamesSchema,
  playstyle: playstyleSchema,
  voice_chat: voiceChatSchema,
  typical_play_times: playTimesSchema,
  photo_urls: photoUrlsSchema,
})

export type CreateProfileInput = z.infer<typeof createProfileSchema>

// Partial schema for updates
export const updateProfileSchema = createProfileSchema.partial()

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// Onboarding step schemas
export const basicInfoStepSchema = z.object({
  display_name: displayNameSchema,
  date_of_birth: dateOfBirthSchema,
  pronouns: pronounsSchema,
  region: regionSchema,
})

export type BasicInfoStepInput = z.infer<typeof basicInfoStepSchema>

export const gamingInfoStepSchema = z.object({
  platforms: platformsSchema,
  favorite_genres: genresSchema,
  top_games: topGamesSchema,
  playstyle: playstyleSchema,
  voice_chat: voiceChatSchema,
  typical_play_times: playTimesSchema,
})

export type GamingInfoStepInput = z.infer<typeof gamingInfoStepSchema>

export const bioPhotosStepSchema = z.object({
  bio: bioSchema,
  photo_urls: photoUrlsSchema,
})

export type BioPhotosStepInput = z.infer<typeof bioPhotosStepSchema>
