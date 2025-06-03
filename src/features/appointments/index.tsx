import { Main } from '@/components/layout/main';
import { Calendar } from '@/features/appointments/Calendar'
import { DialogStateProvider } from '@/features/appointments/contexts/DialogStateContext'

export function Appointments() {
  return (
    <Main fixed>
      <DialogStateProvider>
        <section className='flex h-full gap-2 w-full'>
          <Calendar />
        </section>
      </DialogStateProvider>
    </Main>
  )
}
