'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { Shield, Trash2, LogOut, User, Ban, Loader2, Download, AlertCircle, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { unblockUser, type BlockedUser } from '@/app/(main)/settings/actions'
import {
  exportUserData,
  requestAccountDeletion,
  cancelAccountDeletion,
  type DeletionStatus,
} from '@/app/(main)/settings/gdpr-actions'

interface SettingsPageProps {
  userId: string
  userEmail: string
  blockedUsers: BlockedUser[]
  deletionStatus?: DeletionStatus | null
}

export function SettingsPage({
  userId,
  userEmail,
  blockedUsers: initialBlockedUsers,
  deletionStatus: initialDeletionStatus,
}: SettingsPageProps) {
  const router = useRouter()
  const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers)
  const [deletionStatus, setDeletionStatus] = useState(initialDeletionStatus)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [unblockingId, setUnblockingId] = useState<string | null>(null)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleUnblock = async (blockedId: string) => {
    setUnblockingId(blockedId)
    const { success } = await unblockUser(userId, blockedId)
    if (success) {
      setBlockedUsers((prev) => prev.filter((u) => u.blocked_id !== blockedId))
    }
    setUnblockingId(null)
  }

  const handleExportData = async () => {
    setIsExporting(true)
    const { data, error } = await exportUserData(userId)

    if (data && !error) {
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gamermatch-data-export-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      console.error('Export error:', error)
    }

    setIsExporting(false)
  }

  const handleRequestDeletion = async () => {
    setIsDeleting(true)
    const { success, scheduledDate, error } = await requestAccountDeletion(userId)

    if (success && scheduledDate) {
      setDeletionStatus({
        has_pending_request: true,
        scheduled_deletion_at: scheduledDate,
        days_remaining: 30,
      })
    } else {
      console.error('Delete request error:', error)
    }

    setIsDeleting(false)
  }

  const handleCancelDeletion = async () => {
    setIsCancelling(true)
    const { success } = await cancelAccountDeletion(userId)

    if (success) {
      setDeletionStatus({ has_pending_request: false })
    }

    setIsCancelling(false)
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="space-y-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{userEmail}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Blocked Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Blocked Users
            </CardTitle>
            <CardDescription>
              Blocked users cannot see your profile or contact you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {blockedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No blocked users</p>
            ) : (
              <div className="space-y-3">
                {blockedUsers.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
                        {block.blocked_user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{block.blocked_user.display_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Blocked {formatDistanceToNow(new Date(block.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(block.blocked_id)}
                      disabled={unblockingId === block.blocked_id}
                    >
                      {unblockingId === block.blocked_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Unblock'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy & Data (GDPR) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
            <CardDescription>
              Manage your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your data is protected with industry-standard encryption. Under GDPR, you have the
              right to export or delete your personal data at any time.
            </p>

            {/* Data Export */}
            <div className="rounded-lg border p-4">
              <h4 className="font-medium">Export Your Data</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Download a copy of all your personal data including profile, matches, and messages.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Data
                  </>
                )}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/privacy" target="_blank">Privacy Policy</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/terms" target="_blank">Terms of Service</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Account deletion with 30-day grace period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deletionStatus?.has_pending_request ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-400">
                      Account Deletion Scheduled
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your account will be permanently deleted on{' '}
                      <span className="font-medium">
                        {deletionStatus.scheduled_deletion_at
                          ? format(new Date(deletionStatus.scheduled_deletion_at), 'MMMM d, yyyy')
                          : 'soon'}
                      </span>
                      . You have {deletionStatus.days_remaining || 30} days to cancel this request.
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleCancelDeletion} disabled={isCancelling}>
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <Undo2 className="mr-2 h-4 w-4" />
                      Cancel Deletion Request
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Request Account Deletion</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        Your account will be deactivated immediately and scheduled for permanent
                        deletion in 30 days.
                      </p>
                      <p>
                        During this period, you can log back in to cancel the deletion request and
                        restore your account.
                      </p>
                      <p className="font-medium">
                        After 30 days, all your data will be permanently deleted and cannot be
                        recovered.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRequestDeletion}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
