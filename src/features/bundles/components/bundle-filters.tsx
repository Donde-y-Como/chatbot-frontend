import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductStatus } from '@/features/products/types';
import { BundleFilters } from '../types';

interface BundleFiltersComponentProps {
  onFiltersChange: (filters: BundleFilters) => void;
  initialFilters: BundleFilters;
}

export function BundleFiltersComponent({ 
  onFiltersChange, 
  initialFilters 
}: BundleFiltersComponentProps) {
  const [localFilters, setLocalFilters] = useState<BundleFilters>(initialFilters);

  const updateFilter = (key: keyof BundleFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: BundleFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar paquetes por nombre, SKU o descripción..."
            value={localFilters.query || ''}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro por estado */}
        <Select
          value={localFilters.status || undefined}
          onValueChange={(value) => updateFilter('status', value === 'ALL' ? undefined : value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value={ProductStatus.ACTIVO}>Activo</SelectItem>
            <SelectItem value={ProductStatus.INACTIVO}>Inactivo</SelectItem>
            <SelectItem value={ProductStatus.SIN_STOCK}>Sin Stock</SelectItem>
          </SelectContent>
        </Select>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Badges de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {localFilters.query && (
            <Badge variant="secondary" className="gap-1">
              <Search className="h-3 w-3" />
              Búsqueda: {localFilters.query}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => updateFilter('query', undefined)}
              />
            </Badge>
          )}
          
          {localFilters.status && (
            <Badge variant="secondary" className="gap-1">
              <Filter className="h-3 w-3" />
              Estado: {localFilters.status}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => updateFilter('status', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}