import { 
  Package, 
  DollarSign, 
  BarChart3, 
  Tags, 
  FolderOpen, 
  Calendar,
  Pencil,
  AlertTriangle,
  ImageIcon,
  FileText
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProductContext, useProductActions } from '../context/products-context';
import { useGetUnits, useGetCategories, useGetProductTags } from '../hooks/useGetAuxiliaryData';
import { ProductStatus } from '../types';
import { cn } from '@/lib/utils';

export function ProductViewDialog() {
  const { 
    isDialogOpen, 
    dialogMode, 
    selectedProduct
  } = useProductContext();
  const { closeDialog, openEditDialog } = useProductActions();
  
  // Obtener datos auxiliares
  const { data: units = [] } = useGetUnits();
  const { data: categories = [] } = useGetCategories();
  const { data: tags = [] } = useGetProductTags();

  if (!selectedProduct || dialogMode !== 'view') {
    return null;
  }

  const unit = units.find(u => u.id === selectedProduct.unitId);
  const productCategories = categories.filter(c => selectedProduct.categoryIds?.includes(c.id));
  const productTags = tags.filter(t => selectedProduct.tagIds?.includes(t.id));

  const formatCurrency = (priceObj: { amount: number; currency: string } | number) => {
    if (typeof priceObj === 'number') {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(priceObj);
    }
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: priceObj.currency,
    }).format(priceObj.amount);
  };

  const finalPrice = selectedProduct.finalPrice || {
    amount: selectedProduct.price.amount * (1 - (selectedProduct.discount || 0) / 100),
    currency: selectedProduct.price.currency
  };
  const priceWithTaxes = finalPrice.amount * (1 + (selectedProduct.taxes || 0) / 100);
  const margin = selectedProduct.price.amount > 0 ? ((selectedProduct.price.amount - selectedProduct.cost.amount) / selectedProduct.price.amount) * 100 : 0;
  const profit = selectedProduct.price.amount - selectedProduct.cost.amount;

  const getStatusBadge = () => {
    if (selectedProduct.status === ProductStatus.ACTIVO) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>;
    }
    if (selectedProduct.status === ProductStatus.SIN_STOCK) {
      return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">Sin Stock</Badge>;
    }
    return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">Inactivo</Badge>;
  };

  const getStockStatus = () => {
    if (selectedProduct.stock <= 0) {
      return { text: 'Sin stock', color: 'text-red-600', icon: AlertTriangle };
    }
    if (selectedProduct.stock <= selectedProduct.minimumInventory) {
      return { text: 'Stock bajo', color: 'text-yellow-600', icon: AlertTriangle };
    }
    return { text: 'Stock disponible', color: 'text-green-600', icon: Package };
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  const handleEdit = () => {
    openEditDialog(selectedProduct);
  };

  return (
    <Dialog open={isDialogOpen && dialogMode === 'view'} onOpenChange={closeDialog}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {selectedProduct.name}
            </DialogTitle>
            <Button onClick={handleEdit} size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 overflow-auto">
          <div className="space-y-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Imagen principal y galería */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ImageIcon className="h-4 w-4" />
                    Imágenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedProduct.photos && selectedProduct.photos.length > 0 ? (
                    <div className="space-y-3">
                      {/* Imagen principal */}
                      <div className="aspect-square w-full overflow-hidden rounded-lg border">
                        <img
                          src={selectedProduct.photos[0]}
                          alt={selectedProduct.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      {/* Galería de miniaturas */}
                      {selectedProduct.photos && selectedProduct.photos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {selectedProduct.photos.slice(1).map((photo, index) => (
                            <div key={index} className="flex-shrink-0">
                              <img
                                src={photo}
                                alt={`${selectedProduct.name} ${index + 2}`}
                                className="h-16 w-16 rounded-md border object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">SKU</p>
                      <p className="font-mono text-sm">{selectedProduct.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estado</p>
                      {getStatusBadge()}
                    </div>
                  </div>

                  {selectedProduct.barcode && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Código de barras</p>
                      <p className="font-mono text-sm">{selectedProduct.barcode}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unidad de medida</p>
                    <p>{unit ? `${unit.name} (${unit.abbreviation})` : 'No especificada'}</p>
                  </div>

                  {selectedProduct.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                      <p className="text-sm">{selectedProduct.description}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <StockIcon className={cn("h-4 w-4", stockStatus.color)} />
                    <span className={cn("text-sm font-medium", stockStatus.color)}>
                      {stockStatus.text}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({selectedProduct.stock} unidades)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Precios y costos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4" />
                  Precios y costos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Costo unitario</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedProduct.cost)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Precio base</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedProduct.price)}</p>
                    {selectedProduct.discount > 0 && (
                      <p className="text-xs text-red-600">-{selectedProduct.discount}% descuento</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Precio final</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(finalPrice)}</p>
                    {selectedProduct.taxes > 0 && (
                      <p className="text-xs text-muted-foreground">
                        +{selectedProduct.taxes}% IVA: {formatCurrency({ amount: priceWithTaxes, currency: finalPrice.currency })}
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Margen</p>
                    <p className={cn(
                      "text-lg font-semibold",
                      margin >= 30 ? "text-green-600" : margin >= 15 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {margin.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ganancia: {formatCurrency({ amount: profit, currency: selectedProduct.price.currency })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  Inventario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Stock actual</p>
                    <p className="text-2xl font-bold">{selectedProduct.stock}</p>
                    <p className="text-xs text-muted-foreground">{unit?.abbreviation}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Mínimo requerido</p>
                    <p className="text-2xl font-bold">{selectedProduct.minimumInventory}</p>
                    <p className="text-xs text-muted-foreground">{unit?.abbreviation}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <StockIcon className={cn("h-5 w-5", stockStatus.color)} />
                      <span className={cn("font-medium", stockStatus.color)}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categorización */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderOpen className="h-4 w-4" />
                  Categorización
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Categorías</p>
                  <div className="flex flex-wrap gap-2">
                    {productCategories.length > 0 ? (
                      productCategories.map((category) => (
                        <Badge key={category.id} variant="outline">
                          {category.name}
                        </Badge>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FolderOpen className="h-4 w-4" />
                        <span>Sin categorías asignadas</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Etiquetas</p>
                  <div className="flex flex-wrap gap-2">
                    {productTags.length > 0 ? (
                      productTags.map((tag) => (
                        <Badge 
                          key={tag.id} 
                          variant="secondary"
                          style={{
                            backgroundColor: tag.color ? `${tag.color}20` : undefined,
                            borderColor: tag.color || undefined,
                            color: tag.color || undefined,
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Tags className="h-4 w-4" />
                        <span>Sin etiquetas asignadas</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedProduct.notes && selectedProduct.notes.trim() ? (
                  <p className="text-sm whitespace-pre-wrap">{selectedProduct.notes}</p>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Sin notas</span>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" onClick={closeDialog}>
            Cerrar
          </Button>
          <Button onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar producto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
