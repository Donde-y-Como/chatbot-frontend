import { useMemo } from 'react'
import { AlertTriangle, Package, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { TableSkeleton } from '@/components/TableSkeleton'
import { Main } from '@/components/layout/main'
import { CustomTable } from '@/components/tables/custom-table'
import { DataTableToolbar } from '@/components/tables/data-table-toolbar.tsx'
import { BundleDialogs } from './components/bundle-dialogs'
import { BundlePrimaryButtons } from './components/bundle-primary-buttons'
import { createBundleColumns } from './components/bundles-columns'
import { BundleProvider } from './context/bundles-context'
import { useGetBundles } from './hooks/useGetBundles'
import { Bundle } from './types'
import { calculateBundleStats } from './utils/bundleUtils'
import { DataTableFacetedFilter, generateStatusOptions, generateTagOptions } from './components/bundles-table-filters'
import { useGetProductTags } from '@/features/products/hooks/useGetAuxiliaryData'

function BundlesContent() {
  const { data: bundlesData, isLoading: isLoadingBundles } = useGetBundles()
  const { data: tagsData, isLoading: isLoadingTags } = useGetProductTags()

  const isLoading = isLoadingBundles || isLoadingTags

  // Crear columnas de la tabla usando useMemo
  const columns = useMemo(() => {
    return createBundleColumns(tagsData || [])
  }, [tagsData])

  // Generate filter options
  const statusOptions = useMemo(() => generateStatusOptions(), [])
  const tagOptions = useMemo(() => generateTagOptions(tagsData || []), [tagsData])

  // Obtener bundles de la respuesta
  const bundles = bundlesData || []

  // Calcular estadísticas
  const stats = calculateBundleStats(bundles)

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
              <h1 className='text-2xl font-bold'>Paquetes</h1>
            </div>
            <p className='text-muted-foreground self-start mb-2 sm:mb-0'>
              Gestiona tus paquetes de productos y servicios.
            </p>
          </div>

          <BundlePrimaryButtons />
        </div>

        {/* Estadísticas */}
        <div className='grid gap-4 md:grid-cols-2 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total de paquetes
              </CardTitle>
              <Package className='h-4 w-4 text-muted-foreground' />
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
              <CardTitle className='text-sm font-medium'>
                Alertas de stock
              </CardTitle>
              <AlertTriangle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {stats.outOfStock}
              </div>
              <div className='flex items-center gap-1 text-xs'>
                <span className='text-red-600'>Sin stock</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de paquetes */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {bundles.length > 0 && tagsData ? (
            <CustomTable<Bundle>
              data={bundles}
              columns={columns}
              toolbar={(table) => (
                <DataTableToolbar
                  table={table}
                  searchPlaceholder='Buscar paquetes por nombre, SKU o descripción...'
                >
                  <DataTableFacetedFilter
                    column={table.getColumn('status')}
                    title="Estado"
                    options={statusOptions}
                  />
                  <DataTableFacetedFilter
                    column={table.getColumn('tagIds')}
                    title="Etiquetas"
                    options={tagOptions}
                  />
                </DataTableToolbar>
              )}
            />
          ) : (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
                <Package className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>No hay paquetes</h3>
                <p className='text-muted-foreground mb-6 max-w-md'>
                  Comienza creando tu primer paquete para agrupar productos y servicios.
                </p>
                <BundlePrimaryButtons />
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <BundleDialogs />
    </Main>
  )
}

export default function Bundles() {
  return (
    <BundleProvider>
      <BundlesContent />
    </BundleProvider>
  )
}
