import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProductContext, useProductActions } from '../context/products-context';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProductMutations';
import { useGetUnits, useGetCategories, useGetProductTags } from '../hooks/useGetAuxiliaryData';
import { CreateProductForm, createProductSchema, ProductStatus } from '../types';
import { ProductBasicSection } from './form/product-basic-section';
import { ProductPricingSection } from './form/product-pricing-section';
import { ProductCategorizationSection } from './form/product-categorization-section';
import { ProductImagesSection } from './form/product-images-section';
import { ProductQuickForm } from './form/product-quick-form';

const defaultValues: CreateProductForm = {
  sku: '',
  name: '',
  description: '',
  price: { amount: 0, currency: 'MXN' },
  discount: 0,
  stock: 0,
  unitId: '',
  status: ProductStatus.ACTIVO,
  minimumInventory: 0,
  taxes: 0,
  cost: { amount: 0, currency: 'MXN' },
  barcode: undefined,
  categoryIds: [],
  subcategoryIds: [],
  photos: [],
  tagIds: [],
  notes: '',
};

export function ProductActionDialog() {
  const { 
    isDialogOpen, 
    dialogMode, 
    selectedProduct,
    createMode
  } = useProductContext();
  const { closeDialog } = useProductActions();
  
  // Obtener datos auxiliares
  const { data: units = [] } = useGetUnits();
  const { data: categories = [] } = useGetCategories();
  const { data: tags = [] } = useGetProductTags();
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const form = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema),
    defaultValues,
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isViewMode = dialogMode === 'view';

  // Resetear y cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (isDialogOpen) {
      if (selectedProduct && (dialogMode === 'edit' || dialogMode === 'view')) {
        // Cargar datos del producto seleccionado
        form.reset({
          sku: selectedProduct.sku,
          name: selectedProduct.name,
          description: selectedProduct.description,
          price: selectedProduct.price,
          discount: selectedProduct.discount,
          stock: selectedProduct.stock,
          unitId: selectedProduct.unitId,
          status: selectedProduct.status,
          minimumInventory: selectedProduct.minimumInventory,
          taxes: selectedProduct.taxes,
          cost: selectedProduct.cost,
          barcode: selectedProduct.barcode || undefined,
          categoryIds: selectedProduct.categoryIds,
          subcategoryIds: selectedProduct.subcategoryIds,
          photos: selectedProduct.photos,
          tagIds: selectedProduct.tagIds,
          notes: selectedProduct.notes,
        });
      } else {
        // Modo crear: resetear a valores por defecto
        const quickDefaults = {
          ...defaultValues,
          // En modo rápido, agregar algunos valores por defecto más inteligentes
          ...(createMode === 'quick' && {
            description: '',
            barcode: undefined,
            categoryIds: [],
            subcategoryIds: [],
            photos: [],
            tagIds: [],
            notes: '',
          })
        };
        form.reset(quickDefaults);
      }
    }
  }, [isDialogOpen, selectedProduct, dialogMode, createMode]);

  const onSubmit = async (data: CreateProductForm) => {
    const operation = dialogMode === 'create' 
      ? createMutation.mutateAsync(data)
      : updateMutation.mutateAsync({
          productId: selectedProduct!.id,
          changes: data,
        });

    toast.promise(operation, {
      loading: createMode === 'quick' 
        ? 'Creando producto rápido...' 
        : dialogMode === 'create' 
          ? 'Creando producto...' 
          : 'Guardando cambios...',
      success: (result) => {
        closeDialog();
        return createMode === 'quick' 
          ? `¡Producto rápido creado! ${data.name} agregado al inventario` 
          : dialogMode === 'create'
            ? `¡Producto creado! ${data.name} agregado al inventario`
            : `¡Cambios guardados! ${data.name} actualizado correctamente`;
      },
      error: (error: any) => {
        console.error('Error saving product:', error);
        
        // Manejar error específico de SKU duplicado
        if (error?.response?.status === 400 && error?.response?.data?.title === 'SKU already exists') {
          // Enfocar el campo SKU para que el usuario lo pueda cambiar
          setTimeout(() => {
            form.setFocus('sku');
            form.setError('sku', {
              type: 'manual',
              message: 'Este SKU ya está en uso'
            });
          }, 100);
          return 'SKU ya existe. Ya existe un producto con este SKU.';
        }
        
        // Manejar otros errores de validación del servidor
        if (error?.response?.status === 400) {
          return 'Error de validación. Revisa los datos ingresados.';
        }
        
        // Error genérico del servidor
        if (error?.response?.status >= 500) {
          return 'Error del servidor. Intenta nuevamente más tarde.';
        }
        
        // Error de conexión u otros
        return 'Error inesperado. Verifica tu conexión.';
      }
    });
  };

  const handleClose = () => {
    form.reset();
    closeDialog();
  };

  const getDialogTitle = () => {
    switch (dialogMode) {
      case 'create':
        return createMode === 'quick' ? 'Crear producto rápido' : 'Crear nuevo producto';
      case 'edit':
        return `Editar producto: ${selectedProduct?.name || ''}`;
      case 'view':
        return `Ver producto: ${selectedProduct?.name || ''}`;
      default:
        return 'Producto';
    }
  };

  const getSubmitButtonText = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {dialogMode === 'create' ? 
            (createMode === 'quick' ? 'Creando rápido...' : 'Creando...') : 
            'Guardando...'
          }
        </>
      );
    }
    return dialogMode === 'create' ? 
      (createMode === 'quick' ? 'Crear rápido' : 'Crear producto') : 
      'Guardar cambios';
  };

  // Solo mostrar si hay diálogos de crear o editar
  if (!isDialogOpen || dialogMode === 'view' || dialogMode === 'delete') {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              // Esta función se ejecuta cuando hay errores de validación
              const errorFields = Object.keys(errors);
              const fieldNames: Record<string, string> = {
                sku: 'SKU',
                name: 'Nombre del producto',
                'price.amount': 'Precio de venta',
                'cost.amount': 'Costo del producto',
                stock: 'Stock actual',
                unitId: 'Unidad de medida',
                status: 'Estado',
                minimumInventory: 'Inventario mínimo',
                discount: 'Descuento',
                taxes: 'Impuestos',
              };
              
              const missingFields = errorFields.map(field => {
                // Manejar campos anidados como price.amount
                if (field === 'price' && errors.price?.amount) return 'Precio de venta';
                if (field === 'cost' && errors.cost?.amount) return 'Costo del producto';
                return fieldNames[field] || field;
              }).join(', ');
              
              toast.error('Campos obligatorios faltantes', {
                description: `Por favor completa: ${missingFields}`
              });
              
              // Enfocar el primer campo con error
              const firstErrorField = errorFields[0] as keyof CreateProductForm;
              form.setFocus(firstErrorField);
            })} 
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {dialogMode === 'create' && createMode === 'quick' ? (
                  /* Formulario rápido */
                  <ProductQuickForm 
                    control={form.control} 
                    units={units}
                  />
                ) : (
                  /* Formulario completo */
                  <>
                    {/* Información básica */}
                    <ProductBasicSection 
                      control={form.control} 
                      units={units}
                    />

                    {/* Precios y costos */}
                    <ProductPricingSection control={form.control} />

                    {/* Imágenes */}
                    <ProductImagesSection control={form.control} />

                    {/* Categorización */}
                    <ProductCategorizationSection 
                      control={form.control}
                      categories={categories}
                      tags={tags}
                    />
                  </>
                )}
              </div>
            </div>

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
