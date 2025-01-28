import React from 'react'
import { MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const EmptyChatSelectedState = () => {
  return (
    <div className='flex-1 flex items-center justify-center h-full bg-gradient-to-b from-background to-muted/20'>
      <Card className='max-w-md mx-auto text-center border-none bg-transparent shadow-none'>
        <CardContent className='flex flex-col items-center space-y-6 pt-12'>
          <div className='rounded-full bg-primary/10 p-6'>
            <MessageSquare className='w-12 h-12 text-primary' />
          </div>

          <div className='space-y-2'>
            <h2 className='text-2xl font-semibold tracking-tight'>
              Sin chat seleccionado
            </h2>
            <p className='text-muted-foreground text-sm'>
              Elige una conversación de la barra lateral para comenzar a chatear
              o crea un nuevo chat para empezar.
            </p>
          </div>

          <div className='mt-2 text-xs text-muted-foreground'>
            <span className='inline-flex items-center'>
              <kbd className='px-2 py-1 mr-1 rounded bg-muted'>←</kbd>
              Selecciona un chat de la barra lateral
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmptyChatSelectedState
