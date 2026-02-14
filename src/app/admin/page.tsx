import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { checkIsAdmin, getAdminStats, getPendingReports, getRecentUsers } from './actions'

export const metadata = {
  title: 'Admin Dashboard',
}

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const isAdmin = await checkIsAdmin(user.id)

  if (!isAdmin) {
    redirect('/discover')
  }

  // Get admin data
  const [
    { stats },
    { reports },
    { users: recentUsers },
  ] = await Promise.all([
    getAdminStats(),
    getPendingReports(),
    getRecentUsers(),
  ])

  return (
    <AdminDashboard
      adminId={user.id}
      stats={stats}
      pendingReports={reports}
      recentUsers={recentUsers}
    />
  )
}
