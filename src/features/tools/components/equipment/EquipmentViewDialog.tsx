import React from 'react';
import { 
  Settings, 
  Calendar, 
  Package, 
  ImageIcon,
  Pencil,
  AlertTriangle,
  CheckCircle,
  Info
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
import { Equipment, EquipmentStatus } from '../../types';
import { cn } from '@/lib/utils';

interface EquipmentViewDialogProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (equipment: Equipment) => void;
}

export function EquipmentViewDialog({ 
  equipment, 
  isOpen, 
  onClose, 
  onEdit 
}: EquipmentViewDialogProps) {
  if (!equipment) {
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

  const getStatusBadge = () => {
    switch (equipment.status) {
      case EquipmentStatus.IN_USE:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <div className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              En Uso
            </div>
          </Badge>
        );
      case EquipmentStatus.ACTIVE:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Activo
            </div>
          </Badge>
        );
      case EquipmentStatus.INACTIVE:
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Inactivo
            </div>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            Desconocido
          </Badge>
        );
    }
  };

  const getStatusColor = () => {
    switch (equipment.status) {
      case EquipmentStatus.IN_USE:
        return 'text-blue-600';
      case EquipmentStatus.ACTIVE:
        return 'text-green-600';  
      case EquipmentStatus.INACTIVE:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleEdit = () => {
    onEdit(equipment);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {equipment.name}
              </DialogTitle>
              <DialogDescription>
                Información detallada del equipo seleccionado.
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
              {/* Imagen principal y galería */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ImageIcon className="h-4 w-4" />
                    Imágenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {equipment.photos && equipment.photos.length > 0 ? (
                    <div className="space-y-3">
                      {/* Imagen principal */}
                      <div className="aspect-square w-full overflow-hidden rounded-lg border">
                        <img
                          src={equipment.photos[0]}
                          alt={equipment.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      
                      {/* Galería de miniaturas */}
                      {equipment.photos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {equipment.photos.slice(1).map((photo, index) => (
                            <div key={index} className="flex-shrink-0">
                              <img
                                src={photo}
                                alt={`${equipment.name} ${index + 2}`}
                                className="h-16 w-16 rounded-md border object-cover cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
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
                    <Settings className="h-4 w-4" />
                    Información básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    {getStatusBadge()}
                  </div>

                  {equipment.category && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                      <p>{equipment.category}</p>
                    </div>
                  )}

                  {equipment.serialNumber && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Número de Serie</p>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{equipment.serialNumber}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {equipment.brand && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Marca</p>
                        <p>{equipment.brand}</p>
                      </div>
                    )}

                    {equipment.model && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                        <p>{equipment.model}</p>
                      </div>
                    )}
                  </div>

                  {equipment.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                      <p className="text-sm bg-muted p-3 rounded">{equipment.description}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <div className={cn("h-3 w-3 rounded-full", 
                      equipment.status === EquipmentStatus.ACTIVE ? "bg-green-500" :
                      equipment.status === EquipmentStatus.IN_USE ? "bg-blue-500" :
                      "bg-red-500"
                    )} />
                    <span className={cn("text-sm font-medium", getStatusColor())}>
                      {equipment.status === EquipmentStatus.IN_USE && 'En uso actualmente'}
                      {equipment.status === EquipmentStatus.ACTIVE && 'Disponible para uso'}
                      {equipment.status === EquipmentStatus.INACTIVE && 'Fuera de servicio'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fechas importantes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Fechas importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Fecha de compra</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{formatDate(equipment.purchaseDate)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Último mantenimiento</p>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <p>{formatDate(equipment.lastMaintenanceDate)}</p>
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
                      {formatDate(equipment.createdAt)}
                    </p>
                  </div>
                  
                  {equipment.updatedAt && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Última actualización</p>
                      <p className="text-sm">
                        {formatDate(equipment.updatedAt)}
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
            Editar equipo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}