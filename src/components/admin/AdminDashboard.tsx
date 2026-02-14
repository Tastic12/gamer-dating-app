'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Users,
  Shield,
  MessageCircle,
  Heart,
  AlertTriangle,
  Ban,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  updateReportStatus,
  banUserAction,
  unbanUserAction,
  type AdminStats,
  type Report,
} from '@/app/admin/actions'
import type { Profile } from '@/types/database'
import { REPORT_CATEGORIES } from '@/lib/constants'

interface AdminDashboardProps {
  adminId: string
  stats: AdminStats | null
  pendingReports: Report[]
  recentUsers: Profile[]
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string
  value: number
  icon: React.ElementType
  description?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

export function AdminDashboard({ adminId, stats, pendingReports: initialReports, recentUsers }: AdminDashboardProps) {
  const [reports, setReports] = useState(initialReports)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [banningUserId, setBanningUserId] = useState<string | null>(null)

  const handleReportAction = async (status: 'resolved' | 'dismissed') => {
    if (!selectedReport) return

    setIsProcessing(true)
    const { success } = await updateReportStatus(adminId, selectedReport.id, status, adminNotes)

    if (success) {
      setReports((prev) => prev.filter((r) => r.id !== selectedReport.id))
      setSelectedReport(null)
      setAdminNotes('')
    }
    setIsProcessing(false)
  }

  const handleBanFromReport = async () => {
    if (!selectedReport) return

    setIsProcessing(true)
    const { success: banSuccess } = await banUserAction(adminId, selectedReport.reported_id)

    if (banSuccess) {
      await updateReportStatus(adminId, selectedReport.id, 'resolved', adminNotes || 'User banned')
      setReports((prev) => prev.filter((r) => r.id !== selectedReport.id))
      setSelectedReport(null)
      setAdminNotes('')
    }
    setIsProcessing(false)
  }

  const handleToggleBan = async (userId: string, isBanned: boolean) => {
    setBanningUserId(userId)
    if (isBanned) {
      await unbanUserAction(adminId, userId)
    } else {
      await banUserAction(adminId, userId)
    }
    setBanningUserId(null)
  }

  const getCategoryLabel = (value: string) => {
    return REPORT_CATEGORIES.find((c) => c.value === value)?.label || value
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage users and review reports</p>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard title="Total Users" value={stats.total_users} icon={Users} />
          <StatCard title="Active Users" value={stats.active_users} icon={Users} />
          <StatCard title="Banned" value={stats.banned_users} icon={Ban} />
          <StatCard title="Pending Reports" value={stats.pending_reports} icon={AlertTriangle} />
          <StatCard title="Total Matches" value={stats.total_matches} icon={Heart} />
          <StatCard title="Messages" value={stats.total_messages} icon={MessageCircle} />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="reports">
        <TabsList className="mb-4">
          <TabsTrigger value="reports">
            Pending Reports
            {reports.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {reports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Recent Users</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
                <p className="text-lg font-medium">No pending reports</p>
                <p className="text-sm text-muted-foreground">All caught up!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setSelectedReport(report)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{getCategoryLabel(report.category)}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-2 text-sm">
                          <span className="font-medium">{report.reporter?.display_name || 'Unknown'}</span>
                          {' reported '}
                          <span className="font-medium">{report.reported?.display_name || 'Unknown'}</span>
                        </p>
                        {report.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {report.description}
                          </p>
                        )}
                      </div>
                      <Button size="sm">Review</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.display_name}</span>
                          {user.is_banned && <Badge variant="destructive">Banned</Badge>}
                          {!user.is_active && !user.is_banned && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                          {user.region && ` • ${user.region}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={user.is_banned ? 'outline' : 'destructive'}
                      size="sm"
                      onClick={() => handleToggleBan(user.id, user.is_banned)}
                      disabled={banningUserId === user.id}
                    >
                      {banningUserId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.is_banned ? (
                        'Unban'
                      ) : (
                        'Ban'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
            <DialogDescription>
              Take action on this report
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{getCategoryLabel(selectedReport.category)}</Badge>
                </div>
                <p className="mt-2 text-sm">
                  <span className="font-medium">{selectedReport.reporter?.display_name}</span>
                  {' reported '}
                  <span className="font-medium">{selectedReport.reported?.display_name}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(selectedReport.created_at), { addSuffix: true })}
                </p>
              </div>

              {selectedReport.description && (
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedReport.description}</p>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-medium">Admin Notes (optional)</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => handleReportAction('dismissed')}
              disabled={isProcessing}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Dismiss
            </Button>
            <Button
              variant="outline"
              onClick={() => handleReportAction('resolved')}
              disabled={isProcessing}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Resolve (No Ban)
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanFromReport}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Ban className="mr-2 h-4 w-4" />
              )}
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
