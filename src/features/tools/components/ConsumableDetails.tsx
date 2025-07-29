import React from 'react';
import { Consumable } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Tag, Building, Hash, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConsumableDetailsProps {
  consumable: Consumable;
}

export const ConsumableDetails: React.FC<ConsumableDetailsProps> = ({ consumable }) => {
  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <AlertTriangle size={12} className="mr-1" />
          Sin stock
        </Badge>
      );
    } else if (stock < 10) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <AlertTriangle size={12} className="mr-1" />
          Stock bajo ({stock} unidades)
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Stock normal ({stock} unidades)
        </Badge>
      );
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDate = (dateString?: string) => {
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
    value: string | number | null | undefined; 
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
            {consumable.photo && (
              <div className="flex-shrink-0">
                <img 
                  src={consumable.photo} 
                  alt={consumable.name}
                  className="w-32 h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{consumable.name}</h2>
                <div className="mt-2">{getStockBadge(consumable.stock)}</div>
              </div>
              
              {consumable.description && (
                <div>
                  <p className="text-gray-600">{consumable.description}</p>
                </div>
              )}

              {/* Stock prominente */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="text-gray-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Stock Actual</p>
                    <p className={`text-2xl font-bold ${getStockColor(consumable.stock)}`}>
                      {consumable.stock} unidades
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            Información del Producto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={<Tag size={16} />}
              label="Categoría"
              value={consumable.category}
            />
            
            <InfoItem
              icon={<Building size={16} />}
              label="Marca"
              value={consumable.brand}
            />
            
            <InfoItem
              icon={<Hash size={16} />}
              label="Modelo"
              value={consumable.model}
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
                {formatDate(consumable.createdAt)}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600">Última Actualización</p>
              <p className="text-base text-gray-900">
                {formatDate(consumable.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Alert */}
      {(consumable.stock === 0 || consumable.stock < 10) && (
        <Card className={`border-l-4 ${consumable.stock === 0 ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle 
                className={consumable.stock === 0 ? 'text-red-500' : 'text-yellow-500'} 
                size={20} 
              />
              <div>
                <h4 className="font-semibold text-gray-900">
                  {consumable.stock === 0 ? 'Producto sin stock' : 'Stock bajo'}
                </h4>
                <p className="text-sm text-gray-600">
                  {consumable.stock === 0 
                    ? 'Este consumible se encuentra agotado. Considera reabastecerlo pronto.' 
                    : 'El stock está por debajo del mínimo recomendado. Considera reordenar pronto.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
