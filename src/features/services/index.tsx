import { TableSkeleton } from '@/components/TableSkeleton.tsx'
import { Main } from '@/components/layout/main'
import { CustomTable } from '@/components/tables/custom-table.tsx'
import { useGetServices } from '@/features/appointments/hooks/useGetServices.ts'
import { Service } from '@/features/appointments/types.ts'
import { columns } from './components/services-columns.tsx'
import { ServicesDialogs } from './components/services-dialogs.tsx'
import { ServicesPrimaryButtons } from './components/services-primary-buttons.tsx'
import ServicesProvider from './context/services-context.tsx'
import { SidebarTrigger } from '../../components/ui/sidebar.tsx'
import { Separator } from '@radix-ui/react-separator'

export default function Services() {
  const { data: services, isLoading: isServicesLoading } = useGetServices()

  if (isServicesLoading) {
    return <TableSkeleton />
  }

  return (
    <ServicesProvider>
      <Main fixed>
        <section className='p-2'>

        <div
            className="mb-2 w-full flex sm:items-center flex-col sm:flex-row  sm:justify-between">
            <div className='flex flex-col gap-2'>
              <div className='flex gap-2 items-center'>
                <SidebarTrigger variant='outline' className='sm:hidden' />
                <Separator orientation='vertical' className='h-7 sm:hidden' />
                <h1 className='text-2xl font-bold'>Servicios</h1>
              </div>

              <p className="text-muted-foreground self-start mb-2 sm:mb-0">
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
