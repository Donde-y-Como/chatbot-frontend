import { Skeleton } from '@/components/ui/skeleton.tsx'

export function TableSkeleton() {
  return (
    <div className='px-2 mt-6'>
      {/* Header Section */}
      <div className='mb-6 flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-40' />
          <Skeleton className='h-4 w-80' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-28' />
          <Skeleton className='h-10 w-32' />
        </div>
      </div>

      {/* Table Section */}
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
        <div className='w-full border rounded-lg bg-card'>
          {/* Table Toolbar */}
          <div className='p-4 border-b bg-muted/20'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-8 w-80' />
                <Skeleton className='h-8 w-24' />
                <Skeleton className='h-8 w-28' />
              </div>
              <Skeleton className='h-8 w-20' />
            </div>
          </div>

          {/* Table Header */}
          <div className='grid grid-cols-6 gap-4 p-4 border-b bg-muted/10'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-18' />
            <Skeleton className='h-4 w-22' />
            <Skeleton className='h-4 w-16' />
          </div>

          {/* Table Rows */}
          <div className='divide-y'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='grid grid-cols-6 gap-4 p-4 items-center'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-10 w-10 rounded-full' />
                  <Skeleton className='h-4 w-24' />
                </div>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-28' />
                <div className='flex gap-1'>
                  <Skeleton className='h-5 w-16 rounded-full' />
                  <Skeleton className='h-5 w-20 rounded-full' />
                </div>
                <div className='flex gap-1'>
                  <Skeleton className='h-5 w-12 rounded-full' />
                  <Skeleton className='h-5 w-14 rounded-full' />
                </div>
                <div className='flex gap-1'>
                  <Skeleton className='h-8 w-8 rounded' />
                  <Skeleton className='h-8 w-8 rounded' />
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer */}
          <div className='p-4 border-t bg-muted/10'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-4 w-40' />
              <div className='flex items-center gap-2'>
                <Skeleton className='h-8 w-20' />
                <Skeleton className='h-8 w-8' />
                <Skeleton className='h-8 w-8' />
                <Skeleton className='h-8 w-8' />
                <Skeleton className='h-8 w-8' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
