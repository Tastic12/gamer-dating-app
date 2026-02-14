'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type DeletionStatus = {
  has_pending_request: boolean
  requested_at?: string
  scheduled_deletion_at?: string
  days_remaining?: number
}

export type UserDataExport = {
  export_date: string
  user_id: string
  profile: Record<string, unknown>
  swipes: Array<Record<string, unknown>>
  matches: Array<Record<string, unknown>>
  messages_sent: Array<Record<string, unknown>>
  blocks: Array<Record<string, unknown>>
  reports_made: Array<Record<string, unknown>>
}

export async function exportUserData(
  userId: string
): Promise<{ data: UserDataExport | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // @ts-expect-error - RPC function types not generated
    const { data, error } = await supabase.rpc('export_user_data', {
      p_user_id: userId,
    })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as UserDataExport, error: null }
  } catch (err) {
    console.error('Export user data error:', err)
    return { data: null, error: 'Failed to export data' }
  }
}

export async function requestAccountDeletion(
  userId: string
): Promise<{ success: boolean; scheduledDate: string | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // @ts-expect-error - RPC function types not generated
    const { data, error } = await supabase.rpc('request_account_deletion', {
      p_user_id: userId,
    })

    if (error) {
      return { success: false, scheduledDate: null, error: error.message }
    }

    revalidatePath('/settings')

    return {
      success: true,
      scheduledDate: (data as { scheduled_deletion_at: string }).scheduled_deletion_at,
      error: null,
    }
  } catch (err) {
    console.error('Request deletion error:', err)
    return { success: false, scheduledDate: null, error: 'Failed to request deletion' }
  }
}

export async function cancelAccountDeletion(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()

    // @ts-expect-error - RPC function types not generated
    const { data, error } = await supabase.rpc('cancel_account_deletion', {
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/settings')

    return { success: !!data, error: null }
  } catch (err) {
    console.error('Cancel deletion error:', err)
    return { success: false, error: 'Failed to cancel deletion' }
  }
}

export async function getDeletionStatus(
  userId: string
): Promise<{ status: DeletionStatus | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // @ts-expect-error - RPC function types not generated
    const { data, error } = await supabase.rpc('get_deletion_status', {
      p_user_id: userId,
    })

    if (error) {
      return { status: null, error: error.message }
    }

    return { status: data as DeletionStatus, error: null }
  } catch (err) {
    console.error('Get deletion status error:', err)
    return { status: null, error: 'Failed to get status' }
  }
}
