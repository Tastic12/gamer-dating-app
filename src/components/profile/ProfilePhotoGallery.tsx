'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Camera, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProfilePhotoGalleryProps {
  photos: string[]
  displayName: string
}

export function ProfilePhotoGallery({ photos, displayName }: ProfilePhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const hasPhotos = photos.length > 0
  const hasMultiplePhotos = photos.length > 1

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative">
      {/* Main Photo Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted sm:aspect-[4/3]">
        {hasPhotos ? (
          <>
            <Image
              src={photos[currentIndex]}
              alt={`${displayName}'s photo ${currentIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />

            {/* Navigation Arrows */}
            {hasMultiplePhotos && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Photo Indicators */}
            {hasMultiplePhotos && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      idx === currentIndex
                        ? 'w-6 bg-white'
                        : 'w-2 bg-white/50 hover:bg-white/75'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Photo Count Badge */}
            {hasMultiplePhotos && (
              <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {currentIndex + 1} / {photos.length}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <User className="h-20 w-20 opacity-50" />
            <p className="text-sm">No photos yet</p>
          </div>
        )}

        {/* Quick Edit Button - Always Visible */}
        <Link
          href="/profile/edit"
          className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
        >
          <Camera className="h-4 w-4" />
          {hasPhotos ? 'Edit Photos' : 'Add Photos'}
        </Link>
      </div>

      {/* Thumbnail Strip */}
      {hasMultiplePhotos && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, idx) => (
            <button
              key={photo}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all',
                idx === currentIndex
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={photo}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
