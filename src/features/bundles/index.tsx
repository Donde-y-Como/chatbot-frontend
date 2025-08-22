import { useMemo } from 'react'
import { AlertTriangle, Package, TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { TableSkeleton } from '@/components/TableSkeleton'
import { Main } from '@/components/layout/main'
import { CustomTable } from '@/components/tables/custom-table'
import { DataTableToolbar } from '@/components/tables/data-table-toolbar.tsx'
import { BundleDialogs } from './components/bundle-dialogs'
import { BundlePrimaryButtons } from './components/bundle-primary-buttons'
import { createBundleColumns, globalFilterFn } from './components/bundles-columns'
import { BundleProvider } from './context/bundles-context'
import { useGetBundles } from './hooks/useGetBundles'
import { Bundle } from './types'
import { calculateBundleStats, formatBundlePrice } from './utils/bundleUtils'
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
              <SidebarTrigger variant='outline' className='' />
              <Separator orientation='vertical' className='h-7 ' />
              <h1 className='text-2xl font-bold'>Paquetes</h1>
            </div>
            <p className='text-muted-foreground self-start mb-2 sm:mb-0'>
              Gestiona tus paquetes de productos y servicios.
            </p>
          </div>

          <BundlePrimaryButtons />
        </div>

        {/* Estadísticas Profesionales */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6'>
          {/* Total de paquetes */}
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
                <span>•</span>
                <span>{stats.activePercentage.toFixed(1)}% disponibles</span>
              </div>
            </CardContent>
          </Card>

          {/* Ingresos totales */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Valor del catálogo
              </CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatBundlePrice(stats.totalRevenue)}
              </div>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <span>Promedio: {formatBundlePrice(stats.averagePrice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Margen de ganancia */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Margen de ganancia
              </CardTitle>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {stats.profitMargin.toFixed(1)}%
              </div>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <span>Ganancia: {formatBundlePrice(stats.totalProfit)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Composición de paquetes */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Composición
              </CardTitle>
              <PieChart className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats.averageItemsPerBundle.toFixed(1)}
              </div>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <span>items promedio por paquete</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segunda fila de estadísticas */}
        <div className='grid gap-4 md:grid-cols-3 mb-6'>
          {/* Estado de disponibilidad */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Estado
              </CardTitle>
              <AlertTriangle className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {stats.outOfStock > 0 && (
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-red-600'>No disponibles</span>
                    <span className='font-medium text-red-600'>{stats.outOfStock}</span>
                  </div>
                )}
                {stats.inactive > 0 && (
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-orange-600'>Inactivos</span>
                    <span className='font-medium text-orange-600'>{stats.inactive}</span>
                  </div>
                )}
                {stats.outOfStock === 0 && stats.inactive === 0 && (
                  <div className='text-sm text-green-600 font-medium'>
                    ✓ Todos disponibles
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Distribución de contenido */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Distribución
              </CardTitle>
              <Package className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Servicios</span>
                  <span className='font-medium'>{stats.serviceItems}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Productos</span>
                  <span className='font-medium'>{stats.productItems}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rendimiento */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Rendimiento
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Rentables</span>
                  <span className='font-medium text-green-600'>{stats.profitableBundles}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Alto valor</span>
                  <span className='font-medium'>{stats.highValueBundles}</span>
                </div>
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
              globalFilterFn={globalFilterFn}
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
