import { Main } from '@/components/layout/main';
import { Calendar } from '@/features/appointments/Calendar'

export default function Appointments() {
  return (
    <Main fixed>
      <section className='flex h-full gap-2 w-full '>
        <Calendar />
      </section>
    </Main>
  )
}
