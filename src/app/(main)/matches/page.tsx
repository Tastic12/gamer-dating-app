import { redirect } from 'next/navigation'
import Link from 'next/link'
import { differenceInYears, formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getMatches } from '@/app/(main)/discover/actions'

export const metadata = {
  title: 'Matches',
}

export default async function MatchesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { matches, error } = await getMatches(user.id)

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Matches</h1>
        <Badge variant="secondary">{matches.length} match{matches.length !== 1 ? 'es' : ''}</Badge>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {matches.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">No matches yet</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Keep swiping to find your perfect gaming partner!
          </p>
          <Button asChild>
            <Link href="/discover">Start Discovering</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(({ match, profile }) => {
            const age = differenceInYears(new Date(), new Date(profile.date_of_birth))
            const matchedAgo = formatDistanceToNow(new Date(match.matched_at), { addSuffix: true })

            return (
              <Card key={match.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                      {profile.display_name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-semibold">{profile.display_name}</h3>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {matchedAgo}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {age} years old
                        {profile.pronouns && ` • ${profile.pronouns}`}
                      </p>
                      {profile.region && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {profile.region}
                        </p>
                      )}
                      
                      {/* Top Games Preview */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {profile.top_games.slice(0, 2).map((game, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {game}
                          </Badge>
                        ))}
                        {profile.top_games.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.top_games.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <Button size="sm" asChild className="shrink-0">
                      <Link href={`/chat/${match.id}`}>
                        <MessageCircle className="mr-1 h-4 w-4" />
                        Chat
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
