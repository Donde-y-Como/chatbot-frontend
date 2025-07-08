import { useState, useCallback, useMemo, useEffect } from 'react'
import { CartState, POSItem, POSPrice } from '../types'
import { POSApiService } from '../services/POSApiService'
import { toast } from 'sonner'

// Hook para detectar si estamos en desktop
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false)
  
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024) // lg breakpoint de Tailwind
    }
    
    checkIsDesktop()
    window.addEventListener('resize', checkIsDesktop)
    
    return () => window.removeEventListener('resize', checkIsDesktop)
  }, [])
  
  return isDesktop
}

const transformBackendItemToPOSItem = (backendItem: any, itemName?: string): POSItem => {
  let frontendType: 'PRODUCTOS' | 'SERVICIOS' | 'EVENTOS' | 'PAQUETES'
  const itemType = backendItem.itemType || backendItem.type
  
  switch (itemType) {
    case 'product':
      frontendType = 'PRODUCTOS'
      break
    case 'service':
      frontendType = 'SERVICIOS'
      break
    case 'event':
      frontendType = 'EVENTOS'
      break
    case 'bundle':
      frontendType = 'PAQUETES'
      break
    default:
      frontendType = 'PRODUCTOS'
  }
  
  // Si existe modifiedPrice, usar ese como precio mostrado, sino usar unitPrice
  const displayPrice = backendItem.modifiedPrice || backendItem.unitPrice || backendItem.price || { amount: 0, currency: 'MXN' }
  
  return {
    id: backendItem.itemId || backendItem.id,
    type: frontendType,
    name: itemName || backendItem.name || backendItem.itemName || 'Cargando...',
    price: displayPrice,
    unitPrice: backendItem.unitPrice, // Precio original
    finalPrice: backendItem.finalPrice, // Precio final calculado
    modifiedPrice: backendItem.modifiedPrice, // Precio modificado manualmente (solo si existe)
    image: backendItem.image || backendItem.imageUrl,
    quantity: backendItem.quantity || 1,
    originalData: backendItem.originalData || backendItem
  }
}

const getDefaultCartState = (isDesktop: boolean): CartState => ({
  isOpen: isDesktop, // Abierto por defecto en desktop
  items: [],
  selectedClientId: '',
  subtotal: { amount: 0, currency: 'MXN' },
  taxes: { amount: 0, currency: 'MXN' },
  total: { amount: 0, currency: 'MXN' }
})

// Configuración de impuestos - puede ser configurable por negocio
const TAX_RATE = 0.16 // 16%

