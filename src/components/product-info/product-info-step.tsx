import * as React from 'react'
import { Control, useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreatableEvent } from '@/features/events/types'
import { ProductStatus } from '@/types'
import { CategorySelector } from './category-selector'
import { TagSelector } from './tag-selector'

interface ProductInfoStepProps {
  type?: 'product' | 'service' | 'event'
}

export function ProductInfoStep({ type = 'product' }: ProductInfoStepProps) {
  const { control, watch, setValue } = useFormContext<CreatableEvent>()

  // Watch para validaciones cruzadas
  const selectedCategoryIds = watch('productInfo.categoryIds')
  const selectedSubcategoryIds = watch('productInfo.subcategoryIds')

  return (
    <div className="space-y-6">
      {/* SKU y Estado */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="productInfo.sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Código del {type === 'service' ? 'servicio' : type === 'event' ? 'evento' : 'producto'})</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej: EVT-YOGA-001" 
                  {...field}
                  className="font-mono"
                />
              </FormControl>
              <FormDescription>
                Código único para identificar este {type === 'service' ? 'servicio' : type === 'event' ? 'evento' : 'producto'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="productInfo.status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado del {type === 'service' ? 'servicio' : type === 'event' ? 'evento' : 'producto'}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductStatus.ACTIVE}>
                      Activo - Disponible para venta
                    </SelectItem>
                    <SelectItem value={ProductStatus.INACTIVE}>
                      Inactivo - No disponible temporalmente
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Categorías */}
      <FormField
        control={control}
        name="productInfo.categoryIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categorías</FormLabel>
            <FormControl>
              <CategorySelector
                selectedCategoryIds={field.value}
                selectedSubcategoryIds={selectedSubcategoryIds}
                onCategoryChange={field.onChange}
                onSubcategoryChange={(subcategoryIds) => 
                  setValue('productInfo.subcategoryIds', subcategoryIds)
                }
              />
            </FormControl>
            <FormDescription>
              Selecciona las categorías que mejor describan este {type === 'service' ? 'servicio' : type === 'event' ? 'evento' : 'producto'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Etiquetas */}
      <FormField
        control={control}
        name="productInfo.tagIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Etiquetas</FormLabel>
            <FormControl>
              <TagSelector
                selectedTagIds={field.value}
                onTagChange={field.onChange}
              />
            </FormControl>
            <FormDescription>
              Etiquetas adicionales para organizar y filtrar {type === 'service' ? 'servicios' : type === 'event' ? 'eventos' : 'productos'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Descuento e Impuestos */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="productInfo.discountPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descuento (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="0"
                  {...field}
                  value={field.value === 0 ? '' : field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '') {
                      field.onChange(0)
                    } else {
                      const num = parseInt(value, 10)
                      field.onChange(isNaN(num) ? 0 : num)
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Porcentaje de descuento aplicado al precio base (solo números enteros)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="productInfo.taxPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impuesto (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  {...field}
                  value={field.value === 0 ? '' : field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '') {
                      field.onChange(0)
                    } else {
                      const num = parseInt(value, 10)
                      field.onChange(isNaN(num) ? 0 : num)
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Porcentaje de impuesto aplicado al precio (solo números enteros)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Costo del negocio */}
      <div className="space-y-4">
        <div>
          <FormLabel className="text-base font-medium">Costo del negocio</FormLabel>
          <p className="text-sm text-muted-foreground">
            Costo interno para calcular márgenes (diferente al precio de venta)
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="productInfo.cost.amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto del costo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="productInfo.cost.currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda del costo</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Notas adicionales */}
      <FormField
        control={control}
        name="productInfo.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notas adicionales</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Información adicional, restricciones, requerimientos especiales, etc."
                rows={3}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Máximo 500 caracteres
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
