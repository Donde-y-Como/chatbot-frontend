import { Skeleton } from '@/components/ui/skeleton.tsx'

export function TableSkeleton() {
  return (
    <div className='px-2 mt-10'>
      <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap'>
        <div>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-4 w-64 mt-1' />
        </div>
        <Skeleton className='h-10 w-24 ' />
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full border rounded-lg'>
          <Skeleton className='h-10 border-b ' />
          <div className='space-y-2 p-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-8 w-full' />
            ))}
          </div>
        </div>
      </div>
    </div>

  )
}
