import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DiscoveryFeed } from '@/components/discovery/DiscoveryFeed'

export const metadata = {
  title: 'Discover',
}

export default async function DiscoverPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!(profile as { onboarding_completed: boolean } | null)?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-6">
      <DiscoveryFeed userId={user.id} />
    </div>
  )
}
