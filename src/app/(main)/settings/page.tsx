import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { getBlockedUsers } from './actions'
import { getDeletionStatus } from './gdpr-actions'

export const metadata = {
  title: 'Settings',
}

export default async function Settings() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ blockedUsers }, { status: deletionStatus }] = await Promise.all([
    getBlockedUsers(user.id),
    getDeletionStatus(user.id),
  ])

  return (
    <SettingsPage
      userId={user.id}
      userEmail={user.email || ''}
      blockedUsers={blockedUsers}
      deletionStatus={deletionStatus}
    />
  )
}
