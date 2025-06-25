import { useEffect, useState, useCallback, useRef } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useBundleContext } from '../context/bundles-context';
import { useBundleMutations } from '../hooks/useBundleMutations';
import { BundleBasicForm } from './form/bundle-basic-form';
import { BundleItemsForm } from './form/bundle-items-form';
import { BundleFilesForm } from './form/bundle-files-form';
import { createBundleSchema, editBundleSchema, CreateBundleForm, EditBundleForm } from '../types';
import { ProductStatus } from '@/features/products/types.ts';
import { uploadFiles } from '../utils/fileUpload';
import { Media } from '@/features/chats/ChatTypes';

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
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const isLoading = createBundle.isPending || updateBundle.isPending || isUploadingFiles;
  
  // Ref to prevent infinite loops
  const hasInitialized = useRef(false);

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

  // Initialize form when dialog opens or mode changes
  useEffect(() => {
    if (!isDialogOpen) {
      hasInitialized.current = false;
      return;
    }
    
    // Prevent multiple initializations
    if (hasInitialized.current) return;
    hasInitialized.current = true;

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
        files: selectedBundle.files || [],
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
  }, [isDialogOpen, isEdit, selectedBundle?.id, form]);

  const handleClose = useCallback(() => {
    setIsDialogOpen(false);
    setDialogMode(null);
    setSelectedBundle(null);
    setUploadError(null);
    setUploadProgress(0);
    hasInitialized.current = false;
    
    // Reset form to default values
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
    
    // Clear pending files from the form component
    try {
      if ((window as any)._clearBundlePendingFiles) {
        (window as any)._clearBundlePendingFiles();
      }
    } catch (error) {
      console.warn('Error clearing pending files:', error);
    }
  }, [setIsDialogOpen, setDialogMode, setSelectedBundle, form]);

  const onSubmit = useCallback(async (data: CreateBundleForm | EditBundleForm) => {
    try {
      setUploadError(null);
      setUploadProgress(0);

      // Get pending files from the form component
      const pendingFiles: File[] = (window as any)._getBundlePendingFiles ? 
        (window as any)._getBundlePendingFiles() : [];

      let finalFilesArray: Media[] = [...(data.files || [])];

      // Upload pending files if any
      if (pendingFiles.length > 0) {
        setIsUploadingFiles(true);
        
        const uploadResult = await uploadFiles(
          pendingFiles,
          (uploaded, total) => {
            setUploadProgress(Math.round((uploaded / total) * 100));
          }
        );

        if (!uploadResult.success) {
          setUploadError(
            `Error al subir archivos:\n${uploadResult.errors.join('\n')}`
          );
          setIsUploadingFiles(false);
          return;
        }

        // Add uploaded files to the existing files
        finalFilesArray = [...finalFilesArray, ...uploadResult.media];
        setIsUploadingFiles(false);
      }

      // Update data with final files array
      const finalData = {
        ...data,
        files: finalFilesArray,
      };

      // Create or update bundle
      if (isEdit && selectedBundle) {
        await updateBundle.mutateAsync({
          id: selectedBundle.id,
          changes: finalData as EditBundleForm,
        });
      } else {
        await createBundle.mutateAsync(finalData as CreateBundleForm);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error:', error);
      setIsUploadingFiles(false);
      setUploadError('Error al procesar la solicitud');
    }
  }, [isEdit, selectedBundle?.id, createBundle, updateBundle, handleClose]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
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
            <BundleFilesForm />

            {/* Upload Progress */}
            {isUploadingFiles && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Subiendo archivos...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Upload Error */}
            {uploadError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-line">
                  {uploadError}
                </AlertDescription>
              </Alert>
            )}
            
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
                {isUploadingFiles ? `Subiendo archivos... ${uploadProgress}%` 
                  : isLoading ? 'Guardando...' 
                  : isEdit ? 'Actualizar' : 'Crear Paquete'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}