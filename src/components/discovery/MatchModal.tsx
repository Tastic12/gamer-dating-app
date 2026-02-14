'use client'

import Link from 'next/link'
import { Heart, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { DiscoveryProfile } from '@/app/(main)/discover/actions'

interface MatchModalProps {
  profile: DiscoveryProfile | null
  onClose: () => void
}

export function MatchModal({ profile, onClose }: MatchModalProps) {
  if (!profile) return null

  return (
    <Dialog open={!!profile} onOpenChange={onClose}>
      <DialogContent className="text-center sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl">It&apos;s a Match!</DialogTitle>
          <DialogDescription>
            You and {profile.display_name} liked each other
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 flex items-center justify-center gap-4">
          {/* Current user avatar placeholder */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            You
          </div>
          
          <Heart className="h-8 w-8 fill-pink-500 text-pink-500" />
          
          {/* Matched user avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/chat">
              <MessageCircle className="mr-2 h-4 w-4" />
              Send a Message
            </Link>
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Keep Swiping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
