import { useFormContext } from 'react-hook-form';
import { Calculator, Package, Tag } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductStatus } from '@/features/products/types';
import { CreateBundleForm, EditBundleForm } from '../../types';
import { useGetProductTags } from '@/features/products/hooks/useGetAuxiliaryData.ts'

export function BundleBasicForm() {
  const { control } = useFormContext<CreateBundleForm | EditBundleForm>();
  const { data: tags = [] } = useGetProductTags();

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

      {/* Etiquetas */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Etiquetas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="tagIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seleccionar etiquetas</FormLabel>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {tags.map((tag) => (
                        <div 
                          key={tag.id} 
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <Checkbox
                            checked={field.value?.includes(tag.id) || false}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked) {
                                field.onChange([...currentValue, tag.id]);
                              } else {
                                field.onChange(currentValue.filter((id) => id !== tag.id));
                              }
                            }}
                          />
                          <Badge 
                            variant="outline"
                            className="text-sm"
                            style={{
                              backgroundColor: tag.color ? `${tag.color}20` : undefined,
                              borderColor: tag.color || undefined,
                              color: tag.color || undefined,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Clasifica tu paquete con etiquetas para mejor organización
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}