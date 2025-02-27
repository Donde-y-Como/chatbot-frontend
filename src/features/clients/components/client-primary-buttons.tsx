import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useClients } from '../context/clients-context'

export function ClientPrimaryButtons() {
  const { setOpen } = useClients()
  return (
    <div className='flex gap-2'>
      <Button className='w-full sm:w-auto' onClick={() => setOpen('add')}>
        <Plus className='mr-2 h-4 w-4' />
        Nuevo cliente
      </Button>
    </div>
  )
}
