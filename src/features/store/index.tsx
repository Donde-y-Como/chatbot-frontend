import React, { useEffect, useState } from 'react'
import { AlertTriangle, Menu, RefreshCw, X } from 'lucide-react'
import { DialogStateProvider } from '@/features/appointments/contexts/DialogStateContext.tsx'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { QuickAppointmentDialog } from '../appointments/components/QuickAppointmentDialog'
import { EventBookingModal } from '../events/event-booking-modal'
import { useEventMutations } from '../events/hooks/useEventMutations'
import { AdvancedFilters } from './components/AdvancedFilters'
import { Cart } from './components/Cart'
import { CategoryTabs } from './components/CategoryTabs'
import { FilterButton } from './components/FilterButton'
import { ItemGrid } from './components/ItemGrid'
import { SearchBar } from './components/SearchBar'
import { usePOS } from './hooks/usePOS'

// Componente de carga
function POSLoading() {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <div className='flex-1 flex flex-col'>
        {/* Header skeleton */}
        <div className='p-2 sm:p-4 border-b border-border bg-card'>
          <div className='flex flex-col space-y-3 sm:space-y-4'>
            {/* Search and filter row */}
            <div className='flex items-center gap-2 sm:gap-4'>
              <Skeleton className='flex-1 h-10 sm:h-12' />
              <Skeleton className='h-10 sm:h-12 w-16 sm:w-24' />
            </div>
            {/* Categories tabs */}
            <div className='flex gap-1 sm:gap-2 overflow-x-auto'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className='h-8 sm:h-10 w-16 sm:w-20 flex-shrink-0'
                />
              ))}
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className='flex-1 p-2 sm:p-4'>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4'>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='aspect-square w-full' />
                <Skeleton className='h-3 sm:h-4 w-full' />
                <Skeleton className='h-3 sm:h-4 w-3/4' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de error
