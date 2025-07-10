import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Cart } from '@/features/store/components/Cart.tsx'
import { CheckoutModal } from '@/features/store/components/CheckoutModal.tsx'
import { ItemGrid } from '@/features/store/components/ItemGrid.tsx'
import { POSError } from '@/features/store/components/POSError.tsx'
import { POSLoading } from '@/features/store/components/POSLoading.tsx'
import { SelectEventDateDialog } from '@/features/store/components/SelectEventDateDialog.tsx'
import { CartItemRequest, PaymentMethod } from '@/features/store/types.ts'
import { AdvancedFilters } from './components/AdvancedFilters'
import { StoreHeader } from './components/StoreHeader'
import { StoreLayout } from './components/StoreLayout'
import { useCart } from './hooks/useCart'
import { usePOS } from './hooks/usePOS'
import {
  useAddPaymentToOrder,
  useConvertToOrder,
  useConvertToSale,
} from './hooks/usePaymentMutations'

export default function Store() {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<CartItemRequest | null>(null)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)

  // Hook principal del POS
  const {
    // Datos
    auxiliaryData,

    // Estados
    isLoading,
    error,

    // Filtros
    filters,
    filteredItems,
    filterStats,
    updateFilters,
    resetFilters,
    setCategory,
    setSearch,

    // Acciones
    refetchAll,
  } = usePOS()

  // Hook del carrito independiente
  const cart = useCart()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')

  // Payment mutations
  const convertToSaleMutation = useConvertToSale()
  const convertToOrderMutation = useConvertToOrder()
  const addPaymentToOrderMutation = useAddPaymentToOrder()

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
  if (isLoading || !auxiliaryData) {
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

  const handleAddToCart = async (item: CartItemRequest) => {
    if (item.itemType === 'event') {
      setCurrentItem(item)
      return
    }

    await cart.addToCart(item)
  }

  const handleDateSelected = async (item: CartItemRequest) => {
    await cart.addToCart(item)
  }

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleConvertCart = async () => {
    setIsCheckoutModalOpen(true)
  }

  const handleProcessSale = async (paymentData: {
    amountToPay: number
    cashReceived: number
    changeAmount: number
    remainingBalance: number
    isPartialPayment: boolean
  }) => {
    const { amountToPay, cashReceived, changeAmount } = paymentData

    try {
      // Case 1: User is paying 0 (not paying) -> convert to order
      if (amountToPay === 0) {
        await convertToOrderMutation.mutateAsync({
          cart: cart.cart,
          paymentMethod,
        })
        return
      }

      // Case 2: User is paying the total amount -> convert to sale
      if (amountToPay === cart.cart.total.amount) {
        await convertToSaleMutation.mutateAsync({
          cart: cart.cart,
          paymentMethod,
          amountToPay,
          cashReceived,
          changeAmount,
        })
        return
      }

      // Case 3: User is paying partial amount (>0 and < total) -> convert to order first, then add payment
      if (amountToPay > 0 && amountToPay < cart.cart.total.amount) {
        // First convert cart to order
        const orderResult = await convertToOrderMutation.mutateAsync({
          cart: cart.cart,
          paymentMethod,
        })

        // Then add payment to the order
        if (orderResult.id) {
          await addPaymentToOrderMutation.mutateAsync({
            orderId: orderResult.id,
            paymentMethod,
            amount: { amount: amountToPay, currency: cart.cart.total.currency },
            cashReceived,
            changeAmount,
          })
        }

        cart.setSelectedClient('')
        return
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo procesar la venta'
      )
    }
  }

  return (
    <StoreLayout
      isMobileMenuOpen={isMobileMenuOpen}
      onCloseMobileMenu={handleCloseMobileMenu}
    >
      {/* Área principal */}
      <div className='flex-1 flex flex-col lg:mr-[35%] lg:max-w-[calc(100%-35%)] xl:mr-[30%] xl:max-w-[calc(100%-30%)] relative'>
        <StoreHeader
          filters={filters}
          filterStats={filterStats}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={handleToggleMobileMenu}
          onFilterButtonClick={handleFilterButtonClick}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />

        <div className='flex-1 pb-20 lg:pb-4 overflow-auto'>
          <ItemGrid
            items={filteredItems}
            onAddToCart={handleAddToCart}
            onDecreaseQuantity={cart.decreaseQuantity}
          />
        </div>
      </div>

      {/* Carrito lateral */}
      {cart.isLoading ? (
        <>Cargando</>
      ) : (
        <Cart
          cart={cart.cart}
          onToggle={cart.toggleCart}
          onRemoveItem={cart.removeFromCart}
          onUpdateQuantity={cart.updateCartQuantity}
          onUpdatePrice={cart.updateCartPrice}
          onClientSelect={cart.setSelectedClient}
          onPaymentMethodSelect={setPaymentMethod}
          onClearCart={cart.clearCart}
          onConvertCart={handleConvertCart}
        />
      )}

      {currentItem && (
        <SelectEventDateDialog
          item={currentItem}
          onSubmit={handleDateSelected}
          onClose={() => setCurrentItem(null)}
        />
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart.cart}
        paymentMethod={paymentMethod}
        onProcessSale={handleProcessSale}
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
    </StoreLayout>
  )
}
