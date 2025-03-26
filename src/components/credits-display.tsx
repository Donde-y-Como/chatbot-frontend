import { AlertTriangle } from 'lucide-react'

interface CreditsDisplayProps {
  total: number
  remaining: number
  usedMessages?: number
  planName?: string
  endTimestamp?: number
  active?: boolean
  status?: 'active' | 'inactive'
}

const CircularProgress = ({ value, isLowCredits }: { value: number, isLowCredits: boolean }) => {
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
            className={`transition-all duration-300 ${isLowCredits ? 'text-red-500' : 'text-green-500'}`}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashoffset,
            }}
          />
        </svg>
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className={`text-xs font-semibold ${isLowCredits ? 'text-red-500' : ''}`}>
            {Math.round(usedPercentage)}%
          </span>
        </div>
      </div>
    </>
  )
}

const formatDate = (timestamp: number): string => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

const getDaysRemaining = (timestamp: number): number => {
  if (!timestamp) return 0
  const today = new Date()
  const endDate = new Date(timestamp)
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function CreditsDisplay({
  total = 10000,
  remaining = 575,
  usedMessages = 0,
  planName = 'Trial',
  endTimestamp = 0,
  active = true,
  status = 'active'
}: CreditsDisplayProps) {
  const percentage = (remaining / total) * 100
  const isLowCredits = percentage <= 10
  const daysRemaining = getDaysRemaining(endTimestamp)
  const isExpirationSoon = daysRemaining > 0 && daysRemaining <= 7
  const expiryDate = formatDate(endTimestamp)

  return (
    <>
      <div className='w-full max-w-[240px]'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <CircularProgress value={percentage} isLowCredits={isLowCredits} />
            <div>
              <div className='font-medium'>Mensajes</div>
              {isLowCredits && (
                <div className='text-xs text-red-500 font-medium'>¡Créditos bajos!</div>
              )}
            </div>
          </div>
        </div>
        
        <div className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Plan</span>
            <span className='font-medium flex items-center gap-1'>
              {planName}
              {active ? (
                <span className='inline-block w-2 h-2 bg-green-500 rounded-full'></span>
              ) : (
                <span className='inline-block w-2 h-2 bg-red-500 rounded-full'></span>
              )}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Estado</span>
            <span className={`font-medium ${status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
              {status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Vence</span>
            <div className='flex items-center gap-1'>
              <span className={`font-medium ${isExpirationSoon ? 'text-amber-500' : ''}`}>
                {expiryDate}
              </span>
              {isExpirationSoon && (
                <span className='text-xs text-amber-500 font-medium'>
                  ({daysRemaining} día{daysRemaining !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Total</span>
            <span className='font-medium'>{total.toLocaleString()}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Usados</span>
            <span className='font-medium'>{usedMessages.toLocaleString()}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Restantes</span>
            <span className={`font-medium ${isLowCredits ? 'text-red-500' : ''}`}>
              {remaining.toLocaleString()}
            </span>
          </div>
        </div>
        
        {isExpirationSoon && (
          <div className='mt-3 p-2 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-300 text-xs'>
            <div className='flex items-center gap-1'>
              <AlertTriangle className='h-3 w-3' />
              <span className='font-medium'>Tu plan vence pronto</span>
            </div>
            <p>Renueva tu plan para continuar disfrutando del servicio.</p>
          </div>
        )}
      </div>
    </>
  )
}
