import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert.tsx';
import { Button } from '@/components/ui/button.tsx';


export function POSError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='max-w-md w-full mx-auto'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription className='mt-2'>
            <div className='space-y-2'>
              <p className='font-medium'>Error al cargar el sistema POS</p>
              <p className='text-sm'>
                {error?.message ||
                  'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.'}
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={onRetry}
                className='mt-3'
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Reintentar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
