import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProductContext, useProductActions } from '../context/products-context';
import { useDeleteProduct } from '../hooks/useProductMutations';
import { useGetUnits } from '../hooks/useGetAuxiliaryData';

export function ProductDeleteDialog() {
  const { isDialogOpen, dialogMode, selectedProduct } = useProductContext();
  const { closeDialog } = useProductActions();
  const deleteMutation = useDeleteProduct();
  const { data: units = [] } = useGetUnits();

  const isDeleteMode = dialogMode === 'delete';
  const isOpen = isDialogOpen && isDeleteMode && !!selectedProduct;

  if (!selectedProduct) {
    return null;
  }

  const unit = units.find(u => u.id === selectedProduct.unitId);
  const hasStock = selectedProduct.stock > 0;
  const hasLowStock = selectedProduct.stock <= selectedProduct.minimumInventory;

  const handleDelete = async () => {
    const deleteOperation = deleteMutation.mutateAsync(selectedProduct.id);
    
    toast.promise(deleteOperation, {
      loading: `Eliminando ${selectedProduct.name}...`,
      success: (result) => {
        closeDialog();
        return `¡${selectedProduct.name} eliminado del inventario!`;
      },
      error: (error: any) => {
        console.error('Error deleting product:', error);
        
        // Error específico si el producto está siendo usado
        if (error?.response?.status === 400) {
          return 'No se puede eliminar. El producto puede estar siendo usado en ventas.';
        }
        
        // Error del servidor
        if (error?.response?.status >= 500) {
          return 'Error del servidor. Intenta nuevamente más tarde.';
        }
        
        // Error genérico
        return 'Error al eliminar. Verifica tu conexión.';
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={closeDialog}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Eliminar producto
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
            </p>

            {/* Información del producto */}
            <div className="border rounded-lg p-3 bg-muted/20">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 rounded-md">
                  <AvatarImage 
                    src={selectedProduct.photos?.[0]} 
                    alt={selectedProduct.name}
                    className="object-cover rounded-md"
                  />
                  <AvatarFallback className="rounded-md">
                    {selectedProduct.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {selectedProduct.sku}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatCurrency(selectedProduct.price.amount)}
                    </Badge>
                    {unit && (
                      <Badge variant="outline" className="text-xs">
                        {unit.abbreviation}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Advertencias */}
            <div className="space-y-2">
              {hasStock && (
                <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Stock disponible</p>
                    <p className="text-yellow-700">
                      Este producto tiene {selectedProduct.stock} unidades en stock.
                      Al eliminarlo, se perderá esta información.
                    </p>
                  </div>
                </div>
              )}

              {hasLowStock && hasStock && (
                <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800">Stock bajo</p>
                    <p className="text-orange-700">
                      Este producto está por debajo del inventario mínimo ({selectedProduct.minimumInventory} unidades).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={closeDialog}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Eliminar producto
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
