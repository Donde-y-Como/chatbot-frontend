'use client'

interface CreditsDisplayProps {
  total: number
  remaining: number
}

const CircularProgress = ({ value }: { value: number }) => {
  const size = 100
  const viewBox = `0 0 ${size} ${size}`
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const usedPercentage = 100 - value
  const dashoffset = circumference - (usedPercentage / 100) * circumference
  const centerX = size / 2
  const centerY = size / 2

  return (
    <>
      <div className='relative h-12 w-12'>
        <svg viewBox={viewBox} className='h-full w-full -rotate-90'>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill='none'
            stroke='rgba(0,0,0,0.1)'
            strokeWidth='8'
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill='none'
            stroke='currentColor'
            strokeWidth='8'
            strokeLinecap='round'
            className='text-red-500 transition-all duration-300'
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashoffset,
            }}
          />
        </svg>
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='text-xs font-semibold'>
            {Math.round(usedPercentage)}%
          </span>
        </div>
      </div>
    </>
  )
}

export function CreditsDisplay({
  total = 10000,
  remaining = 575,
}: CreditsDisplayProps) {
  const percentage = (remaining / total) * 100

  return (
    <>
      <div className='w-full max-w-[240px]'>
        <div className='flex items-center justify-between flex-col gap-2 mb-4'>
          <div className='flex items-center gap-3'>
            <CircularProgress value={percentage} />
            <span className='font-medium'>Mensajes</span>
          </div>
        </div>
        <div className='space-y-1 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Total</span>
            <span className='font-medium'>{total.toLocaleString()}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Restantes</span>
            <span className='font-medium'>{remaining.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </>
  )
}
