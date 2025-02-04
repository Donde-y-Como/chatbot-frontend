import { IconUserPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useEmployees } from '../context/users-context'

export function EmployeePrimaryButtons() {
  const { setOpen } = useEmployees()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Agregar empleado</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
