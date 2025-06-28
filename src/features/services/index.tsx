import { useMemo } from 'react'
import { Briefcase, DollarSign, Timer, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { TableSkeleton } from '@/components/TableSkeleton'
import { Main } from '@/components/layout/main'
import { CustomTable } from '@/components/tables/custom-table'
import { DataTableToolbar } from '@/components/tables/data-table-toolbar'
import { useGetServices } from '@/features/appointments/hooks/useGetServices'
import { Service } from '@/features/appointments/types'
import {
  useGetCategories,
  useGetProductTags,
  useGetUnits,
} from '@/features/products/hooks/useGetAuxiliaryData'
import { createColumns, globalFilterFn } from './components/services-columns'
import { ServicesDialogs } from './components/services-dialogs'
import { ServicesPrimaryButtons } from './components/services-primary-buttons'
import {
  DataTableFacetedFilter,
  generateCategoryOptions,
  generateServiceStatusOptions,
  generateTagOptions,
  generateUnitOptions,
} from './components/services-table-filters'
import ServicesProvider from './context/services-context'
import {
  calculateServiceStats,
  formatCurrency,
  formatDuration,
} from './utils/serviceUtils'

function ServicesContent() {
  const { data: services = [], isLoading: isServicesLoading } = useGetServices()
  const { data: unitsData, isLoading: isLoadingUnits } = useGetUnits()
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategories()
  const { data: tagsData, isLoading: isLoadingTags } = useGetProductTags()

  const isLoading =
    isServicesLoading || isLoadingUnits || isLoadingCategories || isLoadingTags

  // Create table columns using useMemo
  const columns = useMemo(() => {
    if (!unitsData || !categoriesData || !tagsData) return []
    return createColumns(unitsData, categoriesData, tagsData)
  }, [unitsData, categoriesData, tagsData])

  // Generate filter options
  const statusOptions = useMemo(() => generateServiceStatusOptions(), [])
  const categoryOptions = useMemo(
    () => generateCategoryOptions(categoriesData || []),
    [categoriesData]
  )
  const tagOptions = useMemo(
    () => generateTagOptions(tagsData || []),
    [tagsData]
  )
  const unitOptions = useMemo(
    () => generateUnitOptions(unitsData || []),
    [unitsData]
  )

  // Get services array
  const servicesArray = services

  // Calculate statistics
  const stats = calculateServiceStats(servicesArray)

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <Main>
      <section className='p-2'>
        <div className='mb-2 w-full flex sm:items-center flex-col sm:flex-row sm:justify-between'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2 items-center'>
              <SidebarTrigger variant='outline' className='sm:hidden' />
              <Separator orientation='vertical' className='h-7 sm:hidden' />
              <h1 className='text-2xl font-bold'>Servicios</h1>
            </div>
            <p className='text-muted-foreground self-start mb-2 sm:mb-0'>
              Gestiona los servicios para agendar citas aquí.
            </p>
          </div>

          <ServicesPrimaryButtons />
        </div>

        {/* Statistics */}
        <div className='grid gap-4 md:grid-cols-3 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total de servicios
              </CardTitle>
              <Briefcase className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.total}</div>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <TrendingUp className='h-3 w-3 text-green-500' />
                <span className='text-green-500'>{stats.active} activos</span>
                {stats.inactive > 0 && (
                  <>
                    <span>•</span>
                    <span className='text-red-500'>
                      {stats.inactive} inactivos
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Valor total</CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatCurrency(stats.totalValue)}
              </div>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <span>Promedio: {formatCurrency(stats.averagePrice)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Duración promedio
              </CardTitle>
              <Timer className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatDuration({
                  value: Math.round(stats.averageDuration),
                  unit: 'minutes',
                })}
              </div>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <span>
                  Rango: {Math.round(stats.durationRange.min)}-
                  {Math.round(stats.durationRange.max)} min
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Table */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {servicesArray.length > 0 &&
          unitsData &&
          categoriesData &&
          tagsData ? (
            <CustomTable<Service>
              data={servicesArray}
              columns={columns}
              globalFilterFn={globalFilterFn}
              toolbar={(table) => (
                <DataTableToolbar
                  table={table}
                  searchPlaceholder='Buscar por nombre, descripción o SKU...'
                >
                  <DataTableFacetedFilter
                    column={table.getColumn('status')}
                    title='Estado'
                    options={statusOptions}
                  />
                  <DataTableFacetedFilter
                    column={table.getColumn('categoryIds')}
                    title='Categorías'
                    options={categoryOptions}
                  />
                  <DataTableFacetedFilter
                    column={table.getColumn('tagIds')}
                    title='Etiquetas'
                    options={tagOptions}
                  />
                  <DataTableFacetedFilter
                    column={table.getColumn('unitId')}
                    title='Unidades'
                    options={unitOptions}
                  />
                </DataTableToolbar>
              )}
            />
          ) : (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
                <Briefcase className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>No hay servicios</h3>
                <p className='text-muted-foreground mb-6 max-w-md'>
                  Comienza creando tu primer servicio para ofrecer a tus
                  clientes.
                </p>
                <ServicesPrimaryButtons />
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <ServicesDialogs />
    </Main>
  )
}

export default function Services() {
  return (
    <ServicesProvider>
      <ServicesContent />
    </ServicesProvider>
  )
}
