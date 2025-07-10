import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { DateTimePicker } from '@/components/ui/date-time-picker.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet.tsx'
import { CalendarDays, Filter, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { PaymentMethod, SalesFilters } from '../types'

interface SalesFiltersComponentProps {
  onFiltersChange: (filters: SalesFilters) => void
  currentFilters: SalesFilters
}

export function SalesFiltersComponent({ onFiltersChange, currentFilters }: SalesFiltersComponentProps) {
  const [filters, setFilters] = useState<SalesFilters>(currentFilters)
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof SalesFilters, value: any) => {
    const newFilters = { ...filters }
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    onFiltersChange(filters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    const clearedFilters: SalesFilters = {}
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(currentFilters).some(value => value !== undefined && value !== '')

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant={hasActiveFilters ? "default" : "outline"} size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 bg-white text-primary rounded-full px-1.5 py-0.5 text-xs font-semibold">
              {Object.values(currentFilters).filter(v => v !== undefined && v !== '').length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrar Ventas
          </SheetTitle>
          <SheetDescription>
            Usa los filtros para encontrar ventas específicas en tu historial.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Cliente ID */}
          <div className="space-y-2">
            <Label htmlFor="clientId">ID del Cliente</Label>
            <Input
              id="clientId"
              placeholder="Buscar por ID de cliente..."
              value={filters.clientId || ''}
              onChange={(e) => handleFilterChange('clientId', e.target.value)}
            />
          </div>

          <Separator />

          {/* Rango de Fechas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Rango de Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <DateTimePicker
                  htmlId="startDate"
                  defaultValue={filters.startDate ? new Date(filters.startDate) : undefined}
                  onChange={(date) => handleFilterChange('startDate', date?.toISOString())}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <DateTimePicker
                  htmlId="endDate"
                  defaultValue={filters.endDate ? new Date(filters.endDate) : undefined}
                  onChange={(date) => handleFilterChange('endDate', date?.toISOString())}
                />
              </div>
            </CardContent>
          </Card>

          {/* Método de Pago */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pago</Label>
            <Select 
              value={filters.paymentMethod || ''} 
              onValueChange={(value) => handleFilterChange('paymentMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los métodos</SelectItem>
                <SelectItem value={PaymentMethod.EFECTIVO}>💵 Efectivo</SelectItem>
                <SelectItem value={PaymentMethod.TARJETA}>💳 Tarjeta</SelectItem>
                <SelectItem value={PaymentMethod.TRANSFERENCIA}>🔄 Transferencia</SelectItem>
                <SelectItem value={PaymentMethod.CHEQUE}>📄 Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Paginación */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Opciones de Visualización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="limit">Límite</Label>
                  <Input
                    id="limit"
                    type="number"
                    placeholder="50"
                    min="1"
                    max="1000"
                    value={filters.limit || ''}
                    onChange={(e) => handleFilterChange('limit', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="offset">Desplazamiento</Label>
                  <Input
                    id="offset"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={filters.offset || ''}
                    onChange={(e) => handleFilterChange('offset', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex gap-2 pt-4">
            <Button onClick={applyFilters} className="flex-1">
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
