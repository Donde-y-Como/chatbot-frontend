import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts'
import { ServicesTable } from './components/services-table.tsx'
import { columns } from './components/services-columns.tsx'
import { ServicesDialogs } from './components/services-dialogs.tsx'
import { ServicesPrimaryButtons } from './components/services-primary-buttons.tsx'
import ServicesProvider from './context/services-context.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'

export default function Services() {
  const { data: services, isLoading: isServicesLoading } = useGetServices()

  if (isServicesLoading) {
    return <ServicesSkeleton/>
  }

  return (
    <ServicesProvider>
      <Header fixed>
        <Search />
      </Header>

      <Main fixed>
        <section className='px-2'>
          <div className='mb-2 flex items-center justify-center text-center sm:text-justify sm:justify-between space-y-2 flex-wrap'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Servicios</h2>
              <p className='text-muted-foreground'>
                Gestiona los servicios para agendar citas aqui.
              </p>
            </div>
            <ServicesPrimaryButtons />
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            {services && <ServicesTable data={services} columns={columns} />}
          </div>
        </section>
      </Main>

      <ServicesDialogs />
    </ServicesProvider>
  )
}

function ServicesSkeleton() {
  return (
    <div className='px-2 mt-10'>
      <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap'>
        <div>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-4 w-64 mt-1' />
        </div>
        <Skeleton className='h-10 w-24 ' />
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full border rounded-lg'>
          <Skeleton className='h-10 border-b ' />
          <div className='space-y-2 p-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-8 w-full' />
            ))}
          </div>
        </div>
      </div>
    </div>

  )
}
