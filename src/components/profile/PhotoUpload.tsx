'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Loader2, X, Plus, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  userId: string
  currentPhotos: string[]
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
  className?: string
}

export function PhotoUpload({
  userId,
  currentPhotos,
  onPhotosChange,
  maxPhotos = 6,
  className,
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceIndexRef = useRef<number | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input
    e.target.value = ''

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('profile-photos').getPublicUrl(fileName)

      // Update photos array
      let newPhotos: string[]
      if (replaceIndexRef.current !== null) {
        // Replace existing photo
        newPhotos = [...currentPhotos]
        
        // Delete old photo from storage
        const oldUrl = currentPhotos[replaceIndexRef.current]
        if (oldUrl) {
          const oldPath = oldUrl.split('/profile-photos/')[1]
          if (oldPath) {
            await supabase.storage.from('profile-photos').remove([oldPath])
          }
        }
        
        newPhotos[replaceIndexRef.current] = publicUrl
      } else {
        // Add new photo
        newPhotos = [...currentPhotos, publicUrl]
      }

      onPhotosChange(newPhotos)
      replaceIndexRef.current = null
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setIsUploading(false)
      setUploadingIndex(null)
    }
  }

  const handleAddClick = (index?: number) => {
    replaceIndexRef.current = index ?? null
    setUploadingIndex(index ?? currentPhotos.length)
    fileInputRef.current?.click()
  }

  const handleRemove = async (index: number) => {
    const photoUrl = currentPhotos[index]
    
    try {
      const supabase = createClient()
      
      // Extract path from URL and delete from storage
      const path = photoUrl.split('/profile-photos/')[1]
      if (path) {
        await supabase.storage.from('profile-photos').remove([path])
      }
      
      // Update photos array
      const newPhotos = currentPhotos.filter((_, i) => i !== index)
      onPhotosChange(newPhotos)
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete photo')
    }
  }

  const primaryPhoto = currentPhotos[0]

  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Primary Photo - Large */}
      <div className="relative">
        <div
          className={cn(
            'relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-full border-4 border-dashed transition-all',
            primaryPhoto
              ? 'border-primary/50 bg-muted'
              : 'border-muted-foreground/30 bg-muted/50 hover:border-primary/50 hover:bg-muted',
            !primaryPhoto && 'cursor-pointer'
          )}
          onClick={() => !primaryPhoto && handleAddClick(0)}
        >
          {primaryPhoto ? (
            <>
              <Image
                src={primaryPhoto}
                alt="Profile photo"
                fill
                className="object-cover"
                sizes="200px"
              />
              {isUploading && uploadingIndex === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
              {isUploading && uploadingIndex === 0 ? (
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <User className="h-16 w-16 text-muted-foreground/50" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Add Profile Photo
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Edit/Add button overlay for primary */}
        {primaryPhoto && (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute bottom-2 right-1/2 translate-x-[60px] rounded-full shadow-lg"
            onClick={() => handleAddClick(0)}
            disabled={isUploading}
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Additional Photos Grid */}
      <div>
        <p className="mb-2 text-sm text-muted-foreground">
          Additional photos ({currentPhotos.length}/{maxPhotos})
        </p>
        <div className="grid grid-cols-4 gap-2">
          {/* Existing additional photos */}
          {currentPhotos.slice(1).map((photo, idx) => {
            const actualIndex = idx + 1
            return (
              <div
                key={photo}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                <Image
                  src={photo}
                  alt={`Photo ${actualIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
                {isUploading && uploadingIndex === actualIndex ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => handleAddClick(actualIndex)}
                    >
                      <Camera className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={() => handleRemove(actualIndex)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Add more button */}
          {currentPhotos.length < maxPhotos && (
            <button
              type="button"
              onClick={() => handleAddClick()}
              disabled={isUploading}
              className={cn(
                'flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-all hover:border-primary/50 hover:bg-muted/50',
                isUploading && uploadingIndex === currentPhotos.length && 'border-primary bg-muted'
              )}
            >
              {isUploading && uploadingIndex === currentPhotos.length ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <Plus className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
