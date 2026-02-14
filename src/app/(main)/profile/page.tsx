import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { differenceInYears } from 'date-fns'
import {
  MapPin,
  Gamepad2,
  Mic,
  MicOff,
  Clock,
  Settings,
  Pencil,
  Camera,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { Profile } from '@/types/database'
import { ProfilePhotoGallery } from '@/components/profile/ProfilePhotoGallery'

export const metadata = {
  title: 'Profile',
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  const typedProfile = profile as unknown as Profile
  const age = differenceInYears(new Date(), new Date(typedProfile.date_of_birth))

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/edit">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Photo Gallery */}
        <ProfilePhotoGallery 
          photos={typedProfile.photo_urls || []} 
          displayName={typedProfile.display_name}
        />

        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center sm:flex sm:items-start sm:gap-4 sm:text-left">
              <div className="flex-1">
                <h2 className="text-xl font-bold">{typedProfile.display_name}</h2>
                <p className="text-muted-foreground">
                  {age} years old
                  {typedProfile.pronouns && ` • ${typedProfile.pronouns}`}
                </p>
                {typedProfile.region && (
                  <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground sm:justify-start">
                    <MapPin className="h-3 w-3" />
                    {typedProfile.region}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        {typedProfile.bio && (
          <Card>
            <CardHeader className="pb-2">
              <h3 className="font-semibold">About</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{typedProfile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Gaming Setup */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold">Gaming Setup</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {typedProfile.platforms.map((platform) => (
                  <Badge key={platform} variant="secondary">
                    <Gamepad2 className="mr-1 h-3 w-3" />
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Favorite Genres</p>
              <div className="flex flex-wrap gap-2">
                {typedProfile.favorite_genres.map((genre) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Top Games</p>
              <ul className="space-y-1">
                {typedProfile.top_games.map((game, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {i + 1}
                    </span>
                    {game}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Playstyle */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold">Playstyle</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="font-medium capitalize">{typedProfile.playstyle}</span> player
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {typedProfile.voice_chat ? (
                <>
                  <Mic className="h-4 w-4" /> Uses voice chat
                </>
              ) : (
                <>
                  <MicOff className="h-4 w-4" /> Prefers no voice chat
                </>
              )}
            </p>
            {typedProfile.typical_play_times.length > 0 && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Usually plays: {typedProfile.typical_play_times.join(', ')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
