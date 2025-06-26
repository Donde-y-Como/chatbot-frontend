import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Minus, Package, Plus, Wrench, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useGetServices } from '@/features/appointments/hooks/useGetServices'
import { useGetProducts } from '@/features/products/hooks/useGetProducts'
import { BundleItem, CreateBundleForm, EditBundleForm } from '../../types'

export function BundleItemsForm() {
  const { control, watch, setValue } = useFormContext<
    CreateBundleForm | EditBundleForm
  >()
  const [isAddingItem, setIsAddingItem] = useState(false)

  const { data: products, isLoading: isLoadingProducts } = useGetProducts()
  const { data: services = [], isLoading: isLoadingServices } = useGetServices()

  if (!products) {
    return <> Loading ...</>
  }

  const currentItems = watch('items') || []

  const addItem = (itemId: string, itemType: 'product' | 'service') => {
    const existingItemIndex = currentItems.findIndex(
      (item) => item.itemId === itemId && item.itemType === itemType
    )

    if (existingItemIndex >= 0) {
      // If item exists, increase quantity
      const updatedItems = [...currentItems]
      updatedItems[existingItemIndex].quantity += 1
      setValue('items', updatedItems)
    } else {
      // Add new item
      const newItem: BundleItem = {
        itemId,
        itemType,
        quantity: 1,
      }
      setValue('items', [...currentItems, newItem])
    }
    setIsAddingItem(false)
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index)
      return
    }

    const updatedItems = [...currentItems]
    updatedItems[index].quantity = newQuantity
    setValue('items', updatedItems)
  }

  const removeItem = (index: number) => {
    const updatedItems = currentItems.filter((_, i) => i !== index)
    setValue('items', updatedItems)
  }

  const getItemDetails = (item: BundleItem) => {
    if (item.itemType === 'product') {
      const product = products?.products.find((p) => p.id === item.itemId)
      return {
        name: product?.name || 'Producto no encontrado',
        price: product?.price?.amount || 0,
        currency: product?.price?.currency || 'MXN',
        sku: product?.sku,
        stock: product?.stock,
      }
    } else {
      const service = services.find((s) => s.id === item.itemId)
      return {
        name: service?.name || 'Servicio no encontrado',
        price: service?.price?.amount || 0,
        currency: service?.price?.currency || 'MXN',
        duration: service?.duration,
      }
    }
  }

  const calculateTotalPrice = () => {
    return currentItems.reduce((total, item) => {
      const details = getItemDetails(item)
      return total + details.price * item.quantity
    }, 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Items del Paquete
            <span className='text-sm font-normal text-muted-foreground'>
              (Al menos 1 item requerido)
            </span>
          </div>
          <Popover open={isAddingItem} onOpenChange={setIsAddingItem}>
            <PopoverTrigger asChild>
              <Button variant='outline' size='sm'>
                <Plus className='h-4 w-4 mr-2' />
                Agregar Item
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-0' align='end'>
              <Command>
                <CommandInput placeholder='Buscar productos o servicios...' />
                <CommandList>
                  <CommandEmpty>No se encontraron elementos.</CommandEmpty>

                  {!isLoadingProducts && products.products.length > 0 && (
                    <CommandGroup heading='Productos'>
                      {products.products.map((product) => (
                        <CommandItem
                          key={`product-${product.id}`}
                          onSelect={() => addItem(product.id, 'product')}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center gap-2'>
                            <Package className='h-4 w-4 text-blue-500' />
                            <div>
                              <p className='font-medium'>{product.name}</p>
                              <p className='text-sm text-muted-foreground'>
                                SKU: {product.sku} • Stock: {product.stock}
                              </p>
                            </div>
                          </div>
                          <Badge variant='outline' className='text-blue-600'>
                            ${product.price?.amount || 0}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {!isLoadingServices && services.length > 0 && (
                    <CommandGroup heading='Servicios'>
                      {services.map((service) => (
                        <CommandItem
                          key={`service-${service.id}`}
                          onSelect={() => addItem(service.id, 'service')}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center gap-2'>
                            <Wrench className='h-4 w-4 text-green-500' />
                            <div>
                              <p className='font-medium'>{service.name}</p>
                              <p className='text-sm text-muted-foreground'>
                                Duración: {service.duration.value} min
                              </p>
                            </div>
                          </div>
                          <Badge variant='outline' className='text-green-600'>
                            ${service.price.amount || 0}{' '}
                            {service.price.currency}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <FormField
          control={control}
          name='items'
          render={() => (
            <FormItem>
              {currentItems.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <Package className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p className='text-lg font-medium mb-2'>
                    No hay items en el paquete
                  </p>
                  <p className='text-sm'>
                    Agrega al menos un producto o servicio para crear el paquete
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {currentItems.map((item, index) => {
                    const details = getItemDetails(item)
                    return (
                      <div
                        key={`${item.itemType}-${item.itemId}-${index}`}
                        className='flex items-center justify-between p-4 border rounded-lg'
                      >
                        <div className='flex items-center gap-3'>
                          {item.itemType === 'product' ? (
                            <Package className='h-5 w-5 text-blue-500' />
                          ) : (
                            <Wrench className='h-5 w-5 text-green-500' />
                          )}

                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <p className='font-medium'>{details.name}</p>
                              <Badge
                                variant='outline'
                                className={
                                  item.itemType === 'product'
                                    ? 'text-blue-600'
                                    : 'text-green-600'
                                }
                              >
                                {item.itemType === 'product'
                                  ? 'Producto'
                                  : 'Servicio'}
                              </Badge>
                            </div>
                            <div className='flex items-center gap-4 text-sm text-muted-foreground mt-1'>
                              <span>
                                ${details.price} {details.currency}
                              </span>
                              {item.itemType === 'product' && details.sku && (
                                <span>SKU: {details.sku}</span>
                              )}
                              {item.itemType === 'service' &&
                                details.duration && (
                                  <span>
                                    {details.duration.value}{' '}
                                    {details.duration.unit === 'hours'
                                      ? 'hrs'
                                      : 'min'}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center gap-3'>
                          <div className='flex items-center gap-2'>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                updateQuantity(index, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className='h-3 w-3' />
                            </Button>

                            <Input
                              type='number'
                              min='1'
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  index,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className='w-16 text-center'
                            />

                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                updateQuantity(index, item.quantity + 1)
                              }
                            >
                              <Plus className='h-3 w-3' />
                            </Button>
                          </div>

                          <div className='text-right min-w-[80px]'>
                            <p className='font-medium'>
                              ${(details.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeItem(index)}
                            className='text-destructive hover:text-destructive'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    )
                  })}

                  {currentItems.length > 0 && (
                    <>
                      <Separator />
                      <div className='flex justify-between items-center py-2 font-medium'>
                        <span>Total estimado:</span>
                        <span className='text-lg'>
                          ${calculateTotalPrice().toFixed(2)} MXN
                        </span>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        * Este es el costo estimado de los items individuales.
                        El precio final del paquete se establece en la sección de
                        precios.
                      </p>
                    </>
                  )}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
