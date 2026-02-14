import Link from 'next/link'
import { Gamepad2, Heart, MessageCircle, Shield, Users } from 'lucide-react'
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Gamepad2 className="h-6 w-6 text-primary" />
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center md:py-32">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Find Your <span className="text-primary">Player Two</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {APP_DESCRIPTION}. Connect with gamers who share your passion, platforms, and playstyle.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="w-full rounded-lg border border-input bg-background px-8 py-3 text-lg font-medium hover:bg-accent sm:w-auto"
            >
              I have an account
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-y bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Why Gamers Love Us</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<Gamepad2 className="h-8 w-8" />}
                title="Gamer-First Matching"
                description="Match based on platforms, genres, favorite games, and playstyle"
              />
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Find Your Squad"
                description="Connect with casual or competitive players who match your vibe"
              />
              <FeatureCard
                icon={<MessageCircle className="h-8 w-8" />}
                title="Real-Time Chat"
                description="Message your matches instantly and plan your next gaming session"
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8" />}
                title="Safe & Secure"
                description="Verified profiles, easy blocking, and a dedicated moderation team"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <Heart className="mx-auto mb-6 h-12 w-12 text-primary" />
          <h2 className="mb-4 text-3xl font-bold">Ready to Find Your Match?</h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Join thousands of gamers who have found their perfect co-op partner, raid buddy, or
            player two.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create Your Profile
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gamepad2 className="h-4 w-4" />
              <span>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
            </div>
            <nav className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
