import React from 'react';
import { Equipment, EquipmentStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Package, Settings, Tag, Hash, Building, Wrench } from 'lucide-react';

interface EquipmentDetailsProps {
  equipment: Equipment;
}

export const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment }) => {
  const getStatusBadge = (status: EquipmentStatus) => {
    const variants = {
      [EquipmentStatus.IN_USE]: { color: 'bg-blue-100 text-blue-800', label: 'En Uso' },
      [EquipmentStatus.ACTIVE]: { color: 'bg-green-100 text-green-800', label: 'Activo' },
      [EquipmentStatus.INACTIVE]: { color: 'bg-gray-100 text-gray-800', label: 'Inactivo' }
    };

    return (
      <Badge className={variants[status].color}>
        {variants[status].label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const InfoItem: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    value: string | null | undefined; 
    fallback?: string 
  }> = ({ icon, label, value, fallback = 'No especificado' }) => (
    <div className="flex items-start space-x-3">
      <div className="text-gray-400 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-base text-gray-900">{value || fallback}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with photo and basic info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {equipment.photos && equipment.photos.length > 0 && (
              <div className="flex-shrink-0">
                <div className="grid grid-cols-2 gap-2">
                  {equipment.photos.slice(0, 4).map((photo, index) => (
                    <img 
                      key={index}
                      src={photo} 
                      alt={`${equipment.name} - Imagen ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
                {equipment.photos.length > 4 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    +{equipment.photos.length - 4} más
                  </p>
                )}
              </div>
            )}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{equipment.name}</h2>
                <div className="mt-2">{getStatusBadge(equipment.status)}</div>
              </div>
              
              {equipment.description && (
                <div>
                  <p className="text-gray-600">{equipment.description}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Información del Equipo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={<Tag size={16} />}
              label="Categoría"
              value={equipment.category}
            />
            
            <InfoItem
              icon={<Hash size={16} />}
              label="Número de Serie"
              value={equipment.serialNumber}
            />
            
            <InfoItem
              icon={<Building size={16} />}
              label="Marca"
              value={equipment.brand}
            />
            
            <InfoItem
              icon={<Package size={16} />}
              label="Modelo"
              value={equipment.model}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dates Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Fechas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={<Calendar size={16} />}
              label="Fecha de Compra"
              value={formatDate(equipment.purchaseDate)}
            />
            
            <InfoItem
              icon={<Wrench size={16} />}
              label="Último Mantenimiento"
              value={formatDate(equipment.lastMaintenanceDate)}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Creado</p>
              <p className="text-base text-gray-900">
                {formatDate(equipment.createdAt)}
              </p>
            </div>
            
            {equipment.updatedAt && (
              <div>
                <p className="text-sm font-medium text-gray-600">Última Actualización</p>
                <p className="text-base text-gray-900">
                  {formatDate(equipment.updatedAt)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
