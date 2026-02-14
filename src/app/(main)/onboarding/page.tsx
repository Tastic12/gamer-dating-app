import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export const metadata = {
  title: 'Complete Your Profile',
}

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user already completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if ((profile as { onboarding_completed: boolean } | null)?.onboarding_completed) {
    redirect('/discover')
  }

  // Get date of birth from user metadata (set during signup)
  const dateOfBirth = user.user_metadata?.date_of_birth || null

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <OnboardingWizard userId={user.id} initialDateOfBirth={dateOfBirth} />
    </div>
  )
}
