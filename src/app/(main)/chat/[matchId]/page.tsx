import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatRoom } from '@/components/chat/ChatRoom'
import { getMatchDetails, getMessages, markMessagesAsRead } from '../actions'

export const metadata = {
  title: 'Chat',
}

type PageProps = {
  params: Promise<{ matchId: string }>
}

export default async function ChatRoomPage({ params }: PageProps) {
  const { matchId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get match details
  const { otherUser, error: matchError } = await getMatchDetails(matchId, user.id)

  if (matchError || !otherUser) {
    notFound()
  }

  // Get initial messages
  const { messages: initialMessages } = await getMessages(matchId, user.id)

  // Mark messages as read
  await markMessagesAsRead(matchId, user.id)

  return (
    <ChatRoom
      matchId={matchId}
      userId={user.id}
      otherUser={otherUser}
      initialMessages={initialMessages}
    />
  )
}
