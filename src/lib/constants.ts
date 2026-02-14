// Gaming platforms
export const PLATFORMS = [
  'PC',
  'PlayStation',
  'Xbox',
  'Nintendo Switch',
  'Mobile',
] as const

export type Platform = (typeof PLATFORMS)[number]

// Gaming genres
export const GENRES = [
  'FPS',
  'RPG',
  'MMORPG',
  'MOBA',
  'Battle Royale',
  'Strategy',
  'Sports',
  'Racing',
  'Puzzle',
  'Horror',
  'Simulation',
  'Fighting',
  'Adventure',
  'Indie',
  'Other',
] as const

export type Genre = (typeof GENRES)[number]

// Playstyle options
export const PLAYSTYLES = ['casual', 'competitive', 'both'] as const

export type Playstyle = (typeof PLAYSTYLES)[number]

// Play time options
export const PLAY_TIMES = ['Morning', 'Afternoon', 'Evening', 'Night', 'Weekends'] as const

export type PlayTime = (typeof PLAY_TIMES)[number]

// Pronoun options
export const PRONOUNS = [
  'he/him',
  'she/her',
  'they/them',
  'other',
  'prefer not to say',
] as const

export type Pronoun = (typeof PRONOUNS)[number]

// Geographic regions (coarse location)
export const REGIONS = [
  // North America
  'US - Northeast',
  'US - Southeast',
  'US - Midwest',
  'US - Southwest',
  'US - West',
  'Canada - East',
  'Canada - West',
  // Europe
  'UK',
  'EU - West',
  'EU - Central',
  'EU - East',
  'EU - North',
  'EU - South',
  // Asia Pacific
  'Asia - East',
  'Asia - Southeast',
  'Asia - South',
  'Oceania',
  // Other
  'Latin America',
  'Middle East',
  'Africa',
  'Other',
] as const

export type Region = (typeof REGIONS)[number]

// Report categories
export const REPORT_CATEGORIES = [
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'spam', label: 'Spam or scam' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'fake_profile', label: 'Fake or misleading profile' },
  { value: 'underage', label: 'Appears to be underage' },
  { value: 'other', label: 'Other' },
] as const

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]['value']

// Age limits
export const MIN_AGE = 18
export const MAX_AGE = 100

// Profile limits
export const MAX_PHOTOS = 6
export const MAX_TOP_GAMES = 3
export const MAX_GENRES = 5
export const MAX_BIO_LENGTH = 500
export const MAX_DISPLAY_NAME_LENGTH = 30
export const MIN_DISPLAY_NAME_LENGTH = 2

// Rate limits
export const MAX_MESSAGES_PER_MINUTE = 10
export const MAX_SWIPES_PER_HOUR = 100
export const MAX_REPORTS_PER_DAY = 10

// Discovery
export const DISCOVERY_PAGE_SIZE = 20

// App info
export const APP_NAME = 'GamerMatch'
export const APP_DESCRIPTION = 'Find your player two'
