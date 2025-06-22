import React, { useState, useEffect } from 'react'
import { X, Filter, RotateCcw, CalendarIcon } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { Checkbox } from '../../../components/ui/checkbox'
import { Calendar as CalendarComponent } from '../../../components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { POSFilters, AuxiliaryData, DateRange } from '../types'
import { ProductStatus as ProductsProductStatus } from '../../products/types'
import { ProductStatus as GlobalProductStatus } from '../../../types/global'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'

type StatusValue = ProductsProductStatus | GlobalProductStatus | 'ALL'

const mapStatusValue = (value: string): { products?: ProductsProductStatus; services?: GlobalProductStatus } => {
  switch (value) {
    case ProductsProductStatus.ACTIVO:
      return { products: ProductsProductStatus.ACTIVO, services: GlobalProductStatus.ACTIVE }
    case ProductsProductStatus.INACTIVO:
      return { products: ProductsProductStatus.INACTIVO, services: GlobalProductStatus.INACTIVE }
    case ProductsProductStatus.SIN_STOCK:
      return { products: ProductsProductStatus.SIN_STOCK }
    default:
      return {}
  }
}

interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: POSFilters
  onFiltersChange: (filters: Partial<POSFilters>) => void
  onResetFilters: () => void
  auxiliaryData: AuxiliaryData
}

