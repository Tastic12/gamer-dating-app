'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-20 w-20 text-2xl',
}

const imageSizes = {
  sm: 32,
  md: 40,
  lg: 64,
  xl: 80,
}

export function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false)

  const showImage = src && !imageError

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${imageSizes[size]}px`}
          onError={() => setImageError(true)}
        />
      ) : fallback ? (
        <span className="font-semibold text-muted-foreground">
          {fallback.charAt(0).toUpperCase()}
        </span>
      ) : (
        <User className="h-1/2 w-1/2 text-muted-foreground" />
      )}
    </div>
  )
}
