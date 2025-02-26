import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useServices } from '../context/services-context.tsx'

export function ServicesPrimaryButtons() {
  const { setOpen } = useServices()
  return (
    <div className='flex gap-2'>
      <Button className='w-full sm:w-auto' onClick={() => setOpen('add')}>
        <Plus className='mr-2 h-4 w-4' />
        Nuevo Servicio
      </Button>
    </div>
  )
}
