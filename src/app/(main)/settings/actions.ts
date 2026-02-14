'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Profile } from '@/types/database'

export type BlockedUser = {
  id: string
  blocked_id: string
  created_at: string
  blocked_user: Profile
}

export async function getBlockedUsers(
  userId: string
): Promise<{ blockedUsers: BlockedUser[]; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data: blocksData, error: blocksError } = await supabase
      .from('blocks')
      .select('id, blocked_id, created_at')
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false })

    if (blocksError) {
      return { blockedUsers: [], error: blocksError.message }
    }

    type BlockRow = { id: string; blocked_id: string; created_at: string }
    const blocks = blocksData as unknown as BlockRow[] | null

    if (!blocks || blocks.length === 0) {
      return { blockedUsers: [], error: null }
    }

    // Get blocked users' profiles
    const blockedIds = blocks.map((b) => b.blocked_id)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', blockedIds)

    if (profilesError) {
      return { blockedUsers: [], error: profilesError.message }
    }

    const profiles = profilesData as unknown as Profile[] | null

    const blockedUsers: BlockedUser[] = blocks.map((block) => ({
      ...block,
      blocked_user: profiles?.find((p) => p.id === block.blocked_id) as Profile,
    })).filter((b) => b.blocked_user)

    return { blockedUsers, error: null }
  } catch (err) {
    console.error('Get blocked users error:', err)
    return { blockedUsers: [], error: 'Failed to load blocked users' }
  }
}

export async function blockUser(
  blockerId: string,
  blockedId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()

    // Create block
    const { error } = await supabase
      .from('blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
      } as never)

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'User already blocked' }
      }
      return { success: false, error: error.message }
    }

    // Deactivate any existing match
    const user1 = blockerId < blockedId ? blockerId : blockedId
    const user2 = blockerId < blockedId ? blockedId : blockerId

    await supabase
      .from('matches')
      .update({ is_active: false, unmatched_at: new Date().toISOString() } as never)
      .eq('user1_id' as never, user1)
      .eq('user2_id' as never, user2)

    revalidatePath('/settings')
    revalidatePath('/chat')
    revalidatePath('/matches')
    revalidatePath('/discover')

    return { success: true, error: null }
  } catch (err) {
    console.error('Block user error:', err)
    return { success: false, error: 'Failed to block user' }
  }
}

export async function unblockUser(
  blockerId: string,
  blockedId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/settings')
    revalidatePath('/discover')

    return { success: true, error: null }
  } catch (err) {
    console.error('Unblock user error:', err)
    return { success: false, error: 'Failed to unblock user' }
  }
}

export async function reportUser(
  reporterId: string,
  reportedId: string,
  category: string,
  description?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()

    // Check rate limit
    // @ts-expect-error - RPC function types not generated
    const { data: rateLimited } = await supabase.rpc('check_report_rate_limit', {
      p_user_id: reporterId,
    })

    if (rateLimited) {
      return { success: false, error: 'You have reached the daily report limit. Please try again tomorrow.' }
    }

    // Create report
    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_id: reportedId,
        category,
        description: description?.trim() || null,
      } as never)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('Report user error:', err)
    return { success: false, error: 'Failed to submit report' }
  }
}

export async function deleteAccount(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()

    // Soft delete - set is_active to false
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      } as never)
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Deactivate all matches
    await supabase
      .from('matches')
      .update({ is_active: false, unmatched_at: new Date().toISOString() } as never)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

    return { success: true, error: null }
  } catch (err) {
    console.error('Delete account error:', err)
    return { success: false, error: 'Failed to delete account' }
  }
}
