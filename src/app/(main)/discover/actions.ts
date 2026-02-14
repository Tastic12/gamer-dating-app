'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Profile } from '@/types/database'

export type DiscoveryProfile = Profile & {
  compatibility_score: number
}

export type DiscoveryFilters = {
  platforms?: string[]
  genres?: string[]
  playstyle?: string
  voiceChat?: boolean
  regions?: string[]
}

export async function getDiscoveryProfiles(
  userId: string,
  filters?: DiscoveryFilters,
  limit = 20,
  offset = 0
): Promise<{ profiles: DiscoveryProfile[]; error: string | null }> {
  try {
    const supabase = await createClient()

    // Try to call the discovery function
    // @ts-expect-error - RPC function types not generated
    const { data, error } = await supabase.rpc('get_discovery_profiles', {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset,
      p_platforms: filters?.platforms || null,
      p_genres: filters?.genres || null,
      p_playstyle: filters?.playstyle || null,
      p_voice_chat: filters?.voiceChat ?? null,
      p_regions: filters?.regions || null,
    })

    if (error) {
      console.error('Discovery error:', error)
      // Fallback to simple query if function doesn't exist yet
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .eq('is_active', true)
        .eq('is_banned', false)
        .eq('onboarding_completed', true)
        .limit(limit)

      if (fallbackError) {
        return { profiles: [], error: fallbackError.message }
      }

      return {
        profiles: (fallbackData || []).map((p) => ({
          ...(p as Profile),
          compatibility_score: 0,
        })) as DiscoveryProfile[],
        error: null,
      }
    }

    return { profiles: (data || []) as DiscoveryProfile[], error: null }
  } catch (err) {
    console.error('Discovery error:', err)
    return { profiles: [], error: 'Failed to load profiles' }
  }
}

export async function createSwipe(
  swiperId: string,
  swipedId: string,
  action: 'like' | 'pass'
): Promise<{ success: boolean; isMatch: boolean; error: string | null }> {
  try {
    const supabase = await createClient()

    // Create the swipe
    // @ts-expect-error - table types not synced
    const { error: swipeError } = await supabase.from('swipes').insert({
      swiper_id: swiperId,
      swiped_id: swipedId,
      action,
    })

    if (swipeError) {
      // Handle duplicate swipe
      if (swipeError.code === '23505') {
        return { success: false, isMatch: false, error: 'Already swiped on this user' }
      }
      return { success: false, isMatch: false, error: swipeError.message }
    }

    // If it was a like, check if there's now a match
    let isMatch = false
    if (action === 'like') {
      // Check if match was created by the trigger
      const user1 = swiperId < swipedId ? swiperId : swipedId
      const user2 = swiperId < swipedId ? swipedId : swiperId

      const { data: match } = await supabase
        .from('matches')
        .select('id')
        .eq('user1_id' as never, user1)
        .eq('user2_id' as never, user2)
        .eq('is_active' as never, true)
        .single()

      isMatch = !!match
    }

    revalidatePath('/discover')
    revalidatePath('/matches')

    return { success: true, isMatch, error: null }
  } catch (err) {
    console.error('Swipe error:', err)
    return { success: false, isMatch: false, error: 'Failed to record swipe' }
  }
}

type MatchRow = {
  id: string
  matched_at: string
  user1_id: string
  user2_id: string
}

export async function getMatches(
  userId: string
): Promise<{ matches: Array<{ match: { id: string; matched_at: string }; profile: Profile }>; error: string | null }> {
  try {
    const supabase = await createClient()

    // Get all active matches for this user
    const { data: matchesData, error: matchError } = await supabase
      .from('matches')
      .select('id, matched_at, user1_id, user2_id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('is_active' as never, true)
      .order('matched_at', { ascending: false })

    if (matchError) {
      return { matches: [], error: matchError.message }
    }

    const matches = matchesData as unknown as MatchRow[] | null

    if (!matches || matches.length === 0) {
      return { matches: [], error: null }
    }

    // Get the other user's profile for each match
    const otherUserIds = matches.map((m) =>
      m.user1_id === userId ? m.user2_id : m.user1_id
    )

    const { data: profilesData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', otherUserIds)

    if (profileError) {
      return { matches: [], error: profileError.message }
    }

    const profiles = profilesData as unknown as Profile[] | null

    // Combine matches with profiles
    const result = matches.map((match) => {
      const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id
      const profile = profiles?.find((p) => p.id === otherUserId)
      return {
        match: { id: match.id, matched_at: match.matched_at },
        profile: profile as Profile,
      }
    }).filter((m) => m.profile)

    return { matches: result, error: null }
  } catch (err) {
    console.error('Get matches error:', err)
    return { matches: [], error: 'Failed to load matches' }
  }
}
