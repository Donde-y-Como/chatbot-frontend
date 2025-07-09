import React from 'react'
import { Skeleton } from '@/components/ui/skeleton.tsx'

export function POSLoading() {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <div className='flex-1 flex flex-col'>
        {/* Header skeleton */}
        <div className='p-2 sm:p-4 border-b border-border bg-card'>
          <div className='flex flex-col space-y-3 sm:space-y-4'>
            {/* Search and filter row */}
            <div className='flex items-center gap-2 sm:gap-4'>
              <Skeleton className='flex-1 h-10 sm:h-12' />
              <Skeleton className='h-10 sm:h-12 w-16 sm:w-24' />
            </div>
            {/* Categories tabs */}
            <div className='flex gap-1 sm:gap-2 overflow-x-auto'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className='h-8 sm:h-10 w-16 sm:w-20 flex-shrink-0'
                />
              ))}
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className='flex-1 p-2 sm:p-4'>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4'>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='aspect-square w-full' />
                <Skeleton className='h-3 sm:h-4 w-full' />
                <Skeleton className='h-3 sm:h-4 w-3/4' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
