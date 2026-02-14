'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Profile } from '@/types/database'

export type Message = {
  id: string
  match_id: string
  sender_id: string
  content: string
  created_at: string
  read_at: string | null
  is_deleted: boolean
  is_own_message?: boolean
}

export type ChatPreview = {
  match_id: string
  matched_at: string
  other_user: Profile
  last_message: Message | null
  unread_count: number
}

export async function getChatList(
  userId: string
): Promise<{ chats: ChatPreview[]; error: string | null }> {
  try {
    const supabase = await createClient()

    // Get all active matches
    const { data: matchesData, error: matchError } = await supabase
      .from('matches')
      .select('id, matched_at, user1_id, user2_id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('is_active' as never, true)
      .order('matched_at', { ascending: false })

    if (matchError) {
      return { chats: [], error: matchError.message }
    }

    type MatchRow = {
      id: string
      matched_at: string
      user1_id: string
      user2_id: string
    }
    const matches = matchesData as unknown as MatchRow[] | null

    if (!matches || matches.length === 0) {
      return { chats: [], error: null }
    }

    // Get other users' profiles
    const otherUserIds = matches.map((m) =>
      m.user1_id === userId ? m.user2_id : m.user1_id
    )

    const { data: profilesData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', otherUserIds)

    if (profileError) {
      return { chats: [], error: profileError.message }
    }

    const profiles = profilesData as unknown as Profile[] | null

    // Get last message for each match
    const matchIds = matches.map((m) => m.id)
    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .in('match_id', matchIds)
      .order('created_at', { ascending: false })

    const messages = messagesData as unknown as Message[] | null

    // Get unread counts
    // @ts-expect-error - RPC function types not generated
    const { data: unreadData } = await supabase.rpc('get_unread_counts', {
      p_user_id: userId,
    })

    type UnreadRow = { match_id: string; unread_count: number }
    const unreadCounts = (unreadData || []) as UnreadRow[]

    // Build chat list with last message
    const chats: ChatPreview[] = matches.map((match) => {
      const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id
      const otherUser = profiles?.find((p) => p.id === otherUserId)

      // Find last message for this match
      const matchMessages = messages?.filter((m) => m.match_id === match.id) || []
      const lastMessage = matchMessages[0] || null

      // Get unread count
      const unreadEntry = unreadCounts.find((u) => u.match_id === match.id)
      const unreadCount = unreadEntry?.unread_count || 0

      return {
        match_id: match.id,
        matched_at: match.matched_at,
        other_user: otherUser as Profile,
        last_message: lastMessage,
        unread_count: unreadCount,
      }
    }).filter((c) => c.other_user)

    // Sort by last message time or match time
    chats.sort((a, b) => {
      const aTime = a.last_message?.created_at || a.matched_at
      const bTime = b.last_message?.created_at || b.matched_at
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

    return { chats, error: null }
  } catch (err) {
    console.error('Get chat list error:', err)
    return { chats: [], error: 'Failed to load chats' }
  }
}

export async function getMessages(
  matchId: string,
  userId: string,
  limit = 50,
  before?: string
): Promise<{ messages: Message[]; error: string | null }> {
  try {
    const supabase = await createClient()

    // @ts-expect-error - RPC function types not generated
    const { data, error } = await supabase.rpc('get_chat_messages', {
      p_match_id: matchId,
      p_user_id: userId,
      p_limit: limit,
      p_before: before || null,
    })

    if (error) {
      // Fallback to direct query
      const query = supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (before) {
        query.lt('created_at', before)
      }

      const { data: fallbackData, error: fallbackError } = await query

      if (fallbackError) {
        return { messages: [], error: fallbackError.message }
      }

      const messages = (fallbackData || []).map((m) => ({
        ...(m as Message),
        is_own_message: (m as Message).sender_id === userId,
      }))

      return { messages, error: null }
    }

    return { messages: (data || []) as Message[], error: null }
  } catch (err) {
    console.error('Get messages error:', err)
    return { messages: [], error: 'Failed to load messages' }
  }
}

export async function sendMessage(
  matchId: string,
  senderId: string,
  content: string
): Promise<{ message: Message | null; error: string | null }> {
  try {
    // Validate content
    const trimmedContent = content.trim()
    if (!trimmedContent || trimmedContent.length > 2000) {
      return { message: null, error: 'Message must be 1-2000 characters' }
    }

    const supabase = await createClient()

    // Check rate limit
    // @ts-expect-error - RPC function types not generated
    const { data: rateLimited } = await supabase.rpc('check_message_rate_limit', {
      p_user_id: senderId,
    })

    if (rateLimited) {
      return { message: null, error: 'Slow down! You\'re sending messages too quickly.' }
    }

    // Insert message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        content: trimmedContent,
      } as never)
      .select()
      .single()

    if (error) {
      return { message: null, error: error.message }
    }

    revalidatePath('/chat')

    return { message: data as Message, error: null }
  } catch (err) {
    console.error('Send message error:', err)
    return { message: null, error: 'Failed to send message' }
  }
}

export async function markMessagesAsRead(
  matchId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()

    // @ts-expect-error - RPC function types not generated
    const { error } = await supabase.rpc('mark_messages_read', {
      p_match_id: matchId,
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/chat')
    return { success: true, error: null }
  } catch (err) {
    console.error('Mark read error:', err)
    return { success: false, error: 'Failed to mark messages as read' }
  }
}

export async function getMatchDetails(
  matchId: string,
  userId: string
): Promise<{ otherUser: Profile | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // Get match to find other user
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', matchId)
      .eq('is_active' as never, true)
      .single()

    if (matchError || !matchData) {
      return { otherUser: null, error: 'Match not found' }
    }

    type MatchRow = { user1_id: string; user2_id: string }
    const match = matchData as unknown as MatchRow

    // Verify user is part of match
    if (match.user1_id !== userId && match.user2_id !== userId) {
      return { otherUser: null, error: 'Access denied' }
    }

    const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id

    // Get other user's profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', otherUserId)
      .single()

    if (profileError) {
      return { otherUser: null, error: profileError.message }
    }

    return { otherUser: profileData as unknown as Profile, error: null }
  } catch (err) {
    console.error('Get match details error:', err)
    return { otherUser: null, error: 'Failed to load match details' }
  }
}
