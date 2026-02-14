'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Profile } from '@/types/database'

export type AdminStats = {
  total_users: number
  active_users: number
  banned_users: number
  pending_reports: number
  total_matches: number
  total_messages: number
}

export type Report = {
  id: string
  reporter_id: string
  reported_id: string
  category: string
  description: string | null
  status: string
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  reporter: Profile
  reported: Profile
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    // @ts-expect-error - RPC function types not generated
    const { data } = await supabase.rpc('is_admin', { p_user_id: userId })
    return !!data
  } catch {
    return false
  }
}

export async function getAdminStats(): Promise<{ stats: AdminStats | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_admin_stats' as never)

    if (error) {
      return { stats: null, error: error.message }
    }

    return { stats: data?.[0] || null, error: null }
  } catch (err) {
    console.error('Get admin stats error:', err)
    return { stats: null, error: 'Failed to load stats' }
  }
}

export async function getPendingReports(): Promise<{ reports: Report[]; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (reportsError) {
      return { reports: [], error: reportsError.message }
    }

    type ReportRow = {
      id: string
      reporter_id: string
      reported_id: string
      category: string
      description: string | null
      status: string
      admin_notes: string | null
      reviewed_by: string | null
      reviewed_at: string | null
      created_at: string
    }
    const reports = reportsData as unknown as ReportRow[] | null

    if (!reports || reports.length === 0) {
      return { reports: [], error: null }
    }

    // Get all user profiles involved
    const userIds = [...new Set([...reports.map((r) => r.reporter_id), ...reports.map((r) => r.reported_id)])]
    
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)

    const profiles = profilesData as unknown as Profile[] | null

    const enrichedReports: Report[] = reports.map((report) => ({
      ...report,
      reporter: profiles?.find((p) => p.id === report.reporter_id) as Profile,
      reported: profiles?.find((p) => p.id === report.reported_id) as Profile,
    }))

    return { reports: enrichedReports, error: null }
  } catch (err) {
    console.error('Get pending reports error:', err)
    return { reports: [], error: 'Failed to load reports' }
  }
}

export async function updateReportStatus(
  adminId: string,
  reportId: string,
  status: 'reviewed' | 'resolved' | 'dismissed',
  adminNotes?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('reports')
      .update({
        status,
        admin_notes: adminNotes || null,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      } as never)
      .eq('id', reportId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    return { success: true, error: null }
  } catch (err) {
    console.error('Update report status error:', err)
    return { success: false, error: 'Failed to update report' }
  }
}

export async function banUserAction(
  adminId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()

    // @ts-expect-error - RPC function types not generated
    const { error } = await supabase.rpc('ban_user', {
      p_admin_id: adminId,
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    return { success: true, error: null }
  } catch (err) {
    console.error('Ban user error:', err)
    return { success: false, error: 'Failed to ban user' }
  }
}

export async function unbanUserAction(
  adminId: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()

    // @ts-expect-error - RPC function types not generated
    const { error } = await supabase.rpc('unban_user', {
      p_admin_id: adminId,
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin')
    return { success: true, error: null }
  } catch (err) {
    console.error('Unban user error:', err)
    return { success: false, error: 'Failed to unban user' }
  }
}

export async function getRecentUsers(
  limit = 20
): Promise<{ users: Profile[]; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return { users: [], error: error.message }
    }

    return { users: (data || []) as unknown as Profile[], error: null }
  } catch (err) {
    console.error('Get recent users error:', err)
    return { users: [], error: 'Failed to load users' }
  }
}
