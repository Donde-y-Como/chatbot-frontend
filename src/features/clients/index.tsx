import { useMemo } from 'react'
import { TableSkeleton } from '@/components/TableSkeleton.tsx'
import { Main } from '@/components/layout/main'
import { DialogStateProvider } from '@/features/appointments/contexts/DialogStateContext.tsx'
import { ClientDialogs } from '@/features/clients/components/client-dialogs.tsx'
import ClientsProvider from '@/features/clients/context/clients-context.tsx'
import { CustomTable } from '../../components/tables/custom-table.tsx'
import { DataTableToolbar } from '../../components/tables/data-table-toolbar.tsx'
import { Separator } from '../../components/ui/separator.tsx'
import { SidebarTrigger } from '../../components/ui/sidebar.tsx'
import { useGetClients } from '../appointments/hooks/useGetClients.ts'
import { AddTagButton } from '../chats/AddTagButton.tsx'
import { ClientPrimaryButtons } from './components/client-primary-buttons.tsx'
import { createColumns, globalFilterFn } from './components/clients-columns.tsx'
import {
  DataTableFacetedFilter,
  generateTagOptions,
  platformOptions,
} from './components/clients-table-filters.tsx'
import { useGetTags } from './hooks/useGetTags.ts'
import { ClientPrimitives } from './types.ts'

export default function Clients() {
  const { data: clients, isLoading } = useGetClients()
  const { data: tags, isLoading: tagsIsLoading } = useGetTags()
  const columns = useMemo(() => createColumns(tags), [tags])
  const tagOptions = useMemo(() => generateTagOptions(tags || []), [tags])

  if (isLoading || tagsIsLoading) {
    return <TableSkeleton />
  }

  return (
    <ClientsProvider>
      <Main>
        <section className='p-2'>
          <div className='mb-2 w-full flex sm:items-center flex-col sm:flex-row  sm:justify-between'>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-2 items-center'>
                <SidebarTrigger variant='outline' className='sm:hidden' />
                <Separator orientation='vertical' className='h-7 sm:hidden' />
                <h1 className='text-2xl font-bold'>Clientes</h1>
              </div>

              <p className='text-muted-foreground self-start mb-2 sm:mb-0'>
                Gestiona los clientes de tu negocio aqui.
              </p>
            </div>

            <ClientPrimaryButtons />
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            {clients && tags && (
              <CustomTable<ClientPrimitives>
                data={clients}
                columns={columns}
                globalFilterFn={globalFilterFn}
                toolbar={(table) => (
                  <DataTableToolbar
                    table={table}
                    searchPlaceholder='Buscar por nombre, email, dirección, notas o teléfono...'
                  >
                    <DataTableFacetedFilter
                      column={table.getColumn('platformIdentities')}
                      title='Plataformas'
                      options={platformOptions}
                    />
                    <div className='flex items-center gap-2'>
                      <DataTableFacetedFilter
                        column={table.getColumn('tagIds')}
                        title='Etiquetas'
                        options={tagOptions}
                      />
                      <AddTagButton withLabel />
                    </div>
                  </DataTableToolbar>
                )}
              />
            )}
          </div>
        </section>
      </Main>
      <DialogStateProvider>
        <ClientDialogs />
      </DialogStateProvider>
    </ClientsProvider>
  )
}
