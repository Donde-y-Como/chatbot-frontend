import { Control } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EquipmentStatus } from '../../../types';

type EquipmentFormData = {
  name: string;
  status: EquipmentStatus;
  category?: string;
  description?: string;
  serialNumber?: string;
  model?: string;
  brand?: string;
  photos: string[];
  purchaseDate?: string;
  lastMaintenanceDate?: string;
};

interface EquipmentDatesSectionProps {
  control: Control<EquipmentFormData>;
}

export function EquipmentDatesSection({ control }: EquipmentDatesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Fechas importantes
          <span className="text-sm font-normal text-muted-foreground">
            (Opcional)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha de compra */}
          <FormField
            control={control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de compra</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Fecha en que se adquirió el equipo
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha de último mantenimiento */}
          <FormField
            control={control}
            name="lastMaintenanceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Último mantenimiento</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Fecha del último mantenimiento realizado
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}