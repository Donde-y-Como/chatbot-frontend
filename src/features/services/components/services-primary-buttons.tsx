import { IconBox } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useServices } from '../context/services-context.tsx'

export function ServicesPrimaryButtons() {
  const { setOpen } = useServices()
  return (
    <div className='flex gap-2 items-center justify-center'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Agregar servicio</span> <IconBox size={18} />
      </Button>
    </div>
  )
}
