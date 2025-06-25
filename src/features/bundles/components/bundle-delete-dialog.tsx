import { AlertTriangle, Package, Wrench } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useBundleContext } from '../context/bundles-context';
import { useBundleMutations } from '../hooks/useBundleMutations';
import { useGetProducts } from '@/features/products/hooks/useGetProducts';
import { useGetServices } from '@/features/appointments/hooks/useGetServices';
import { formatCurrency } from '@/lib/utils';
import { BundleItemResponse } from '@/features/bundles/types.ts'

export function BundleDeleteDialog() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    selectedBundle,
    setDialogMode,
    setSelectedBundle,
  } = useBundleContext();

  const { deleteBundle } = useBundleMutations();
  const { data: products } = useGetProducts();
  const { data: services = [] } = useGetServices();

  if (!products) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              No se pudieron cargar los productos. Por favor, inténtalo de nuevo más tarde.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const handleClose = () => {
    setIsDialogOpen(false);
    setDialogMode(null);
    setSelectedBundle(null);
  };

  const handleDelete = async () => {
    if (!selectedBundle) return;

    try {
      await deleteBundle.mutateAsync(selectedBundle.id);
      handleClose();
    } catch (error) {
      console.error('Error deleting bundle:', error);
    }
  };

  if (!selectedBundle) return null;

  const getItemDetails = (item: BundleItemResponse) => {
    if (item.type === 'product') {
      const product = products.products.find(p => p.id === item.itemId);
      return {
        name: product?.name || 'Producto no encontrado',
        price: product?.price?.amount || 0,
        currency: product?.price?.currency || 'MXN',
      };
    } else {
      const service = services.find(s => s.id === item.itemId);
      return {
        name: service?.name || 'Servicio no encontrado',
        price: service?.price || 0,
        currency: 'MXN',
      };
    }
  };

  const isLoading = deleteBundle.isPending;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. El paquete será eliminado permanentemente del sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bundle Info */}
          <Card className="border-destructive/20">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paquete a eliminar</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-semibold">{selectedBundle.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {selectedBundle.sku}
                    </Badge>
                    <Badge 
                      variant={selectedBundle.status === 'ACTIVO' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {selectedBundle.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Precio de venta</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(selectedBundle.price.amount, selectedBundle.price.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Costo</p>
                    <p className="font-medium text-orange-600">
                      {formatCurrency(selectedBundle.cost.amount, selectedBundle.cost.currency)}
                    </p>
                  </div>
                </div>

                {selectedBundle.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Descripción</p>
                    <p className="text-sm">{selectedBundle.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items que se perderán */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    Items incluidos en este paquete ({selectedBundle.items.length})
                  </p>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedBundle.items.map((item, index) => {
                    const details = getItemDetails(item);
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-950/20 rounded">
                        <div className="flex items-center gap-2">
                          {item.type === 'product' ? (
                            <Package className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Wrench className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-sm font-medium">{details.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type === 'product' ? 'Producto' : 'Servicio'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Cantidad: {item.quantity}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-amber-600">
                  ⚠️ Los productos y servicios individuales no se eliminarán, solo se eliminará la agrupación del paquete.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advertencias adicionales */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Consecuencias de eliminar este paquete:</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• El paquete dejará de estar disponible para la venta</li>
                  <li>• Se perderá el historial de configuración y precios</li>
                  <li>• Los reportes históricos que incluyan este paquete pueden verse afectados</li>
                  <li>• Esta acción no se puede deshacer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Eliminando...' : 'Sí, Eliminar Paquete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}