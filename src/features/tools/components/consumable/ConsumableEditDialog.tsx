import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Consumable, CreateConsumableData, UpdateConsumableData } from '../../types';
import { ConsumableBasicSection } from './form/ConsumableBasicSection';
import { ConsumableImagesSection } from './form/ConsumableImagesSection';
import { z } from 'zod';

const consumableFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  stock: z.number().min(0, { message: "Stock must be 0 or greater" }),
  description: z.string().optional(),
  photo: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
});

type ConsumableFormData = z.infer<typeof consumableFormSchema>;

interface ConsumableEditDialogProps {
  consumable: Consumable | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (consumable: Consumable, data: UpdateConsumableData) => Promise<void>;
  onCreate?: (data: CreateConsumableData) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const defaultValues: ConsumableFormData = {
  name: '',
  stock: 0,
  description: '',
  photo: '',
  brand: '',
  model: '',
  category: '',
};

export function ConsumableEditDialog({
  consumable,
  isOpen,
  onClose,
  onSubmit,
  onCreate,
  isLoading = false,
  mode
}: ConsumableEditDialogProps) {
  const form = useForm<ConsumableFormData>({
    resolver: zodResolver(consumableFormSchema),
    defaultValues,
  });

  // Resetear y cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (!isOpen) return;
    
    // Usar un timeout para evitar problemas con el renderizado
    const timer = setTimeout(() => {
      if (consumable && mode === 'edit') {
        const formData = {
          name: consumable.name || '',
          stock: consumable.stock || 0,
          description: consumable.description || '',
          photo: consumable.photo || '',
          brand: consumable.brand || '',
          model: consumable.model || '',
          category: consumable.category || '',
        };
        form.reset(formData);
      } else if (mode === 'create') {
        form.reset(defaultValues);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [isOpen, consumable?.id, mode]);

  const handleSubmit = async (data: ConsumableFormData) => {
    try {
      // Clean and prepare data for submission
      const submitData: any = {
        name: data.name,
        stock: data.stock,
      };
      
      // Only include non-empty optional fields
      if (data.description && data.description.trim()) {
        submitData.description = data.description.trim();
      }
      
      if (data.photo && data.photo.trim()) {
        submitData.photo = data.photo.trim();
      }
      
      if (data.brand && data.brand.trim()) {
        submitData.brand = data.brand.trim();
      }
      
      if (data.model && data.model.trim()) {
        submitData.model = data.model.trim();
      }
      
      if (data.category && data.category.trim()) {
        submitData.category = data.category.trim();
      }

      if (mode === 'create' && onCreate) {
        await onCreate(submitData as CreateConsumableData);
        toast.success(`¡Consumible creado! ${data.name} agregado al inventario`);
      } else if (mode === 'edit' && consumable) {
        await onSubmit(consumable, submitData as UpdateConsumableData);
        toast.success(`¡Cambios guardados! ${data.name} actualizado correctamente`);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving consumable:', error);
      toast.error('Error al guardar el consumible. Intenta nuevamente.');
    }
  };

  const handleClose = () => {
    // No resetear inmediatamente para evitar bucles infinitos
    onClose();
  };

  const getDialogTitle = () => {
    return mode === 'create' ? 'Crear nuevo consumible' : `Editar consumible: ${consumable?.name || ''}`;
  };

  const getDialogDescription = () => {
    return mode === 'create' 
      ? 'Complete el formulario para agregar un nuevo consumible al inventario.'
      : 'Modifique la información del consumible seleccionado.';
  };

  const getSubmitButtonText = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === 'create' ? 'Creando...' : 'Guardando...'}
        </>
      );
    }
    return mode === 'create' ? 'Crear consumible' : 'Guardar cambios';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(handleSubmit, (errors) => {
              // Esta función se ejecuta cuando hay errores de validación
              const errorFields = Object.keys(errors);
              const fieldNames: Record<string, string> = {
                name: 'Nombre del consumible',
                stock: 'Stock actual',
                description: 'Descripción',
                photo: 'Imagen',
                brand: 'Marca',
                model: 'Modelo',
                category: 'Categoría',
              };
              
              const missingFields = errorFields.map(field => 
                fieldNames[field] || field
              ).join(', ');
              
              toast.error('Campos obligatorios faltantes', {
                description: `Por favor completa: ${missingFields}`
              });
              
              // Enfocar el primer campo con error
              const firstErrorField = errorFields[0] as keyof ConsumableFormData;
              form.setFocus(firstErrorField);
            })} 
            className="flex flex-col flex-1 min-h-0"
          >
            <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {/* Información básica */}
                <ConsumableBasicSection control={form.control} />

                {/* Imágenes */}
                <ConsumableImagesSection control={form.control} />
              </div>
            </ScrollArea>

            {/* Botones de acción - Footer fijo */}
            <div className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t bg-muted/20 shadow-lg">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {getSubmitButtonText()}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}