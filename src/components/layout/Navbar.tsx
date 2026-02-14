'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Gamepad2, LogOut, Settings, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { useProfile } from '@/hooks/useProfile'

const navLinks = [
  { href: '/discover', label: 'Discover' },
  { href: '/matches', label: 'Matches' },
  { href: '/chat', label: 'Chat' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { profile } = useProfile()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/discover" className="flex items-center gap-2 text-xl font-bold">
            <Gamepad2 className="h-6 w-6 text-primary" />
            {APP_NAME}
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-center rounded-full ring-2 ring-transparent transition-all hover:ring-primary/50"
          >
            <Avatar
              src={profile?.photo_urls?.[0]}
              fallback={profile?.display_name}
              size="md"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-card py-1 shadow-lg">
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <hr className="my-1" />
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
