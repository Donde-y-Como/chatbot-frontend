import { useState } from 'react';
import { Check, Filter, X, ChevronRight, ChevronDown, FolderOpen, Folder } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductStatus, ProductFilters } from '../types';
import { useGetUnits, useGetCategories, useGetProductTags } from '../hooks/useGetAuxiliaryData';
import { organizeCategoriesHierarchy, getCategoryFullName } from '../utils/categoryUtils';

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Obtener datos para los filtros
  const { data: units = [] } = useGetUnits();
  const { data: categories = [] } = useGetCategories();
  const { data: tags = [] } = useGetProductTags();

  // Filtrar solo las categorías padre (que no tienen parentCategoryId)
  // El backend ya devuelve las subcategorías anidadas en la propiedad 'subcategories'
  const parentCategories = categories.filter(cat => !cat.parentCategoryId);

  // Contar filtros activos (excluyendo search)
  const activeFiltersCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'search') return false; // Excluir search del conteo
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  }).length;

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

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

  const removeFilterItem = (key: keyof ProductFilters, value?: string) => {
    if (key === 'status') {
      const newFilters = { ...localFilters };
      delete newFilters.status;
      setLocalFilters(newFilters);
      onFiltersChange?.(newFilters);
    } else if (value && Array.isArray(localFilters[key])) {
      const newFilters = {
        ...localFilters,
        [key]: (localFilters[key] as string[])?.filter(id => id !== value)
      };
      if ((newFilters[key] as string[])?.length === 0) {
        delete newFilters[key];
      }
      setLocalFilters(newFilters);
      onFiltersChange?.(newFilters);
    }
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
        <PopoverContent className="w-96 p-4" align="end">
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

            {/* Categorías Principales */}
            {parentCategories.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Categorías Principales
                </Label>
                <ScrollArea className="max-h-32 w-full">
                  <div className="space-y-2">
                    {parentCategories.map((parentCategory) => (
                      <div key={parentCategory.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${parentCategory.id}`}
                          checked={localFilters.categoryIds?.includes(parentCategory.id) || false}
                          onCheckedChange={() => toggleArrayFilter('categoryIds', parentCategory.id)}
                        />
                        <Label 
                          htmlFor={`category-${parentCategory.id}`}
                          className="text-sm font-normal flex-1"
                        >
                          {parentCategory.name}
                        </Label>
                        {parentCategory.subcategories && parentCategory.subcategories.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {parentCategory.subcategories.length}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Subcategorías */}
            {parentCategories.some(cat => cat.subcategories && cat.subcategories.length > 0) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Subcategorías
                </Label>
                <ScrollArea className="max-h-40 w-full">
                  <div className="space-y-2">
                    {parentCategories.map((parentCategory) => (
                      parentCategory.subcategories && parentCategory.subcategories.length > 0 && (
                        <div key={parentCategory.id} className="space-y-2">
                          {/* Header de la categoría padre */}
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleCategoryExpansion(parentCategory.id)}
                            >
                              {expandedCategories.has(parentCategory.id) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>
                            <span className="text-xs font-medium text-muted-foreground">
                              {parentCategory.name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {parentCategory.subcategories.length}
                            </Badge>
                          </div>
                          
                          {/* Subcategorías */}
                          {expandedCategories.has(parentCategory.id) && (
                            <div className="space-y-2 ml-6">
                              {parentCategory.subcategories.map((subcategory) => (
                                <div key={subcategory.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`subcategory-${subcategory.id}`}
                                    checked={localFilters.subcategoryIds?.includes(subcategory.id) || false}
                                    onCheckedChange={() => toggleArrayFilter('subcategoryIds', subcategory.id)}
                                  />
                                  <Label 
                                    htmlFor={`subcategory-${subcategory.id}`}
                                    className="text-sm font-normal"
                                  >
                                    {subcategory.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Unidades */}
            {units.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Unidades</Label>
                <ScrollArea className="max-h-32 w-full">
                  <div className="space-y-2">
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
                </ScrollArea>
              </div>
            )}

            {/* Etiquetas */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Etiquetas</Label>
                <ScrollArea className="max-h-32 w-full">
                  <div className="space-y-2">
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
                </ScrollArea>
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
                onClick={() => removeFilterItem('status')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {localFilters.categoryIds?.map(categoryId => {
            const category = categories.find(c => c.id === categoryId && !c.parentCategoryId);
            return category ? (
              <Badge key={categoryId} variant="secondary" className="text-xs">
                📁 {category.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-xs"
                  onClick={() => removeFilterItem('categoryIds', categoryId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null;
          })}

          {localFilters.subcategoryIds?.map(subcategoryId => {
            // Buscar la subcategoría en todas las categorías padre
            let fullName = 'Subcategoría no encontrada';
            for (const parentCategory of parentCategories) {
              if (parentCategory.subcategories) {
                const subcategory = parentCategory.subcategories.find(sub => sub.id === subcategoryId);
                if (subcategory) {
                  fullName = `${parentCategory.name} > ${subcategory.name}`;
                  break;
                }
              }
            }
            return (
              <Badge key={subcategoryId} variant="secondary" className="text-xs">
                📂 {fullName}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-xs"
                  onClick={() => removeFilterItem('subcategoryIds', subcategoryId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}

          {localFilters.unitIds?.map(unitId => {
            const unit = units.find(u => u.id === unitId);
            return unit ? (
              <Badge key={unitId} variant="secondary" className="text-xs">
                📐 {unit.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-xs"
                  onClick={() => removeFilterItem('unitIds', unitId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null;
          })}

          {localFilters.tagIds?.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag ? (
              <Badge key={tagId} variant="secondary" className="text-xs">
                🏷️ {tag.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-xs"
                  onClick={() => removeFilterItem('tagIds', tagId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
