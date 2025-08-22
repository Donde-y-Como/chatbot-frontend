import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { Cart } from '@/features/store/components/Cart.tsx'
import { CheckoutModal } from '@/features/store/components/CheckoutModal.tsx'
import { ItemGrid } from '@/features/store/components/ItemGrid.tsx'
import { POSError } from '@/features/store/components/POSError.tsx'
import { POSLoading } from '@/features/store/components/POSLoading.tsx'
import { SelectEventDateDialog } from '@/features/store/components/SelectEventDateDialog.tsx'
import { ReceiptDialog } from '@/features/receipts/components/receipt-dialog'
import { useGetOrderReceipts } from '@/features/receipts/hooks'
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
import { SidebarTrigger } from '@/components/ui/sidebar.tsx'
import { Separator } from '@/components/ui/separator.tsx'

export default function Store() {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<CartItemRequest | null>(null)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(null)
  const [lastTransactionType, setLastTransactionType] = useState<'order' | 'sale' | null>(null)
  const [lastReceiptId, setLastReceiptId] = useState<string | null>(null)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null)

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
  const navigate = useNavigate()

  // Payment mutations
  const convertToSaleMutation = useConvertToSale()
  const convertToOrderMutation = useConvertToOrder()
  const addPaymentToOrderMutation = useAddPaymentToOrder()

  // Receipt fetching
  const { data: receiptsResponse } = useGetOrderReceipts(
    lastTransactionType === 'order' ? lastTransactionId : null
  )

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

    void cart.addToCart(item)
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

  const handleHistorialClick = () => {
    navigate({ to: '/orden/historial' })
  }

  const handleSavePendingOrder = async () => {
    try {
      const orderResult = await convertToOrderMutation.mutateAsync({
        cart: cart.cart,
        paymentMethod: 'cash', // Default payment method for pending orders
      })
      
      // Clear cart after saving pending order
      cart.setSelectedClient('')
      toast.success('Orden pendiente guardada exitosamente')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo guardar la orden pendiente'
      )
    }
  }

  const handleViewLatestReceipt = () => {
    if (lastTransactionType === 'sale' && lastReceiptId) {
      // For sales, use the superReceiptId from the sale response
      setSelectedReceiptId(lastReceiptId)
      setIsReceiptDialogOpen(true)
    } else if (lastTransactionType === 'order' && receiptsResponse?.data && receiptsResponse.data.length > 0) {
      // For orders, get the latest payment receipt
      const latestReceipt = receiptsResponse.data.sort((a, b) => 
        b.paymentData.sequence - a.paymentData.sequence
      )[0]
      setSelectedReceiptId(latestReceipt.id)
      setIsReceiptDialogOpen(true)
    }
  }

  const handleCloseReceiptDialog = () => {
    setIsReceiptDialogOpen(false)
    setSelectedReceiptId(null)
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
      let transactionId: string | undefined
      let transactionType: 'order' | 'sale' | null = null

      // Case 1: User is paying 0 (not paying) -> convert to order
      if (amountToPay === 0) {
        const orderResult = await convertToOrderMutation.mutateAsync({
          cart: cart.cart,
          paymentMethod,
        })
        transactionId = orderResult.id
        transactionType = 'order'
      }

      // Case 2: User is paying the total amount -> convert to sale
      else if (amountToPay === cart.cart.total.amount) {
        const saleResult = await convertToSaleMutation.mutateAsync({
          cart: cart.cart,
          paymentMethod,
          amountToPay,
          cashReceived,
          changeAmount,
        })
        transactionId = saleResult.id
        transactionType = 'sale'
        
        // For sales, also capture the superReceiptId for receipt viewing
        if (saleResult.superReceiptId) {
          setLastReceiptId(saleResult.superReceiptId)
        }
      }

      // Case 3: User is paying partial amount (>0 and < total) -> convert to order first, then add payment
      else if (amountToPay > 0 && amountToPay < cart.cart.total.amount) {
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
          transactionId = orderResult.id
          transactionType = 'order'
        }
      }

      // Set the transaction ID and type for receipt fetching (only if payment > 0)
      if (transactionId && amountToPay > 0) {
        setLastTransactionId(transactionId)
        setLastTransactionType(transactionType)
      }

      cart.setSelectedClient('')
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
          onHistorialClick={handleHistorialClick}
          onSavePendingOrder={handleSavePendingOrder}
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
        onViewReceipt={handleViewLatestReceipt}
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

      {/* Receipt Dialog */}
      <ReceiptDialog
        isOpen={isReceiptDialogOpen}
        onClose={handleCloseReceiptDialog}
        receiptId={selectedReceiptId}
      />
    </StoreLayout>
  )
}
