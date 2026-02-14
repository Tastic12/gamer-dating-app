/**
 * Seed Script: Generate fake gamer profiles for testing
 * 
 * Run with: npx tsx scripts/seed-profiles.ts
 * 
 * Prerequisites:
 * - SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 * - This script uses the service role key to bypass RLS and create auth users
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Admin client for creating auth users
const supabaseAdmin = supabase.auth.admin

// ============================================
// Fake Data Arrays
// ============================================

const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile']
const GENRES = ['FPS', 'RPG', 'MMORPG', 'MOBA', 'Battle Royale', 'Strategy', 'Sports', 'Racing', 'Puzzle', 'Horror', 'Simulation', 'Fighting', 'Adventure', 'Indie']
const PLAYSTYLES = ['casual', 'competitive', 'both']
const PLAY_TIMES = ['Morning', 'Afternoon', 'Evening', 'Night', 'Weekends']
const PRONOUNS = ['he/him', 'she/her', 'they/them', 'prefer not to say']
const REGIONS = [
  'US - Northeast', 'US - Southeast', 'US - Midwest', 'US - Southwest', 'US - West',
  'Canada - East', 'Canada - West', 'UK', 'EU - West', 'EU - Central', 'EU - East',
  'EU - North', 'EU - South', 'Asia - East', 'Asia - Southeast', 'Oceania', 'Latin America'
]

// Gamer-themed display names
const DISPLAY_NAMES = [
  'ShadowWolf', 'PixelPirate', 'NeonNinja', 'CyberSamurai', 'GhostReaper',
  'DragonSlayer', 'StormChaser', 'NoobMaster', 'EliteSniper', 'MysticMage',
  'PhoenixRising', 'VenomStrike', 'IronFist', 'SilentAssassin', 'ThunderBolt',
  'CrimsonBlade', 'FrostByte', 'DarkKnight', 'StarGazer', 'WildCard',
  'ArcticFox', 'BlazeFury', 'CosmicRay', 'DeathWish', 'EchoHunter',
  'FlameWarden', 'GlitchMaster', 'HexCaster', 'IceQueen', 'JadePhoenix',
  'KryptonKid', 'LunarWolf', 'MidnightOwl', 'NovaStar', 'OmegaForce',
  'PrismLight', 'QuantumLeap', 'RogueAgent', 'SolarFlare', 'TitanShield',
  'UltraViolet', 'VortexWind', 'WarHammer', 'XenonBlade', 'ZeroGravity',
  'AlphaStrike', 'BetaWave', 'ChaosMaker', 'DeltaForce', 'EpsilonCore'
]

// Popular games for variety
const GAMES = [
  // FPS
  'Valorant', 'Counter-Strike 2', 'Call of Duty: Warzone', 'Overwatch 2', 'Apex Legends',
  'Rainbow Six Siege', 'Halo Infinite', 'Destiny 2', 'Team Fortress 2', 'PUBG',
  // RPG/MMORPG
  'Final Fantasy XIV', 'World of Warcraft', 'Genshin Impact', 'Elden Ring', 'Baldur\'s Gate 3',
  'The Witcher 3', 'Diablo IV', 'Path of Exile', 'Lost Ark', 'Guild Wars 2',
  // MOBA
  'League of Legends', 'Dota 2', 'Smite', 'Heroes of the Storm', 'Pokemon Unite',
  // Battle Royale
  'Fortnite', 'Fall Guys', 'Escape from Tarkov',
  // Strategy
  'Civilization VI', 'Age of Empires IV', 'Starcraft II', 'Total War: Warhammer 3',
  // Sports/Racing
  'FIFA 24', 'Rocket League', 'Forza Horizon 5', 'Gran Turismo 7', 'NBA 2K24',
  // Horror
  'Dead by Daylight', 'Phasmophobia', 'Resident Evil 4', 'Lethal Company',
  // Simulation
  'Stardew Valley', 'The Sims 4', 'Cities: Skylines', 'Animal Crossing',
  // Fighting
  'Street Fighter 6', 'Mortal Kombat 1', 'Tekken 8', 'Super Smash Bros. Ultimate',
  // Adventure/Indie
  'Minecraft', 'Terraria', 'Hollow Knight', 'Celeste', 'Hades', 'Cult of the Lamb',
  // Coop/Party
  'It Takes Two', 'Overcooked 2', 'Among Us', 'Sea of Thieves', 'Monster Hunter: World'
]

// Bio templates with placeholders
const BIO_TEMPLATES = [
  "Hey there! I'm a {playstyle} gamer who loves {genre} games. Looking for someone to {activity}. {funFact}",
  "Gaming is my passion! Mainly into {genre} but open to trying new things. {activity}. Hit me up if you want to play!",
  "{funFact} When I'm not working, you'll find me grinding {game}. Looking for a {playstyle} player to team up with!",
  "Chill vibes only. Love playing {genre} games late at night. {funFact} Let's game together!",
  "Competitive {genre} player here. {funFact} Looking for teammates who want to climb the ranks!",
  "Just here to have fun and meet fellow gamers. {activity}. {funFact}",
  "Been gaming since I could hold a controller. {funFact} Currently addicted to {game}. Always down for co-op!",
  "{funFact} I play mostly {genre} games but enjoy variety. Looking for gaming buddies who don't take things too seriously.",
  "Night owl gamer here. {activity}. {funFact} Let's squad up!",
  "Casual player who enjoys the social side of gaming. {funFact} Always looking for new friends to play with!",
]

const FUN_FACTS = [
  "I once played for 24 hours straight during a game launch.",
  "My gaming setup cost more than my car.",
  "I've been gaming for over 15 years.",
  "I'm a completionist - gotta get all those achievements!",
  "Coffee and gaming are my two favorite things.",
  "I stream sometimes but mostly just play for fun.",
  "My cat is my co-pilot during gaming sessions.",
  "I have way too many unfinished games in my library.",
  "I'm the friend who reads all the game lore.",
  "I make the best gaming snacks.",
  "My reflexes might be slow but my memes are fast.",
  "I'm better at games than I am at small talk.",
  "I name all my game characters after food.",
  "My headset is practically attached to my head.",
  "I've met some of my best friends through gaming.",
]

const ACTIVITIES = [
  "duo queue with",
  "raid with",
  "chill and play games with",
  "grind ranked with",
  "explore new games with",
  "do co-op campaigns with",
  "practice and improve with",
  "have late night gaming sessions with",
  "share memes and game clips with",
  "build epic bases with",
]

// ============================================
// Helper Functions
// ============================================

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomItems<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function randomDateOfBirth(): string {
  // Generate age between 18 and 45
  const age = Math.floor(Math.random() * 28) + 18
  const year = new Date().getFullYear() - age
  const month = Math.floor(Math.random() * 12) + 1
  const day = Math.floor(Math.random() * 28) + 1
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

function generateBio(playstyle: string, genres: string[], games: string[]): string {
  const template = randomItem(BIO_TEMPLATES)
  const game = games[0] || randomItem(GAMES)
  const genre = genres[0] || 'various'
  
  return template
    .replace('{playstyle}', playstyle)
    .replace('{genre}', genre)
    .replace('{game}', game)
    .replace('{activity}', randomItem(ACTIVITIES))
    .replace('{funFact}', randomItem(FUN_FACTS))
}

// Avatar styles for variety (DiceBear API)
const AVATAR_STYLES = [
  'adventurer',
  'adventurer-neutral', 
  'avataaars',
  'big-ears',
  'big-smile',
  'bottts',
  'croodles',
  'fun-emoji',
  'lorelei',
  'micah',
  'miniavs',
  'notionists',
  'open-peeps',
  'personas',
  'pixel-art',
]

// Background colors for avatars (gaming-themed)
const AVATAR_BACKGROUNDS = [
  'b6e3f4', // light blue
  'c0aede', // light purple  
  'd1d4f9', // lavender
  'ffd5dc', // light pink
  'ffdfbf', // light orange
  'a3e635', // lime
  '38bdf8', // sky blue
  'fb7185', // rose
  'a78bfa', // violet
  '34d399', // emerald
]

function generateAvatarUrls(displayName: string, index: number): string[] {
  // Generate 1-3 avatar URLs per profile for variety
  const numAvatars = Math.floor(Math.random() * 3) + 1
  const avatars: string[] = []
  
  for (let i = 0; i < numAvatars; i++) {
    const style = AVATAR_STYLES[(index + i) % AVATAR_STYLES.length]
    const bgColor = randomItem(AVATAR_BACKGROUNDS)
    const seed = `${displayName}-${i}-${Date.now()}`
    
    // DiceBear API - generates unique avatars based on seed
    const url = `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(seed)}&backgroundColor=${bgColor}&size=400`
    avatars.push(url)
  }
  
  return avatars
}

// ============================================
// Profile Generation
// ============================================

interface FakeProfile {
  id: string
  display_name: string
  date_of_birth: string
  pronouns: string
  region: string
  bio: string
  platforms: string[]
  favorite_genres: string[]
  top_games: string[]
  playstyle: string
  voice_chat: boolean
  typical_play_times: string[]
  photo_urls: string[]
  is_active: boolean
  is_banned: boolean
  email_verified: boolean
  onboarding_completed: boolean
}

function generateProfileData(index: number, userId: string): FakeProfile {
  const displayName = DISPLAY_NAMES[index] || `Gamer${index + 1}`
  const platforms = randomItems(PLATFORMS, 1, 3)
  const genres = randomItems(GENRES, 2, 5)
  const games = randomItems(GAMES, 1, 3)
  const playstyle = randomItem(PLAYSTYLES)
  const playTimes = randomItems(PLAY_TIMES, 1, 4)
  
  return {
    id: userId,
    display_name: displayName,
    date_of_birth: randomDateOfBirth(),
    pronouns: randomItem(PRONOUNS),
    region: randomItem(REGIONS),
    bio: generateBio(playstyle, genres, games),
    platforms,
    favorite_genres: genres,
    top_games: games,
    playstyle,
    voice_chat: Math.random() > 0.3, // 70% use voice chat
    typical_play_times: playTimes,
    photo_urls: generateAvatarUrls(displayName, index), // Generated avatar images
    is_active: true,
    is_banned: false,
    email_verified: true,
    onboarding_completed: true,
  }
}

// ============================================
// Main Seed Function
// ============================================

async function seedProfiles(count: number = 30) {
  console.log(`\n🎮 GamerMatch Profile Seeder`)
  console.log(`================================`)
  console.log(`Creating ${count} fake profiles...\n`)

  const createdProfiles: FakeProfile[] = []
  let inserted = 0
  let failed = 0

  for (let i = 0; i < count; i++) {
    const displayName = DISPLAY_NAMES[i] || `Gamer${i + 1}`
    const email = `seed.${displayName.toLowerCase()}@test.gamermatch.local`
    
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabaseAdmin.createUser({
        email,
        password: 'TestPassword123!',
        email_confirm: true,
        user_metadata: {
          is_seed_user: true,
          display_name: displayName,
        }
      })

      if (authError) {
        // User might already exist
        if (authError.message.includes('already been registered')) {
          console.log(`⏭️  Skipping ${displayName} (already exists)`)
          continue
        }
        throw authError
      }

      if (!authData.user) {
        throw new Error('No user returned from auth')
      }

      // Create profile for this auth user
      const profile = generateProfileData(i, authData.user.id)
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profile)

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabaseAdmin.deleteUser(authData.user.id)
        throw profileError
      }

      createdProfiles.push(profile)
      inserted++
      console.log(`✅ Created: ${displayName} (${profile.region})`)
      
    } catch (err) {
      failed++
      console.error(`❌ Failed to create ${displayName}:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`\n================================`)
  console.log(`📊 Results:`)
  console.log(`   ✅ Inserted: ${inserted}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`================================\n`)

  // Show some sample profiles
  if (createdProfiles.length > 0) {
    console.log(`📋 Sample profiles created:`)
    createdProfiles.slice(0, 5).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.display_name} (${p.region}) - ${p.playstyle} player`)
      console.log(`      Platforms: ${p.platforms.join(', ')}`)
      console.log(`      Games: ${p.top_games.join(', ')}`)
      console.log('')
    })
  }
}

async function clearSeedProfiles() {
  console.log(`\n🗑️  Clearing seed profiles...`)
  
  // Get all seed users (those with @test.gamermatch.local emails)
  const { data: users, error: listError } = await supabaseAdmin.listUsers()
  
  if (listError) {
    console.error('❌ Error listing users:', listError.message)
    return
  }

  const seedUsers = users.users.filter(u => 
    u.email?.endsWith('@test.gamermatch.local') || 
    u.user_metadata?.is_seed_user === true
  )

  console.log(`Found ${seedUsers.length} seed users to delete`)

  let deleted = 0
  let failed = 0

  for (const user of seedUsers) {
    try {
      // Delete auth user (profile will cascade delete)
      const { error } = await supabaseAdmin.deleteUser(user.id)
      if (error) throw error
      deleted++
      console.log(`✅ Deleted: ${user.email}`)
    } catch (err) {
      failed++
      console.error(`❌ Failed to delete ${user.email}:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`\n================================`)
  console.log(`📊 Results:`)
  console.log(`   ✅ Deleted: ${deleted}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`================================\n`)
}

// ============================================
// CLI
// ============================================

const args = process.argv.slice(2)
const command = args[0] || 'seed'
const count = parseInt(args[1]) || 30

if (command === 'seed') {
  seedProfiles(count)
} else if (command === 'clear') {
  clearSeedProfiles()
} else {
  console.log(`
Usage:
  npx tsx scripts/seed-profiles.ts seed [count]   - Create fake profiles (default: 30)
  npx tsx scripts/seed-profiles.ts clear          - Remove seed profiles
  `)
}