export function AdvancedFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onResetFilters,
  auxiliaryData
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<POSFilters>(filters)
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  if (!isOpen) return null

  const handleApplyFilters = () => {
    const filtersToApply = {
      ...localFilters,
      isActive: true
    }
    onFiltersChange(filtersToApply)
    onClose()
  }

  const handleResetFilters = () => {
    const resetFilters: POSFilters = {
      search: '',
      category: 'TODOS',
      isActive: false
    }
    setLocalFilters(resetFilters)
    onResetFilters()
    onClose()
  }

  const updateLocalFilters = (updates: Partial<POSFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...updates }))
  }

  const toggleTag = (tagId: string) => {
    const currentTags = localFilters.tags || []
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId]
    
    updateLocalFilters({ tags: newTags })
  }

  const toggleCategory = (categoryId: string) => {
    const currentCategories = localFilters.categories || []
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId]
    
    updateLocalFilters({ categories: newCategories })
  }

  const toggleSubcategory = (subcategoryId: string) => {
    const currentSubcategories = localFilters.subcategories || []
    const newSubcategories = currentSubcategories.includes(subcategoryId)
      ? currentSubcategories.filter(id => id !== subcategoryId)
      : [...currentSubcategories, subcategoryId]
    
    updateLocalFilters({ subcategories: newSubcategories })
  }

  const toggleUnidadMedida = (unidadId: string) => {
    const currentUnidades = localFilters.unidadMedida || []
    const newUnidades = currentUnidades.includes(unidadId)
      ? currentUnidades.filter(id => id !== unidadId)
      : [...currentUnidades, unidadId]
    
    updateLocalFilters({ unidadMedida: newUnidades })
  }

  const formatDateRange = () => {
    const dateRange = localFilters.dateRange
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
    } else if (dateRange?.from) {
      return `Desde ${format(dateRange.from, 'dd/MM/yyyy')}`
    } else if (dateRange?.to) {
      return `Hasta ${format(dateRange.to, 'dd/MM/yyyy')}`
    }
    return 'Rango de fechas'
  }

  const clearDateRange = () => {
    updateLocalFilters({ dateRange: { from: null, to: null } })
  }

  const toggleUnit = (unitId: string) => {
    const currentUnits = localFilters.units || []
    const newUnits = currentUnits.includes(unitId)
      ? currentUnits.filter(id => id !== unitId)
      : [...currentUnits, unitId]
    
    updateLocalFilters({ units: newUnits })
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel de filtros */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-background border-l border-border shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filtros Avanzados</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenido de filtros */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Estado y configuraciones por categoría */}
          {localFilters.category !== 'TODOS' && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Estado</Label>
                <Select
                  value={localFilters.status || 'ALL'}
                  onValueChange={(value) => {
                    if (value === 'ALL') {
                      updateLocalFilters({ status: undefined })
                    } else {
                      const statusMap = mapStatusValue(value)
                      if (statusMap.products) {
                        updateLocalFilters({ status: statusMap.products })
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    <SelectItem value={ProductsProductStatus.ACTIVO}>Activo</SelectItem>
                    <SelectItem value={ProductsProductStatus.INACTIVO}>Inactivo</SelectItem>
                    <SelectItem value={ProductsProductStatus.SIN_STOCK}>Sin Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />
            </>
          )}

          {/* Filtros específicos para EVENTOS */}
          {(localFilters.category === 'TODOS' || localFilters.category === 'EVENTOS') && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Configuración de Eventos</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="activeOnly"
                      checked={localFilters.activeOnly || false}
                      onCheckedChange={(checked) =>
                        updateLocalFilters({ activeOnly: checked === true })
                      }
                    />
                    <Label htmlFor="activeOnly" className="text-sm">
                      Solo eventos próximos
                    </Label>
                  </div>
                </div>
              </div>

              {/* Filtro de fechas para eventos */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Rango de Fechas (Eventos)</Label>
                <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-full justify-between ${
                        localFilters.dateRange?.from || localFilters.dateRange?.to 
                          ? 'text-primary' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span className="truncate">{formatDateRange()}</span>
                      </div>
                      {(localFilters.dateRange?.from || localFilters.dateRange?.to) && (
                        <X
                          className="h-4 w-4 ml-1 opacity-60 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearDateRange()
                          }}
                        />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={localFilters.dateRange?.from || new Date()}
                      selected={{
                        from: localFilters.dateRange?.from as Date,
                        to: localFilters.dateRange?.to as Date
                      }}
                      onSelect={(range) => {
                        updateLocalFilters({
                          dateRange: {
                            from: range?.from || null,
                            to: range?.to || null
                          }
                        })
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Separator />
            </>
          )}
          {/* Rango de precios */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Rango de Precios</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                  Mínimo
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  placeholder="$0"
                  value={localFilters.priceRange?.min?.toString() || ''}
                  onChange={(e) => {
                    const value = e.target.value.trim()
                    const min = value && !isNaN(parseFloat(value)) ? parseFloat(value) : undefined
                    updateLocalFilters({
                      priceRange: {
                        ...localFilters.priceRange,
                        min
                      }
                    })
                  }}
                />
              </div>
              <div>
                <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                  Máximo
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="Sin límite"
                  value={localFilters.priceRange?.max?.toString() || ''}
                  onChange={(e) => {
                    const value = e.target.value.trim()
                    const max = value && !isNaN(parseFloat(value)) ? parseFloat(value) : undefined
                    updateLocalFilters({
                      priceRange: {
                        ...localFilters.priceRange,
                        max
                      }
                    })
                  }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Etiquetas */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Etiquetas ({auxiliaryData.tags.length})
            </Label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {auxiliaryData.tags.map((tag) => {
                const isSelected = localFilters.tags?.includes(tag.id) || false
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                    }`}
                    onClick={() => toggleTag(tag.id)}
                    style={{
                      backgroundColor: isSelected && tag.color ? tag.color : undefined
                    }}
                  >
                    {tag.name}
                  </Badge>
                )
              })}
              {auxiliaryData.tags.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay etiquetas disponibles
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Categorías */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Categorías ({auxiliaryData.categories.length})
            </Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {auxiliaryData.categories.map((category) => {
                const isSelected = localFilters.categories?.includes(category.id) || false
                return (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                )
              })}
              {auxiliaryData.categories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay categorías disponibles
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Subcategorías */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Subcategorías ({auxiliaryData.subcategories?.length || 0})
            </Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {auxiliaryData.subcategories?.map((subcategory) => {
                const isSelected = localFilters.subcategories?.includes(subcategory.id) || false
                return (
                  <div key={subcategory.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subcategory-${subcategory.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleSubcategory(subcategory.id)}
                    />
                    <Label
                      htmlFor={`subcategory-${subcategory.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {subcategory.name}
                    </Label>
                  </div>
                )
              }) || []}
              {(!auxiliaryData.subcategories || auxiliaryData.subcategories.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No hay subcategorías disponibles
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Unidades */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Unidades (Productos) ({auxiliaryData.units.length})
            </Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {auxiliaryData.units.map((unit) => {
                const isSelected = localFilters.units?.includes(unit.id) || false
                return (
                  <div key={unit.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`unit-${unit.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleUnit(unit.id)}
                    />
                    <Label
                      htmlFor={`unit-${unit.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {unit.name} ({unit.abbreviation})
                    </Label>
                  </div>
                )
              })}
              {auxiliaryData.units.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay unidades disponibles
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Unidades de Medida (Servicios) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Unidades de Medida (Servicios) ({auxiliaryData.unidadesMedida?.length || 0})
            </Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {auxiliaryData.unidadesMedida?.map((unidad) => {
                const isSelected = localFilters.unidadMedida?.includes(unidad.id) || false
                return (
                  <div key={unidad.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`unidad-${unidad.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleUnidadMedida(unidad.id)}
                    />
                    <Label
                      htmlFor={`unidad-${unidad.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {unidad.name} ({unidad.abbreviation})
                    </Label>
                  </div>
                )
              }) || []}
              {(!auxiliaryData.unidadesMedida || auxiliaryData.unidadesMedida.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No hay unidades de medida disponibles
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="border-t border-border p-4 space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={handleApplyFilters}
              className="flex-1"
            >
              Aplicar Filtros
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="px-3"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </>
  )
}