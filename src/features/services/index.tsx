import { TableSkeleton } from '@/components/TableSkeleton.tsx'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { CustomTable } from '@/components/tables/custom-table.tsx'
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts'
import { columns } from './components/services-columns.tsx'
import { ServicesDialogs } from './components/services-dialogs.tsx'
import { ServicesPrimaryButtons } from './components/services-primary-buttons.tsx'
import ServicesProvider from './context/services-context.tsx'
import { Service } from '@/features/appointments/types.ts'

export default function Services() {
  const { data: services, isLoading: isServicesLoading } = useGetServices()

  if (isServicesLoading) {
    return <TableSkeleton />
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
            {services && <CustomTable<Service>  data={services} columns={columns} />}
          </div>
        </section>
      </Main>

      <ServicesDialogs />
    </ServicesProvider>
  )
}