export function usePOSCart() {
  const isDesktop = useIsDesktop()
  const [cart, setCart] = useState<CartState>(() => getDefaultCartState(isDesktop))
  const [isLoading, setIsLoading] = useState(false)
  
  // Actualizar estado del carrito cuando cambie el tamaño de pantalla
  useEffect(() => {
    setCart(prev => ({
      ...prev,
      isOpen: isDesktop || prev.isOpen // En desktop siempre abierto, en móvil conservar estado
    }))
  }, [isDesktop])

  const initializePOS = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await POSApiService.posInitialize()
      
      if (response.data && response.data.cart) {
        const cartData = response.data.cart
        
        const itemsWithoutNames = (cartData.items || []).map(item => transformBackendItemToPOSItem(item))
        
        setCart(prev => ({
          ...prev,
          items: itemsWithoutNames,
          selectedClientId: cartData.selectedClientId || '',
          subtotal: cartData.subtotal || cartData.totalAmount || { amount: 0, currency: 'MXN' },
          taxes: cartData.taxes || { amount: 0, currency: 'MXN' },
          total: cartData.total || cartData.totalAmount || { amount: 0, currency: 'MXN' }
        }))
        
        if (cartData.items && cartData.items.length > 0) {
          const itemsForNames = cartData.items.map((item: any) => ({
            itemId: item.itemId || item.id,
            itemType: item.itemType || item.type || 'product'
          }))
          
          
          const nameMap = await POSApiService.getMultipleItemNames(itemsForNames)
          
          const itemsWithNames = cartData.items.map((item: any) => {
            const itemId = item.itemId || item.id
            const itemName = nameMap[itemId]
            return transformBackendItemToPOSItem(item, itemName)
          })
                    
          setCart(prev => ({
            ...prev,
            items: itemsWithNames
          }))
        }
      }
    } catch (error) {
      console.error('Error inicializando POS:', error)
      toast.error('Error al inicializar el sistema POS')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshCart = useCallback(async () => {
    try {
      const cartData = await POSApiService.getCart()
      
      const data = cartData.data || cartData
      
      const itemsWithoutNames = (data.items || []).map(item => transformBackendItemToPOSItem(item))
      
      setCart(prev => ({
        ...prev,
        items: itemsWithoutNames,
        selectedClientId: data.selectedClientId || '',
        subtotal: data.subtotal || data.totalAmount || { amount: 0, currency: 'MXN' },
        taxes: data.taxes || { amount: 0, currency: 'MXN' },
        total: data.total || data.totalAmount || { amount: 0, currency: 'MXN' }
      }))
      
      if (data.items && data.items.length > 0) {
        const itemsForNames = data.items.map((item: any) => ({
          itemId: item.itemId || item.id,
          itemType: item.itemType || item.type || 'product'
        }))
        
        
        const nameMap = await POSApiService.getMultipleItemNames(itemsForNames)
        
        const itemsWithNames = data.items.map((item: any) => {
          const itemId = item.itemId || item.id
          const itemName = nameMap[itemId]
          return transformBackendItemToPOSItem(item, itemName)
        })
        
        
        setCart(prev => ({
          ...prev,
          items: itemsWithNames
        }))
      }
      
    } catch (error) {
      console.error('Error refrescando carrito:', error)
    }
  }, [])

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

  const addToCart = useCallback(async (item: Omit<POSItem, 'quantity'> & { quantity?: number }, reservationId?: string) => {
    if (item.originalData && 'status' in item.originalData && item.originalData.status === 'INACTIVO') {
      toast.error('No se pueden agregar productos inactivos al carrito')
      return
    }

    try {
      let itemType: 'product' | 'service' | 'event' | 'bundle'
      switch (item.type) {
        case 'PRODUCTOS':
          itemType = 'product'
          break
        case 'SERVICIOS':
          itemType = 'service'
          break
        case 'EVENTOS':
          itemType = 'event'
          break
        case 'PAQUETES':
          itemType = 'bundle'
          break
        default:
          throw new Error('Tipo de item no válido')
      }

      if (item.type === 'PAQUETES') {
        console.log('Bundle data:', {
          item,
          originalData: item.originalData,
          id: item.id,
          itemType
        })
      }

      const cartItemData = {
        itemId: item.id,
        itemType,
        quantity: item.quantity || 1,
        notes: undefined,
        reservationId
      }
      

      await POSApiService.addToCart(cartItemData)

      await refreshCart()
      toast.success(`${item.name} agregado al carrito (${cartItemData.quantity})`)
    } catch (error) {
      console.error('Error agregando al carrito:', error)
      toast.error('Error al agregar item al carrito')
    }
  }, [refreshCart])

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      const item = cart.items.find(i => i.id === itemId)
      if (!item) return

      let itemType: string
      switch (item.type) {
        case 'PRODUCTOS':
          itemType = 'product'
          break
        case 'SERVICIOS':
          itemType = 'service'
          break
        case 'EVENTOS':
          itemType = 'event'
          break
        case 'PAQUETES':
          itemType = 'bundle'
          break
        default:
          itemType = 'product'
      }

      await POSApiService.removeFromCart(itemId, itemType)
      
      await refreshCart()
      toast.success(`${item.name} removido del carrito`)
    } catch (error) {
      console.error('Error removiendo del carrito:', error)
      toast.error('Error al remover item del carrito')
    }
  }, [cart.items, refreshCart])

  const updateCartQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }
    
    try {
      const item = cart.items.find(i => i.id === itemId)
      if (!item) return

      let itemType: 'product' | 'service' | 'event' | 'bundle'
      switch (item.type) {
        case 'PRODUCTOS':
          itemType = 'product'
          break
        case 'SERVICIOS':
          itemType = 'service'
          break
        case 'EVENTOS':
          itemType = 'event'
          break
        case 'PAQUETES':
          itemType = 'bundle'
          break
        default:
          throw new Error('Tipo de item no válido')
      }

      await POSApiService.updateCartQuantity(itemId, {
        itemType,
        quantity
      })

      await refreshCart()
    } catch (error) {
      console.error('Error actualizando cantidad:', error)
      toast.error('Error al actualizar cantidad')
    }
  }, [cart.items, removeFromCart, refreshCart])

  const updateCartPrice = useCallback(async (itemId: string, newPrice: { amount: number; currency: string }) => {
    try {
      const item = cart.items.find(i => i.id === itemId)
      if (!item) return

      let itemType: 'product' | 'service' | 'event' | 'bundle'
      switch (item.type) {
        case 'PRODUCTOS':
          itemType = 'product'
          break
        case 'SERVICIOS':
          itemType = 'service'
          break
        case 'EVENTOS':
          itemType = 'event'
          break
        case 'PAQUETES':
          itemType = 'bundle'
          break
        default:
          throw new Error('Tipo de item no válido')
      }

      await POSApiService.updateCartPrice(itemId, {
        itemType,
        newPrice
      })

      await refreshCart()
      toast.success('Precio actualizado')
    } catch (error) {
      console.error('Error actualizando precio:', error)
      toast.error('Error al actualizar precio')
    }
  }, [cart.items, refreshCart])

  const clearCart = useCallback(async () => {
    try {
      await POSApiService.clearCart()
      setCart(getDefaultCartState(isDesktop))
      toast.success('Carrito limpiado')
    } catch (error) {
      console.error('Error limpiando carrito:', error)
      toast.error('Error al limpiar carrito')
    }
  }, [isDesktop])

  // Toggle carrito abierto/cerrado (solo en móvil)
  const toggleCart = useCallback(() => {
    if (!isDesktop) {
      setCart(prev => ({ ...prev, isOpen: !prev.isOpen }))
    }
  }, [isDesktop])

  // Abrir carrito
  const openCart = useCallback(() => {
    setCart(prev => ({ ...prev, isOpen: true }))
  }, [])

  // Cerrar carrito (solo en móvil)
  const closeCart = useCallback(() => {
    if (!isDesktop) {
      setCart(prev => ({ ...prev, isOpen: false }))
    }
  }, [isDesktop])

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
    cart,
    totalItems,
    isReadyToProcess,
    isLoading,
    
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartPrice,
    clearCart,
    
    toggleCart,
    openCart,
    closeCart,
    
    setSelectedClient,
    
    initializePOS,
    refreshCart,
    
    formatPrice
  }
}