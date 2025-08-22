import { useMemo, useState } from 'react'
import { Separator } from '@/components/ui/separator.tsx'
import { SidebarTrigger } from '@/components/ui/sidebar.tsx'
import { TableSkeleton } from '@/components/TableSkeleton.tsx'
import { Main } from '@/components/layout/main'
import { CustomTable } from '@/components/tables/custom-table.tsx'
import { DataTableToolbar } from '@/components/tables/data-table-toolbar.tsx'
import { createColumns, globalFilterFn } from './components/sales-columns'
import { SalesFiltersComponent } from './components/sales-filters'
import { SalesStats } from './components/sales-stats'
import { useGetSalesForStats, useGetSalesFiltered } from './hooks'
import { Sale, SalesFilters } from './types'

export default function SalesHistory() {
  const [filters, setFilters] = useState<SalesFilters>({})

  // Separate queries for stats and filtered data
  const {
    data: statsResponse,
    isLoading: isStatsLoading,
    error: statsError,
  } = useGetSalesForStats()
  const {
    data: filteredResponse,
    isLoading: isTableLoading,
    error: tableError,
  } = useGetSalesFiltered(filters)
  const columns = useMemo(() => createColumns(), [])

  // Use filtered data if available, otherwise use stats data
  const hasFilters = Object.keys(filters).length > 0
  const salesResponse = hasFilters ? filteredResponse : statsResponse
  const sales = salesResponse?.data || []
  const isLoading = hasFilters ? isTableLoading : isStatsLoading
  const error = hasFilters ? tableError : statsError

  // Stats always use unfiltered data
  const statsSales = statsResponse?.data || []

  const handleFiltersChange = (newFilters: SalesFilters) => {
    setFilters(newFilters)
  }

  // Show initial loading only if stats are loading and we have no data
  if (isStatsLoading && !statsResponse) {
    return <TableSkeleton />
  }

  if (error) {
    return (
      <Main>
        <section className='p-2'>
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-destructive mb-2'>
                Error al cargar las ventas
              </h2>
              <p className='text-muted-foreground'>
                No se pudieron cargar las ventas. Por favor, intenta nuevamente.
              </p>
            </div>
          </div>
        </section>
      </Main>
    )
  }

  return (
    <Main>
      <section className='p-2 space-y-6'>
        {/* Header */}
        <div className='mb-2 w-full flex sm:items-center flex-col sm:flex-row sm:justify-between'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2 items-center'>
              <SidebarTrigger variant='outline' className='' />
              <Separator orientation='vertical' className='h-7 ' />
              <h1 className='text-2xl font-bold'>Historial de Ventas</h1>
            </div>
            <p className='text-muted-foreground self-start mb-2 sm:mb-0'>
              Consulta el historial completo de ventas de tu negocio.
            </p>
          </div>
          <div className='flex gap-2'>
            <SalesFiltersComponent
              onFiltersChange={handleFiltersChange}
              currentFilters={filters}
            />
          </div>
        </div>

        {/* Estadísticas */}
        {isStatsLoading ? (
          <div className='animate-pulse space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='h-24 bg-muted rounded-lg'></div>
              ))}
            </div>
          </div>
        ) : (
          <SalesStats sales={statsSales} />
        )}

        {/* Tabla de Ventas */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {isLoading ? (
            <TableSkeleton />
          ) : sales.length > 0 ? (
            <CustomTable<Sale>
              data={sales}
              columns={columns}
              globalFilterFn={globalFilterFn}
              toolbar={(table) => (
                <DataTableToolbar
                  table={table}
                  searchPlaceholder='Buscar por ID de venta, cliente o notas...'
                />
              )}
            />
          ) : (
            <div className='flex items-center justify-center h-32 border border-dashed rounded-lg'>
              <div className='text-center'>
                <p className='text-muted-foreground mb-2'>
                  No se encontraron ventas
                </p>
                <p className='text-sm text-muted-foreground'>
                  {Object.keys(filters).length > 0
                    ? 'Intenta ajustar los filtros para ver más resultados'
                    : 'Aún no se han registrado ventas'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {salesResponse && (
          <div className='flex justify-between items-center text-sm text-muted-foreground'>
            <span>
              Mostrando {sales.length} {sales.length === 1 ? 'venta' : 'ventas'}
              {salesResponse.count !== sales.length &&
                ` de ${salesResponse.count} total`}
            </span>
            {filters.limit && sales.length === filters.limit && (
              <span className='text-xs bg-muted px-2 py-1 rounded'>
                Límite de {filters.limit} resultados alcanzado
              </span>
            )}
          </div>
        )}
      </section>
    </Main>
  )
}
