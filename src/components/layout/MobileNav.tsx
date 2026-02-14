'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Heart, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { useProfile } from '@/hooks/useProfile'

const navItems = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/matches', label: 'Matches', icon: Heart },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
]

export function MobileNav() {
  const pathname = usePathname()
  const { profile } = useProfile()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        
        {/* Profile with avatar */}
        <Link
          href="/profile"
          className={cn(
            'flex flex-1 flex-col items-center gap-1 py-2 text-xs',
            pathname === '/profile' || pathname.startsWith('/profile/')
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          <Avatar
            src={profile?.photo_urls?.[0]}
            fallback={profile?.display_name}
            size="sm"
            className={cn(
              'ring-2',
              pathname === '/profile' || pathname.startsWith('/profile/')
                ? 'ring-primary'
                : 'ring-transparent'
            )}
          />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  )
}
