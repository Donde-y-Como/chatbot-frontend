import { useState } from 'react';
import { Check, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ProductStatus, ProductFilters } from '../types';
import { useGetUnits, useGetCategories, useGetProductTags } from '../hooks/useGetAuxiliaryData';

interface ProductFiltersComponentProps {
  onFiltersChange?: (filters: ProductFilters) => void;
  initialFilters?: ProductFilters;
}

export function ProductFiltersComponent({ 
  onFiltersChange,
  initialFilters = {}
}: ProductFiltersComponentProps) {
  const [localFilters, setLocalFilters] = useState<ProductFilters>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  // Obtener datos para los filtros
  const { data: units = [] } = useGetUnits();
  const { data: categories = [] } = useGetCategories();
  const { data: tags = [] } = useGetProductTags();

  // Contar filtros activos (excluyendo search)
  const activeFiltersCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'search') return false; // Excluir search del conteo
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  }).length;

  const handleApplyFilters = () => {
    onFiltersChange?.(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: ProductFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const handleClearLocalFilters = () => {
    setLocalFilters({});
  };

  const toggleArrayFilter = (
    key: 'categoryIds' | 'subcategoryIds' | 'tagIds' | 'unitIds',
    value: string
  ) => {
    const currentArray = localFilters[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setLocalFilters({
      ...localFilters,
      [key]: newArray.length > 0 ? newArray : undefined
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      {/* Filtros avanzados */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros avanzados</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLocalFilters}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

            {/* Estado */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estado</Label>
              <Select
                value={localFilters.status || "ALL"}
                onValueChange={(value) => {
                  setLocalFilters({
                    ...localFilters,
                    status: value && value !== "" && value !== "ALL" ? (value as ProductStatus) : undefined
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value={ProductStatus.ACTIVO}>Activo</SelectItem>
                  <SelectItem value={ProductStatus.INACTIVO}>Inactivo</SelectItem>
                  <SelectItem value={ProductStatus.SIN_STOCK}>Sin Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categorías */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categorías</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={localFilters.categoryIds?.includes(category.id) || false}
                        onCheckedChange={() => toggleArrayFilter('categoryIds', category.id)}
                      />
                      <Label 
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-normal"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unidades */}
            {units.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Unidades</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {units.map((unit) => (
                    <div key={unit.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`unit-${unit.id}`}
                        checked={localFilters.unitIds?.includes(unit.id) || false}
                        onCheckedChange={() => toggleArrayFilter('unitIds', unit.id)}
                      />
                      <Label 
                        htmlFor={`unit-${unit.id}`}
                        className="text-sm font-normal"
                      >
                        {unit.name} ({unit.abbreviation})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Etiquetas */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Etiquetas</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={localFilters.tagIds?.includes(tag.id) || false}
                        onCheckedChange={() => toggleArrayFilter('tagIds', tag.id)}
                      />
                      <Label 
                        htmlFor={`tag-${tag.id}`}
                        className="text-sm font-normal"
                      >
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button 
                onClick={handleApplyFilters} 
                size="sm" 
                className="flex-1"
              >
                <Check className="mr-2 h-4 w-4" />
                Aplicar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearFilters} 
                size="sm"
                className="flex-1"
              >
                Limpiar todo
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Mostrar filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          {localFilters.status && (
            <Badge variant="secondary" className="text-xs">
              Estado: {localFilters.status === ProductStatus.ACTIVO ? 'Activo' : localFilters.status === ProductStatus.INACTIVO ? 'Inactivo' : 'Sin Stock'}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-xs"
                onClick={() => {
                  const newFilters = { ...localFilters };
                  delete newFilters.status;
                  setLocalFilters(newFilters);
                  onFiltersChange?.(newFilters);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {localFilters.categoryIds?.map(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            return (
              <Badge key={categoryId} variant="secondary" className="text-xs">
                {category?.name || 'Categoría'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-xs"
                  onClick={() => {
                    const newFilters = {
                      ...localFilters,
                      categoryIds: localFilters.categoryIds?.filter(id => id !== categoryId)
                    };
                    if (newFilters.categoryIds?.length === 0) {
                      delete newFilters.categoryIds;
                    }
                    setLocalFilters(newFilters);
                    onFiltersChange?.(newFilters);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
