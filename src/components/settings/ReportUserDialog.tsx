'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { reportUser } from '@/app/(main)/settings/actions'
import { REPORT_CATEGORIES } from '@/lib/constants'

interface ReportUserDialogProps {
  open: boolean
  onClose: () => void
  reporterId: string
  reportedId: string
  reportedName: string
}

export function ReportUserDialog({
  open,
  onClose,
  reporterId,
  reportedId,
  reportedName,
}: ReportUserDialogProps) {
  const [category, setCategory] = useState<string>('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!category) {
      setError('Please select a category')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const { success: reported, error: reportError } = await reportUser(
      reporterId,
      reportedId,
      category,
      description
    )

    setIsSubmitting(false)

    if (reportError) {
      setError(reportError)
    } else if (reported) {
      setSuccess(true)
      // Reset and close after delay
      setTimeout(() => {
        setSuccess(false)
        setCategory('')
        setDescription('')
        onClose()
      }, 2000)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setCategory('')
      setDescription('')
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report {reportedName}
          </DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting inappropriate behavior.
            False reports may result in account restrictions.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <AlertTriangle className="h-6 w-6 text-green-500" />
            </div>
            <p className="font-medium">Report Submitted</p>
            <p className="text-sm text-muted-foreground">
              Thank you for helping keep our community safe.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Additional Details (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide any additional context..."
                  className="min-h-[100px]"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/1000 characters
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={isSubmitting || !category}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
