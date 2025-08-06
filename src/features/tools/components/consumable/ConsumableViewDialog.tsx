import React from 'react';
import { 
  Package, 
  BarChart3, 
  ImageIcon,
  Pencil,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Consumable } from '../../types';
import { cn } from '@/lib/utils';

interface ConsumableViewDialogProps {
  consumable: Consumable | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (consumable: Consumable) => void;
}

export function ConsumableViewDialog({ 
  consumable, 
  isOpen, 
  onClose, 
  onEdit 
}: ConsumableViewDialogProps) {
  if (!consumable) {
    return null;
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStockStatus = () => {
    if (consumable.stock <= 0) {
      return { 
        text: 'Sin stock', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100', 
        borderColor: 'border-red-200',
        icon: AlertTriangle 
      };
    }
    if (consumable.stock <= 10) {
      return { 
        text: 'Stock bajo', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100', 
        borderColor: 'border-yellow-200',
        icon: AlertTriangle 
      };
    }
    return { 
      text: 'Stock disponible', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100', 
      borderColor: 'border-green-200',
      icon: CheckCircle 
    };
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  const handleEdit = () => {
    onEdit(consumable);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {consumable.name}
              </DialogTitle>
              <DialogDescription>
                Información detallada del consumible seleccionado.
              </DialogDescription>
            </div>
            <Button onClick={handleEdit} size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 overflow-auto">
          <div className="space-y-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Imagen principal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ImageIcon className="h-4 w-4" />
                    Imágenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {consumable.photo ? (
                    <div className="space-y-3">
                      <div className="aspect-square w-full overflow-hidden rounded-lg border">
                        <img
                          src={consumable.photo}
                          alt={consumable.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-lg">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Sin imágenes</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Información básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-4 w-4" />
                    Información básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado del stock</p>
                    <Badge className={cn(stockStatus.bgColor, stockStatus.color, stockStatus.borderColor)}>
                      <div className="flex items-center gap-1">
                        <StockIcon className="h-3 w-3" />
                        {stockStatus.text}
                      </div>
                    </Badge>
                  </div>

                  {consumable.category && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                      <p>{consumable.category}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {consumable.brand && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Marca</p>
                        <p>{consumable.brand}</p>
                      </div>
                    )}

                    {consumable.model && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                        <p>{consumable.model}</p>
                      </div>
                    )}
                  </div>

                  {consumable.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                      <p className="text-sm bg-muted p-3 rounded">{consumable.description}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <div className={cn("h-3 w-3 rounded-full", 
                      consumable.stock > 10 ? "bg-green-500" :
                      consumable.stock > 0 ? "bg-yellow-500" :
                      "bg-red-500"
                    )} />
                    <span className={cn("text-sm font-medium", stockStatus.color)}>
                      {consumable.stock} unidades disponibles
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stock e inventario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  Stock e inventario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Stock actual</p>
                    <p className="text-3xl font-bold">{consumable.stock}</p>
                    <p className="text-xs text-muted-foreground">unidades</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <StockIcon className={cn("h-6 w-6", stockStatus.color)} />
                      <span className={cn("font-medium text-lg", stockStatus.color)}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Necesita restock</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      {consumable.stock <= 10 ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-medium">Sí</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">No</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Información del sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha de creación</p>
                    <p className="text-sm">
                      {formatDate(consumable.createdAt)}
                    </p>
                  </div>
                  
                  {consumable.updatedAt && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Última actualización</p>
                      <p className="text-sm">
                        {formatDate(consumable.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar consumible
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}