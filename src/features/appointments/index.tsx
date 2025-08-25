import { Main } from '@/components/layout/main';
import { Calendar } from '@/features/appointments/Calendar'
import { DialogStateProvider } from '@/features/appointments/contexts/DialogStateContext'

export function Appointments() {
  return (
    <Main fixed>
      <DialogStateProvider>
        <div className='h-full w-full overflow-hidden'>
          <Calendar />
        </div>
      </DialogStateProvider>
    </Main>
  )
}
