import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator.tsx'
import { SidebarTrigger } from '@/components/ui/sidebar.tsx'
import { TableSkeleton } from '@/components/TableSkeleton.tsx'
import { Main } from '@/components/layout/main'
import { CustomTable } from '@/components/tables/custom-table.tsx'
import { DataTableToolbar } from '@/components/tables/data-table-toolbar.tsx'
import { createColumns, globalFilterFn } from './components/orders-columns'
import { OrdersFiltersComponent } from './components/orders-filters'
import { OrdersStats } from './components/orders-stats'
import { OrderPaymentModal } from './components/order-payment-modal'
import { OrderDeleteDialog } from './components/order-delete-dialog'
import { OrderEditDialog } from './components/order-edit-dialog'
import { useGetOrdersForStats, useGetOrdersFiltered, useDeleteOrder } from './hooks'
import { useAddPaymentToOrder } from '@/features/store/hooks/usePaymentMutations'
import { OrderWithDetails, PaymentMethod } from '@/features/store/types'
import { OrdersFilters } from './types'

export default function Orders() {
  const [filters, setFilters] = useState<OrdersFilters>({})
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderWithDetails | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToEdit, setOrderToEdit] = useState<OrderWithDetails | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  // Separate queries for stats and filtered data
  const { data: statsResponse, isLoading: isStatsLoading, error: statsError } = useGetOrdersForStats()
  const { data: filteredResponse, isLoading: isTableLoading, error: tableError, refetch } = useGetOrdersFiltered(filters)
  const addPaymentMutation = useAddPaymentToOrder()

  // Use filtered data if available, otherwise use stats data
  const hasFilters = Object.keys(filters).length > 0
  const ordersResponse = hasFilters ? filteredResponse : statsResponse
  const orders = ordersResponse?.data || []
  const isLoading = hasFilters ? isTableLoading : isStatsLoading
  const error = hasFilters ? tableError : statsError
  
  // Stats always use unfiltered data
  const statsOrders = statsResponse?.data || []

  const handlePayment = (order: OrderWithDetails) => {
    setSelectedOrder(order)
    setIsPaymentModalOpen(true)
  }

  const handleEdit = (order: OrderWithDetails) => {
    setOrderToEdit(order)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (order: OrderWithDetails) => {
    setOrderToDelete(order)
    setIsDeleteDialogOpen(true)
  }

  const handleProcessPayment = async (data: {
    orderId: string
    amountToPay: number
    cashReceived: number
    changeAmount: number
    paymentMethod: PaymentMethod
  }) => {
    try {
      await addPaymentMutation.mutateAsync({
        orderId: data.orderId,
        paymentMethod: data.paymentMethod,
        amount: { 
          amount: data.amountToPay, 
          currency: selectedOrder?.totalAmount.currency || 'MXN' 
        },
        cashReceived: data.cashReceived,
        changeAmount: data.changeAmount,
      })
      
      // Refresh the orders list
      await refetch()
      // Close modal
      setIsPaymentModalOpen(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('No se pudo registrar el pago. Intenta nuevamente.')
    }
  }

  const columns = useMemo(() => createColumns(handlePayment, handleEdit, handleDelete), [])

  const handleFiltersChange = (newFilters: OrdersFilters) => {
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
                Error al cargar las órdenes
              </h2>
              <p className='text-muted-foreground'>
                No se pudieron cargar las órdenes. Por favor, intenta nuevamente.
              </p>
            </div>
          </div>
        </section>
      </Main>
    )
  }

  return (
    <Main>
      <section className='p-2'>
        {/* Header */}
        <div className='mb-2 w-full flex sm:items-center flex-col sm:flex-row sm:justify-between'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2 items-center'>
              <SidebarTrigger variant='outline' className='sm:hidden' />
              <Separator orientation='vertical' className='h-7 sm:hidden' />
              <h1 className='text-2xl font-bold'>Historial de Órdenes</h1>
            </div>
            <p className='text-muted-foreground self-start mb-2 sm:mb-0'>
              Consulta el historial completo de órdenes de tu negocio.
            </p>
          </div>
          <div className='flex gap-2'>
            <OrdersFiltersComponent
              onFiltersChange={handleFiltersChange}
              currentFilters={filters}
            />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mb-6">
          {isStatsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({length: 4}).map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : (
            <OrdersStats orders={statsOrders} />
          )}
        </div>

        {/* Tabla de Órdenes */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {isLoading ? (
            <TableSkeleton />
          ) : orders.length > 0 ? (
            <CustomTable<OrderWithDetails>
              data={orders}
              columns={columns}
              globalFilterFn={globalFilterFn}
              toolbar={(table) => (
                <DataTableToolbar
                  table={table}
                  searchPlaceholder='Buscar por ID de orden, cliente o notas...'
                />
              )}
            />
          ) : (
            <div className='flex items-center justify-center h-32 border border-dashed rounded-lg'>
              <div className='text-center'>
                <p className='text-muted-foreground mb-2'>
                  No se encontraron órdenes
                </p>
                <p className='text-sm text-muted-foreground'>
                  {Object.keys(filters).length > 0
                    ? 'Intenta ajustar los filtros para ver más resultados'
                    : 'Aún no se han registrado órdenes'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {ordersResponse && (
          <div className='flex justify-between items-center text-sm text-muted-foreground'>
            <span>
              Mostrando {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}
              {ordersResponse.count !== orders.length &&
                ` de ${ordersResponse.count} total`}
            </span>
            {filters.limit && orders.length === filters.limit && (
              <span className='text-xs bg-muted px-2 py-1 rounded'>
                Límite de {filters.limit} resultados alcanzado
              </span>
            )}
          </div>
        )}

        {/* Payment Modal */}
        {selectedOrder && (
          <OrderPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false)
              setSelectedOrder(null)
            }}
            order={selectedOrder}
            onProcessPayment={handleProcessPayment}
          />
        )}

        {/* Edit Order Dialog */}
        {orderToEdit && (
          <OrderEditDialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              setIsEditDialogOpen(open)
              if (!open) {
                setOrderToEdit(null)
              }
            }}
            currentRow={orderToEdit}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {orderToDelete && (
          <OrderDeleteDialog
            open={isDeleteDialogOpen}
            onOpenChange={(open) => {
              setIsDeleteDialogOpen(open)
              if (!open) {
                setOrderToDelete(null)
              }
            }}
            currentRow={orderToDelete}
          />
        )}
      </section>
    </Main>
  )
}