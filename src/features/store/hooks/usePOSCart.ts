import { useState, useCallback, useMemo } from 'react'
import { CartState, POSItem, POSPrice } from '../types'

const DEFAULT_CART_STATE: CartState = {
  isOpen: false,
  items: [],
  selectedClientId: '',
  subtotal: { amount: 0, currency: 'MXN' },
  taxes: { amount: 0, currency: 'MXN' },
  total: { amount: 0, currency: 'MXN' }
}

// Configuración de impuestos - puede ser configurable por negocio
const TAX_RATE = 0.16 // 16%

export function usePOSCart() {
  const [cart, setCart] = useState<CartState>(DEFAULT_CART_STATE)

  // Calcular totales
  const calculateTotals = useCallback((items: POSItem[]): Omit<CartState, 'isOpen' | 'items' | 'selectedClientId'> => {
    const subtotalAmount = items.reduce((sum, item) => 
      sum + (item.price.amount * item.quantity), 0
    )
    
    const taxesAmount = subtotalAmount * TAX_RATE
    const totalAmount = subtotalAmount + taxesAmount

    return {
      subtotal: { amount: subtotalAmount, currency: 'MXN' },
      taxes: { amount: taxesAmount, currency: 'MXN' },
      total: { amount: totalAmount, currency: 'MXN' }
    }
  }, [])

  // Agregar item al carrito
  const addToCart = useCallback((item: Omit<POSItem, 'quantity'>) => {
    setCart(prev => {
      const existingItemIndex = prev.items.findIndex(cartItem => cartItem.id === item.id)
      
      let newItems: POSItem[]
      if (existingItemIndex >= 0) {
        // Si el item ya existe, incrementar cantidad
        newItems = prev.items.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        // Si es un item nuevo, agregarlo con cantidad 1
        newItems = [...prev.items, { ...item, quantity: 1 }]
      }
      
      const totals = calculateTotals(newItems)
      
      return {
        ...prev,
        items: newItems,
        ...totals
      }
    })
  }, [calculateTotals])

  // Remover item del carrito
  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item.id !== itemId)
      const totals = calculateTotals(newItems)
      
      return {
        ...prev,
        items: newItems,
        ...totals
      }
    })
  }, [calculateTotals])

  // Actualizar cantidad de un item
  const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    setCart(prev => {
      const newItems = prev.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
      
      const totals = calculateTotals(newItems)
      
      return {
        ...prev,
        items: newItems,
        ...totals
      }
    })
  }, [calculateTotals, removeFromCart])

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setCart(DEFAULT_CART_STATE)
  }, [])

  // Toggle carrito abierto/cerrado
  const toggleCart = useCallback(() => {
    setCart(prev => ({ ...prev, isOpen: !prev.isOpen }))
  }, [])

  // Abrir carrito
  const openCart = useCallback(() => {
    setCart(prev => ({ ...prev, isOpen: true }))
  }, [])

  // Cerrar carrito
  const closeCart = useCallback(() => {
    setCart(prev => ({ ...prev, isOpen: false }))
  }, [])

  // Seleccionar cliente
  const setSelectedClient = useCallback((clientId: string) => {
    setCart(prev => ({ ...prev, selectedClientId: clientId }))
  }, [])

  // Obtener cantidad total de items
  const totalItems = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart.items])

  // Verificar si el carrito está listo para procesar
  const isReadyToProcess = useMemo(() => {
    return cart.items.length > 0 && cart.selectedClientId !== ''
  }, [cart.items.length, cart.selectedClientId])

  // Formatear precio
  const formatPrice = useCallback((price: POSPrice) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency
    }).format(price.amount)
  }, [])

  return {
    // Estado
    cart,
    totalItems,
    isReadyToProcess,
    
    // Acciones del carrito
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    
    // Acciones de UI
    toggleCart,
    openCart,
    closeCart,
    
    // Cliente
    setSelectedClient,
    
    // Utilidades
    formatPrice
  }
}