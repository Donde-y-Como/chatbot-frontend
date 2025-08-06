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
import { Equipment, CreateEquipmentData, UpdateEquipmentData, EquipmentStatus } from '../../types';
import { EquipmentBasicSection } from './form/EquipmentBasicSection';
import { EquipmentImagesSection } from './form/EquipmentImagesSection';
import { EquipmentDatesSection } from './form/EquipmentDatesSection';
import { z } from 'zod';

const equipmentFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.nativeEnum(EquipmentStatus),
  category: z.string().optional(),
  description: z.string().optional(),
  photos: z.array(z.string()).default([]),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  brand: z.string().optional(),
  purchaseDate: z.string().optional(),
  lastMaintenanceDate: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

interface EquipmentEditDialogProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (equipment: Equipment, data: UpdateEquipmentData) => Promise<void>;
  onCreate?: (data: CreateEquipmentData) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const defaultValues: EquipmentFormData = {
  name: '',
  status: EquipmentStatus.ACTIVE,
  category: '',
  description: '',
  photos: [],
  serialNumber: '',
  model: '',
  brand: '',
  purchaseDate: '',
  lastMaintenanceDate: '',
};

export function EquipmentEditDialog({
  equipment,
  isOpen,
  onClose,
  onSubmit,
  onCreate,
  isLoading = false,
  mode
}: EquipmentEditDialogProps) {
  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues,
  });

  // Resetear y cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (!isOpen) return;
    
    // Usar un timeout para evitar problemas con el renderizado
    const timer = setTimeout(() => {
      if (equipment && mode === 'edit') {
        const formData = {
          name: equipment.name || '',
          status: equipment.status || EquipmentStatus.ACTIVE,
          category: equipment.category || '',
          description: equipment.description || '',
          photos: equipment.photos || [],
          serialNumber: equipment.serialNumber || '',
          model: equipment.model || '',
          brand: equipment.brand || '',
          purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate).toISOString().split('T')[0] : '',
          lastMaintenanceDate: equipment.lastMaintenanceDate ? new Date(equipment.lastMaintenanceDate).toISOString().split('T')[0] : '',
        };
        form.reset(formData);
      } else if (mode === 'create') {
        form.reset(defaultValues);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [isOpen, equipment?.id, mode]);

  const handleSubmit = async (data: EquipmentFormData) => {
    try {
      // Clean and prepare data for submission
      const submitData: any = {
        name: data.name,
        status: data.status,
        photos: data.photos || []
      };
      
      // Only include non-empty optional fields
      if (data.category && data.category.trim()) {
        submitData.category = data.category.trim();
      }
      
      if (data.description && data.description.trim()) {
        submitData.description = data.description.trim();
      }
      
      if (data.serialNumber && data.serialNumber.trim()) {
        submitData.serialNumber = data.serialNumber.trim();
      }
      
      if (data.model && data.model.trim()) {
        submitData.model = data.model.trim();
      }
      
      if (data.brand && data.brand.trim()) {
        submitData.brand = data.brand.trim();
      }
      
      // Handle dates - convert to ISO datetime if provided
      if (data.purchaseDate && data.purchaseDate.trim()) {
        submitData.purchaseDate = new Date(data.purchaseDate).toISOString();
      }
      
      if (data.lastMaintenanceDate && data.lastMaintenanceDate.trim()) {
        submitData.lastMaintenanceDate = new Date(data.lastMaintenanceDate).toISOString();
      }

      if (mode === 'create' && onCreate) {
        await onCreate(submitData as CreateEquipmentData);
        toast.success(`¡Equipo creado! ${data.name} agregado al inventario`);
      } else if (mode === 'edit' && equipment) {
        await onSubmit(equipment, submitData as UpdateEquipmentData);
        toast.success(`¡Cambios guardados! ${data.name} actualizado correctamente`);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving equipment:', error);
      toast.error('Error al guardar el equipo. Intenta nuevamente.');
    }
  };

  const handleClose = () => {
    // No resetear inmediatamente para evitar bucles infinitos
    onClose();
  };

  const getDialogTitle = () => {
    return mode === 'create' ? 'Crear nuevo equipo' : `Editar equipo: ${equipment?.name || ''}`;
  };

  const getDialogDescription = () => {
    return mode === 'create' 
      ? 'Complete el formulario para agregar un nuevo equipo al inventario.'
      : 'Modifique la información del equipo seleccionado.';
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
    return mode === 'create' ? 'Crear equipo' : 'Guardar cambios';
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
                name: 'Nombre del equipo',
                status: 'Estado',
                category: 'Categoría',
                description: 'Descripción',
                serialNumber: 'Número de serie',
                model: 'Modelo',
                brand: 'Marca',
                purchaseDate: 'Fecha de compra',
                lastMaintenanceDate: 'Último mantenimiento',
              };
              
              const missingFields = errorFields.map(field => 
                fieldNames[field] || field
              ).join(', ');
              
              toast.error('Campos obligatorios faltantes', {
                description: `Por favor completa: ${missingFields}`
              });
              
              // Enfocar el primer campo con error
              const firstErrorField = errorFields[0] as keyof EquipmentFormData;
              form.setFocus(firstErrorField);
            })} 
            className="flex flex-col flex-1 min-h-0"
          >
            <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {/* Información básica */}
                <EquipmentBasicSection control={form.control} />

                {/* Imágenes */}
                <EquipmentImagesSection control={form.control} />

                {/* Fechas */}
                <EquipmentDatesSection control={form.control} />
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