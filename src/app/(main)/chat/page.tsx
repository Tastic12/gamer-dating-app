import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatList } from '@/components/chat/ChatList'
import { getChatList } from './actions'

export const metadata = {
  title: 'Chat',
}

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { chats, error } = await getChatList(user.id)

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Messages</h1>
      <ChatList initialChats={chats} error={error} userId={user.id} />
    </div>
  )
}
