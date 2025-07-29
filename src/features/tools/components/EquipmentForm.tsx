import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Equipment, EquipmentStatus, CreateEquipmentData, UpdateEquipmentData } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ImageIcon } from 'lucide-react';

const equipmentSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.nativeEnum(EquipmentStatus).default(EquipmentStatus.ACTIVE),
  category: z.string().optional(),
  description: z.string().optional(),
  photo: z.string().optional(),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  brand: z.string().optional(),
  purchaseDate: z.string().optional(),
  lastMaintenanceDate: z.string().optional(),
});

const equipmentUpdateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  status: z.nativeEnum(EquipmentStatus).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  photo: z.string().optional(),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  brand: z.string().optional(),
  purchaseDate: z.string().optional(),
  lastMaintenanceDate: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;
type EquipmentUpdateFormData = z.infer<typeof equipmentUpdateSchema>;

interface EquipmentFormProps {
  equipment?: Equipment;
  onSubmit: (data: CreateEquipmentData | UpdateEquipmentData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitText?: string;
}

export const EquipmentForm: React.FC<EquipmentFormProps> = ({
  equipment,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText
}) => {
  const isEditing = !!equipment;
  const schema = isEditing ? equipmentUpdateSchema : equipmentSchema;
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<EquipmentFormData | EquipmentUpdateFormData>({
    resolver: zodResolver(schema),
    defaultValues: equipment ? {
      name: equipment.name,
      status: equipment.status,
      category: equipment.category || '',
      description: equipment.description || '',
      photo: equipment.photo || '',
      serialNumber: equipment.serialNumber || '',
      model: equipment.model || '',
      brand: equipment.brand || '',
      purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate).toISOString().split('T')[0] : '',
      lastMaintenanceDate: equipment.lastMaintenanceDate ? new Date(equipment.lastMaintenanceDate).toISOString().split('T')[0] : '',
    } : {
      status: EquipmentStatus.ACTIVE
    }
  });

  const statusValue = watch('status');

  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case EquipmentStatus.IN_USE:
        return 'text-blue-600';
      case EquipmentStatus.ACTIVE:
        return 'text-green-600';
      case EquipmentStatus.INACTIVE:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre del equipo"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={statusValue}
                onValueChange={(value) => setValue('status', value as EquipmentStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EquipmentStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      <span className={getStatusColor(status)}>
                        {status === EquipmentStatus.IN_USE && 'En Uso'}
                        {status === EquipmentStatus.ACTIVE && 'Activo'}
                        {status === EquipmentStatus.INACTIVE && 'Inactivo'}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Equipment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Categoría del equipo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Número de Serie</Label>
              <Input
                id="serialNumber"
                {...register('serialNumber')}
                placeholder="Número de serie"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                {...register('brand')}
                placeholder="Marca del equipo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                {...register('model')}
                placeholder="Modelo del equipo"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate" className="flex items-center gap-2">
                <CalendarIcon size={16} />
                Fecha de Compra
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                {...register('purchaseDate')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastMaintenanceDate" className="flex items-center gap-2">
                <CalendarIcon size={16} />
                Último Mantenimiento
              </Label>
              <Input
                id="lastMaintenanceDate"
                type="date"
                {...register('lastMaintenanceDate')}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción del equipo"
              rows={3}
            />
          </div>

          {/* Photo URL */}
          <div className="space-y-2">
            <Label htmlFor="photo" className="flex items-center gap-2">
              <ImageIcon size={16} />
              URL de la Foto
            </Label>
            <Input
              id="photo"
              {...register('photo')}
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Guardando...' : (submitText || (isEditing ? 'Actualizar' : 'Crear'))}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
