import { Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ConsumableFormData = {
  name: string;
  stock: number;
  description?: string;
  photo?: string;
  brand?: string;
  model?: string;
  category?: string;
};

interface ConsumableBasicSectionProps {
  control: Control<ConsumableFormData>;
}

export function ConsumableBasicSection({ control }: ConsumableBasicSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Información Básica
          <span className="text-sm font-normal text-muted-foreground">
            (Campos obligatorios)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nombre del consumible */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del consumible *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Tornillos, Papel, Tinta, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stock */}
          <FormField
            control={control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock actual *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="1"
                    placeholder="0"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Cantidad actual disponible en inventario
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Categoría */}
          <FormField
            control={control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Papelería, Ferretería, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Marca */}
          <FormField
            control={control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: HP, Canon, 3M, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Modelo */}
          <FormField
            control={control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: XL-200, Pro-Series, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descripción */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe el consumible, sus características, usos, especificaciones, etc."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}