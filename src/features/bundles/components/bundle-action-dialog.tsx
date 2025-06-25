import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useBundleContext } from '../context/bundles-context';
import { useBundleMutations } from '../hooks/useBundleMutations';
import { BundleBasicForm } from './form/bundle-basic-form';
import { BundleItemsForm } from './form/bundle-items-form';
import { createBundleSchema, editBundleSchema, CreateBundleForm, EditBundleForm } from '../types';
import { ProductStatus } from '@/features/products/types.ts'

export function BundleActionDialog() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    dialogMode,
    selectedBundle,
    setDialogMode,
    setSelectedBundle,
  } = useBundleContext();

  const { createBundle, updateBundle } = useBundleMutations();
  const isEdit = dialogMode === 'edit';
  const isLoading = createBundle.isPending || updateBundle.isPending;

  const form = useForm<CreateBundleForm | EditBundleForm>({
    resolver: zodResolver(isEdit ? editBundleSchema : createBundleSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      price: { amount: 0, currency: 'MXN' },
      cost: { amount: 0, currency: 'MXN' },
      items: [],
      status: ProductStatus.ACTIVO,
      tagIds: [],
      files: [],
    },
  });

  useEffect(() => {
    if (isEdit && selectedBundle) {
      form.reset({
        id: selectedBundle.id,
        sku: selectedBundle.sku,
        name: selectedBundle.name,
        description: selectedBundle.description,
        price: selectedBundle.price,
        cost: selectedBundle.cost,
        items: selectedBundle.items.map(item => ({
          itemId: item.itemId,
          itemType: item.type,
          quantity: item.quantity,
        })),
        status: selectedBundle.status,
        tagIds: selectedBundle.tagIds,
        files: selectedBundle.files,
      });
    } else {
      form.reset({
        sku: '',
        name: '',
        description: '',
        price: { amount: 0, currency: 'MXN' },
        cost: { amount: 0, currency: 'MXN' },
        items: [],
        status: ProductStatus.ACTIVO,
        tagIds: [],
        files: [],
      });
    }
  }, [isEdit, selectedBundle, form]);

  const handleClose = () => {
    setIsDialogOpen(false);
    setDialogMode(null);
    setSelectedBundle(null);
    form.reset();
  };

  const onSubmit = async (data: CreateBundleForm | EditBundleForm) => {
    try {
      if (isEdit && selectedBundle) {
        await updateBundle.mutateAsync({
          id: selectedBundle.id,
          changes: data as EditBundleForm,
        });
      } else {
        await createBundle.mutateAsync(data as CreateBundleForm);
      }
      handleClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Paquete' : 'Crear Nuevo Paquete'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Modifica los datos del paquete seleccionado.'
              : 'Crea un nuevo paquete agrupando productos y servicios.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BundleBasicForm />
            <BundleItemsForm />
            
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Paquete'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}