import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Consumable, CreateConsumableData, UpdateConsumableData } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageIcon, ImageIcon } from 'lucide-react';
import { FileUpload } from '@/components/file-upload';
import { useUploadMedia } from '@/features/chats/hooks/useUploadMedia';
import { toast } from 'sonner';

const consumableSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  stock: z.number().int().min(0, { message: "Stock must be a non-negative integer" }).default(0),
  description: z.string().optional(),
  photo: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
});

const consumableUpdateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  stock: z.number().int().min(0, { message: "Stock must be a non-negative integer" }).optional(),
  description: z.string().optional(),
  photo: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
});

type ConsumableFormData = z.infer<typeof consumableSchema>;
type ConsumableUpdateFormData = z.infer<typeof consumableUpdateSchema>;

interface ConsumableFormProps {
  consumable?: Consumable;
  onSubmit: (data: CreateConsumableData | UpdateConsumableData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitText?: string;
}

export const ConsumableForm: React.FC<ConsumableFormProps> = ({
  consumable,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText
}) => {
  const isEditing = !!consumable;
  const schema = isEditing ? consumableUpdateSchema : consumableSchema;
  const [photos, setPhotos] = useState<File[]>([]);
  const { uploadFile, validateFile, isUploading } = useUploadMedia();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ConsumableFormData | ConsumableUpdateFormData>({
    resolver: zodResolver(schema),
    defaultValues: consumable ? {
      name: consumable.name,
      stock: consumable.stock,
      description: consumable.description || '',
      photo: consumable.photo || '',
      brand: consumable.brand || '',
      model: consumable.model || '',
      category: consumable.category || '',
    } : {
      stock: 0
    }
  });

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    const { isValid } = validateFile(file);
    if (!isValid) {
      toast.error('El archivo no es válido');
      return;
    }

    try {
      const url = await uploadFile(file);
      setValue('photo', url);
      toast.success('Imagen subida exitosamente');
    } catch (error) {
      toast.error('Hubo un error al subir la imagen');
    }
  };

  // Handle form submission with photo upload
  const handleFormSubmit = async (data: ConsumableFormData | ConsumableUpdateFormData) => {
    // Upload photos if any
    if (photos.length > 0) {
      for (const photo of photos) {
        await handleImageUpload(photo);
      }
    }
    
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageIcon size={20} />
          {isEditing ? 'Editar Consumible' : 'Crear Nuevo Consumible'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre del consumible"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...register('stock', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? 0 : Number(value)
                })}
                placeholder="Cantidad en stock"
                className={errors.stock ? 'border-red-500' : ''}
              />
              {errors.stock && (
                <p className="text-sm text-red-500">{errors.stock.message}</p>
              )}
              {!errors.stock && consumable && (
                <p className={`text-sm ${getStockColor(consumable.stock)}`}>
                  {consumable.stock === 0 && 'Sin stock'}
                  {consumable.stock > 0 && consumable.stock < 10 && 'Stock bajo'}
                  {consumable.stock >= 10 && 'Stock normal'}
                </p>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Categoría del consumible"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                {...register('brand')}
                placeholder="Marca del producto"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              {...register('model')}
              placeholder="Modelo del producto"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción del consumible"
              rows={3}
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon size={16} />
              Foto del Consumible
            </Label>
            <FileUpload
              maxFiles={1}
              maxSize={10 * 1024 * 1024}
              value={photos}
              onChange={setPhotos}
              accept={{
                'image/*': ['.png', '.jpg', '.jpeg', '.gif']
              }}
            />
            {/* Show current photo URL if editing */}
            {consumable?.photo && (
              <div className="text-sm text-gray-600">
                <p>Imagen actual:</p>
                <img 
                  src={consumable.photo} 
                  alt="Imagen actual" 
                  className="w-20 h-20 object-cover rounded border mt-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading || isUploading}
              className="flex-1"
            >
              {isLoading || isUploading ? 'Guardando...' : (submitText || (isEditing ? 'Actualizar' : 'Crear'))}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isUploading}
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
