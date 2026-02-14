'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import { ArrowLeft, Send, Loader2, MoreVertical, Ban, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, getMessages, markMessagesAsRead, type Message } from '@/app/(main)/chat/actions'
import { blockUser } from '@/app/(main)/settings/actions'
import { ReportUserDialog } from '@/components/settings/ReportUserDialog'
import type { Profile } from '@/types/database'
import { cn } from '@/lib/utils'

interface ChatRoomProps {
  matchId: string
  userId: string
  otherUser: Profile
  initialMessages: Message[]
}

function formatMessageTime(date: Date): string {
  return format(date, 'h:mm a')
}

function formatDateSeparator(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

export function ChatRoom({ matchId, userId, otherUser, initialMessages }: ChatRoomProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Initial scroll
  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  // Subscribe to real-time messages
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          // Add is_own_message flag
          newMsg.is_own_message = newMsg.sender_id === userId

          setMessages((prev) => {
            // Check if message already exists (from optimistic update)
            if (prev.some((m) => m.id === newMsg.id)) {
              return prev
            }
            return [...prev, newMsg]
          })

          // Mark as read if from other user
          if (newMsg.sender_id !== userId) {
            markMessagesAsRead(matchId, userId)
          }

          scrollToBottom()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, userId, scrollToBottom])

  // Handle send message
  const handleSend = async () => {
    const content = newMessage.trim()
    if (!content || isSending) return

    setIsSending(true)
    setError(null)
    setNewMessage('')

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      match_id: matchId,
      sender_id: userId,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
      is_deleted: false,
      is_own_message: true,
    }

    setMessages((prev) => [...prev, optimisticMessage])
    scrollToBottom()

    const { message, error: sendError } = await sendMessage(matchId, userId, content)

    if (sendError) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
      setError(sendError)
      setNewMessage(content) // Restore message
    } else if (message) {
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMessage.id ? { ...message, is_own_message: true } : m))
      )
    }

    setIsSending(false)
    textareaRef.current?.focus()
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Load more messages
  const loadMore = async () => {
    if (messages.length === 0) return

    const oldestMessage = messages[0]
    const { messages: olderMessages } = await getMessages(
      matchId,
      userId,
      50,
      oldestMessage.created_at
    )

    if (olderMessages.length > 0) {
      // Reverse because they come in DESC order
      setMessages((prev) => [...olderMessages.reverse(), ...prev])
    }
  }

  // Group messages by date
  const groupedMessages: { date: Date; messages: Message[] }[] = []
  let currentGroup: { date: Date; messages: Message[] } | null = null

  // Reverse messages for display (oldest first)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  sortedMessages.forEach((msg) => {
    const msgDate = new Date(msg.created_at)
    if (!currentGroup || !isSameDay(currentGroup.date, msgDate)) {
      currentGroup = { date: msgDate, messages: [] }
      groupedMessages.push(currentGroup)
    }
    currentGroup.messages.push(msg)
  })

  const handleBlock = async () => {
    setIsBlocking(true)
    const { success } = await blockUser(userId, otherUser.id)
    setIsBlocking(false)
    setShowBlockDialog(false)
    if (success) {
      router.push('/chat')
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chat">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
          {otherUser.display_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">{otherUser.display_name}</h2>
          <p className="text-xs text-muted-foreground">
            {otherUser.playstyle} player
            {otherUser.platforms.length > 0 && ` • ${otherUser.platforms[0]}`}
          </p>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
              <Flag className="mr-2 h-4 w-4" />
              Report User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowBlockDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Ban className="mr-2 h-4 w-4" />
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {otherUser.display_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won&apos;t be able to see your profile or contact you. Your conversation will be
              removed and you&apos;ll be unmatched. You can unblock them later in Settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBlocking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              disabled={isBlocking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBlocking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Blocking...
                </>
              ) : (
                'Block'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <ReportUserDialog
        open={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        reporterId={userId}
        reportedId={otherUser.id}
        reportedName={otherUser.display_name}
      />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {messages.length >= 50 && (
          <div className="mb-4 text-center">
            <Button variant="ghost" size="sm" onClick={loadMore}>
              Load earlier messages
            </Button>
          </div>
        )}

        {groupedMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">Say hi to {otherUser.display_name}!</p>
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Date separator */}
              <div className="my-4 flex items-center justify-center">
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {formatDateSeparator(group.date)}
                </span>
              </div>

              {/* Messages in group */}
              {group.messages.map((msg, msgIndex) => {
                const isOwn = msg.is_own_message ?? msg.sender_id === userId
                const showAvatar =
                  !isOwn &&
                  (msgIndex === 0 ||
                    group.messages[msgIndex - 1]?.sender_id !== msg.sender_id)

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'mb-2 flex',
                      isOwn ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {!isOwn && (
                      <div className="mr-2 w-8">
                        {showAvatar && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {otherUser.display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2',
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted',
                        msg.is_deleted && 'italic opacity-60'
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {msg.is_deleted ? '[Message deleted]' : msg.content}
                      </p>
                      <p
                        className={cn(
                          'mt-1 text-[10px]',
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}
                      >
                        {formatMessageTime(new Date(msg.created_at))}
                        {isOwn && msg.read_at && ' • Read'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Message input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className="h-11 w-11 shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
