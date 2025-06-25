import React, { useState, useEffect } from 'react'
import { SearchBar } from './components/SearchBar'
import { CategoryTabs } from './components/CategoryTabs'
import { ItemGrid } from './components/ItemGrid'
import { Cart } from './components/Cart'
import { FilterButton } from './components/FilterButton'
import { AdvancedFilters } from './components/AdvancedFilters'
import { QuickAppointmentDialog } from '../appointments/components/QuickAppointmentDialog'
import { EventBookingModal } from '../events/event-booking-modal'
import { usePOS } from './hooks/usePOS'
import { Skeleton } from '../../components/ui/skeleton'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { appointmentService } from '../appointments/appointmentService'
import { EventApiService } from '../events/EventApiService'
import { useEventMutations } from '../events/hooks/useEventMutations'

// Componente de carga
function POSLoading() {
    return (
        <div className="h-screen bg-background overflow-hidden flex">
        <div className="flex-1 flex flex-col">
            {/* Header skeleton */}
            <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="flex-1 h-12" />
                <Skeleton className="h-12 w-24" />
            </div>
            <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-20" />
                ))}
            </div>
            </div>

            {/* Grid skeleton */}
            <div className="flex-1 p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
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
    <div className="h-screen bg-background flex items-center justify-center">
    <div className="max-w-md w-full mx-auto p-6">
    <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription className="mt-2">
    <div className="space-y-2">
    <p className="font-medium">Error al cargar el sistema POS</p>
    <p className="text-sm">
    {error?.message || 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.'}
    </p>
    <Button
    variant="outline"
    size="sm"
    onClick={onRetry}
    className="mt-3"
    >
    <RefreshCw className="h-4 w-4 mr-2" />
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
    refetchAll
    } = usePOS()

  const { bookEvent } = useEventMutations()

  // Inicializar POS al montar el componente
  useEffect(() => {
    cart.initializePOS()
  }, [cart.initializePOS])

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
    // Abrir carrito automáticamente si está cerrado
    // if (!cart.cart.isOpen) {
    //   cart.openCart()
    // }
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
          notes: bookingData.notes || 'Reserva desde POS'
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
    <div className="h-screen bg-background overflow-hidden flex">
      {/* Área principal */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${cart.cart.isOpen ? 'mr-[35%]' : ''}`}>
        {/* Header con búsqueda y filtros */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <SearchBar 
                value={filters.search}
                onChange={setSearch}
                placeholder="Buscar productos, servicios o eventos..."
              />
            </div>
            <FilterButton 
              isActive={filters.isActive}
              onClick={handleFilterButtonClick}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <CategoryTabs
              activeCategory={filters.category}
              onCategoryChange={setCategory}
            />
            
            {/* Estadísticas de filtros */}
            {filterStats.isFiltered && (
              <div className="text-sm text-muted-foreground">
                Mostrando {filterStats.filtered} de {filterStats.total} elementos
              </div>
            )}
          </div>
        </div>

        {/* Grid de elementos */}
        <div className="flex-1 overflow-auto">
          <ItemGrid 
            items={filteredItems}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>

      {/* Carrito lateral */}
      <Cart
        cart={cart.cart}
        onToggle={cart.toggleCart}
        onRemoveItem={cart.removeFromCart}
        onUpdateQuantity={cart.updateCartQuantity}
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
    </div>
  )
}

// Export default para usar en rutas
export default function Store() {
  return <StoreContent />
}