function POSError({ error, onRetry }: { error: any; onRetry: () => void }) {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='max-w-md w-full mx-auto'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription className='mt-2'>
            <div className='space-y-2'>
              <p className='font-medium'>Error al cargar el sistema POS</p>
              <p className='text-sm'>
                {error?.message ||
                  'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.'}
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={onRetry}
                className='mt-3'
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Reintentar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

function StoreContent() {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
  const [isQuickAppointmentOpen, setIsQuickAppointmentOpen] = useState(false)
  const [isEventBookingOpen, setIsEventBookingOpen] = useState(false)
  const [pendingItemForDialog, setPendingItemForDialog] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Hook principal del POS
  const {
    // Datos
    auxiliaryData,

    // Estados
    isLoading,
    error,

    // Carrito
    cart,

    // Filtros
    filters,
    filteredItems,
    filterStats,
    updateFilters,
    resetFilters,
    setCategory,
    setSearch,
    toggleFiltersActive,

    // Acciones
    refetchAll,
  } = usePOS()

  const { bookEvent } = useEventMutations()

  // Inicializar POS al montar el componente
  useEffect(() => {
    cart.initializePOS()
  }, [cart.initializePOS])

  // Detectar scroll para cerrar menú móvil automáticamente
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobileMenuOpen])

  // Manejar carga
  if (isLoading) {
    return <POSLoading />
  }

  // Manejar error
  if (error) {
    return <POSError error={error} onRetry={refetchAll} />
  }

  // Manejar filtros avanzados
  const handleFilterButtonClick = () => {
    setIsAdvancedFiltersOpen(true)
    setIsMobileMenuOpen(false)
  }

  const handleAdvancedFiltersClose = () => {
    setIsAdvancedFiltersOpen(false)
  }

  const handleFiltersApply = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters)
  }

  const handleFiltersReset = () => {
    resetFilters()
    setIsAdvancedFiltersOpen(false)
  }

  const handleAddToCart = async (item: any) => {
    if (item.type === 'SERVICIOS') {
      setPendingItemForDialog(item)
      setIsQuickAppointmentOpen(true)
      return
    }

    if (item.type === 'EVENTOS') {
      setPendingItemForDialog(item)
      setIsEventBookingOpen(true)
      return
    }

    await cart.addToCart(item)
  }

  const handleAppointmentSuccess = async (appointmentId?: string) => {
    if (pendingItemForDialog) {
      const cartItem = {
        ...pendingItemForDialog,
        name: `Cita: ${pendingItemForDialog.name}`, // Prefijo para identificar que es una cita
      }

      await cart.addToCart(cartItem, appointmentId)
      setPendingItemForDialog(null)

      if (!cart.cart.isOpen) {
        cart.openCart()
      }
    }
  }

  const handleEventBookingSuccess = async (bookingData: any) => {
    if (pendingItemForDialog) {
      try {
        await bookEvent({
          eventId: pendingItemForDialog.id,
          clientId: bookingData.clientId,
          date: bookingData.date,
          participants: bookingData.participants,
          notes: bookingData.notes || 'Reserva desde POS',
        })

        const cartItem = {
          ...pendingItemForDialog,
          name: `Reserva: ${pendingItemForDialog.name}`,
        }

        await cart.addToCart(cartItem)
        setPendingItemForDialog(null)

        if (bookingData.clientId !== cart.cart.selectedClientId) {
          cart.setSelectedClient(bookingData.clientId)
        }

        // Abrir carrito automáticamente
        if (!cart.cart.isOpen) {
          cart.openCart()
        }

        setIsEventBookingOpen(false)
      } catch (error) {
        console.error('Error creating booking:', error)
      }
    }
  }

  const handleClientChange = (clientId: string) => {
    cart.setSelectedClient(clientId)
  }

  return (
    <div
      className='min-h-screen bg-background flex flex-col lg:flex-row'
      style={{ touchAction: 'pan-y' }}
    >
      {/* Área principal */}
      <div className='flex-1 flex flex-col lg:mr-[35%] lg:max-w-[calc(100%-35%)]'>
        {/* Header compacto para móvil */}
        <div className='border-b border-border bg-card sticky top-0 z-10 lg:static'>
          {/* Header móvil */}
          <div className='lg:hidden'>
            <div className='flex items-center justify-between p-3'>
              <h1 className='text-lg font-semibold'>Tienda</h1>
              <div className='flex items-center gap-2'>
                <FilterButton
                  isActive={filters.isActive}
                  onClick={handleFilterButtonClick}
                />
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className='h-8 w-8 p-0'
                >
                  {isMobileMenuOpen ? (
                    <X className='h-4 w-4' />
                  ) : (
                    <Menu className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>

            {/* Barra de búsqueda siempre visible en móvil */}
            <div className='px-3 pb-3'>
              <SearchBar
                value={filters.search}
                onChange={setSearch}
                placeholder='Buscar por nombre, SKU o código de barras...'
              />
            </div>

            {/* Menú desplegable móvil */}
            {isMobileMenuOpen && (
              <div className='border-t border-border bg-card/95 backdrop-blur-sm'>
                <div className='p-3'>
                  <CategoryTabs
                    activeCategory={filters.category}
                    onCategoryChange={(category) => {
                      setCategory(category)
                      setIsMobileMenuOpen(false)
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Header desktop */}
          <div className='hidden lg:block p-4'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='flex-1'>
                <SearchBar
                  value={filters.search}
                  onChange={setSearch}
                  placeholder='Buscar por nombre, SKU o código de barras...'
                />
              </div>
              <FilterButton
                isActive={filters.isActive}
                onClick={handleFilterButtonClick}
              />
            </div>

            <div className='flex items-center justify-between'>
              <CategoryTabs
                activeCategory={filters.category}
                onCategoryChange={setCategory}
              />

              {/* Estadísticas de filtros */}
              {filterStats.isFiltered && (
                <div className='text-sm text-muted-foreground'>
                  Mostrando {filterStats.filtered} de {filterStats.total}{' '}
                  elementos
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid de elementos */}
        <div className='flex-1 pb-20 lg:pb-4 lg:overflow-auto'>
          <ItemGrid 
            items={filteredItems} 
            onAddToCart={handleAddToCart}
            onRemoveFromCart={cart.removeFromCart}
          />
        </div>
      </div>

      {/* Carrito lateral */}
      <Cart
        cart={cart.cart}
        onToggle={cart.toggleCart}
        onRemoveItem={cart.removeFromCart}
        onUpdateQuantity={cart.updateCartQuantity}
        onUpdatePrice={cart.updateCartPrice}
        onClientSelect={cart.setSelectedClient}
        onClearCart={cart.clearCart}
      />

      {/* Filtros avanzados */}
      <AdvancedFilters
        isOpen={isAdvancedFiltersOpen}
        onClose={handleAdvancedFiltersClose}
        filters={filters}
        onFiltersChange={handleFiltersApply}
        onResetFilters={handleFiltersReset}
        auxiliaryData={auxiliaryData}
      />

      {/* Dialogs para citas y eventos rápidos */}
      <QuickAppointmentDialog
        open={isQuickAppointmentOpen}
        onOpenChange={(open) => {
          setIsQuickAppointmentOpen(open)
          if (!open) {
            setPendingItemForDialog(null)
          }
        }}
        onSuccess={handleAppointmentSuccess}
        initialClientId={cart.cart.selectedClientId}
        onClientChange={handleClientChange}
        initialServiceId={pendingItemForDialog?.id}
      />

      <EventBookingModal
        eventId={pendingItemForDialog?.id || ''}
        open={isEventBookingOpen}
        onClose={() => {
          setIsEventBookingOpen(false)
          setPendingItemForDialog(null)
        }}
        onSaveBooking={handleEventBookingSuccess}
        onRemoveBooking={async (bookingId: string) => {
          console.log('Remove booking:', bookingId)
        }}
        initialClientId={cart.cart.selectedClientId}
      />

      {/* Overlay para cerrar menú móvil */}
      {isMobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/20 z-15 lg:hidden'
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}

// Export default para usar en rutas
export default function Store() {
  return (
    <DialogStateProvider>
      <StoreContent />
    </DialogStateProvider>
  )
}
