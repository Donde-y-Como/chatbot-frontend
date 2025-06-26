import { useFormContext } from 'react-hook-form';
import { Calculator, Package } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductStatus } from '@/features/products/types';
import { CreateBundleForm, EditBundleForm } from '../../types';
import { TagSelector } from '@/components/forms/tag-selector';

export function BundleBasicForm() {
  const { control } = useFormContext<CreateBundleForm | EditBundleForm>();

  return (
    <div className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Información Básica
            <span className="text-sm font-normal text-muted-foreground">
              (Campos obligatorios)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: PAQ-001"
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Código único del paquete
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ProductStatus.ACTIVO}>Activo</SelectItem>
                      <SelectItem value={ProductStatus.INACTIVO}>Inactivo</SelectItem>
                      <SelectItem value={ProductStatus.SIN_STOCK}>Sin Stock</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Paquete *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Paquete Básico de Servicios" 
                    {...field} 
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Nombre descriptivo que verán los clientes
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe qué incluye este paquete y sus beneficios..."
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Información adicional sobre el paquete
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Precios y Costos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Precios y Costos
            <span className="text-sm font-normal text-muted-foreground">
              (Campos obligatorios)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Venta *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01"
                      placeholder="0.00"
                      value={field.value?.amount || ''}
                      onChange={(e) => field.onChange({
                        amount: parseFloat(e.target.value) || 0,
                        currency: field.value?.currency || 'MXN'
                      })}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Precio del paquete completo
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01"
                      placeholder="0.00"
                      value={field.value?.amount || ''}
                      onChange={(e) => field.onChange({
                        amount: parseFloat(e.target.value) || 0,
                        currency: field.value?.currency || 'MXN'
                      })}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Costo total de los items del paquete
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags Selector */}
      <TagSelector 
        title="Etiquetas del Paquete"
        description="Seleccionar etiquetas para organizar tu paquete"
        helperText="Las etiquetas te ayudan a organizar y filtrar tus paquetes. Puedes seleccionar múltiples etiquetas haciendo clic en ellas."
      />
    </div>
  );
}