'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { ChatPreview } from '@/app/(main)/chat/actions'

interface ChatListProps {
  initialChats: ChatPreview[]
  error: string | null
  userId: string
}

export function ChatList({ initialChats, error, userId }: ChatListProps) {
  const [chats, setChats] = useState(initialChats)

  // Subscribe to new messages for real-time updates
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('chat-list-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          // Update chat list when new message arrives
          const newMessage = payload.new as {
            id: string
            match_id: string
            sender_id: string
            content: string
            created_at: string
            read_at: string | null
            is_deleted: boolean
          }

          setChats((prevChats) => {
            const chatIndex = prevChats.findIndex((c) => c.match_id === newMessage.match_id)
            if (chatIndex === -1) return prevChats

            const updatedChats = [...prevChats]
            const chat = updatedChats[chatIndex]

            updatedChats[chatIndex] = {
              ...chat,
              last_message: newMessage,
              unread_count:
                newMessage.sender_id !== userId
                  ? chat.unread_count + 1
                  : chat.unread_count,
            }

            // Sort by latest message
            updatedChats.sort((a, b) => {
              const aTime = a.last_message?.created_at || a.matched_at
              const bTime = b.last_message?.created_at || b.matched_at
              return new Date(bTime).getTime() - new Date(aTime).getTime()
            })

            return updatedChats
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border bg-card p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">No conversations yet</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Match with someone to start chatting!
        </p>
        <Button asChild>
          <Link href="/discover">
            <Heart className="mr-2 h-4 w-4" />
            Find Matches
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {chats.map((chat) => (
        <Link key={chat.match_id} href={`/chat/${chat.match_id}`}>
          <Card className="cursor-pointer transition-all hover:bg-accent/50 hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {chat.other_user.display_name.charAt(0).toUpperCase()}
                  </div>
                  {chat.unread_count > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px]"
                    >
                      {chat.unread_count > 9 ? '9+' : chat.unread_count}
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`truncate font-semibold ${chat.unread_count > 0 ? 'text-foreground' : ''}`}>
                      {chat.other_user.display_name}
                    </h3>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {chat.last_message
                        ? formatDistanceToNow(new Date(chat.last_message.created_at), { addSuffix: true })
                        : formatDistanceToNow(new Date(chat.matched_at), { addSuffix: true })}
                    </span>
                  </div>

                  {chat.last_message ? (
                    <p
                      className={`truncate text-sm ${
                        chat.unread_count > 0
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {chat.last_message.sender_id === userId && (
                        <span className="text-muted-foreground">You: </span>
                      )}
                      {chat.last_message.is_deleted
                        ? '[Message deleted]'
                        : chat.last_message.content}
                    </p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      New match! Say hi
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
