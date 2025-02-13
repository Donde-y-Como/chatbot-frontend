import { Main } from '@/components/layout/main.tsx'
import EventsView from '@/features/events/events-view.tsx'

export default function Events() {
  return (
    <Main fixed>
      <section className='flex h-full gap-2 w-full'>
        <EventsView />
      </section>
    </Main>
  )
}
