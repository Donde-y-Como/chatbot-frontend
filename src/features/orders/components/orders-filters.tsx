import { useState } from 'react';
import { CalendarDays, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { DateTimePicker } from '@/components/ui/date-time-picker.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet.tsx';
import { OrderStatus, PaymentMethod } from '@/features/store/types.ts';
import { OrdersFilters } from '../types';


interface OrdersFiltersComponentProps {
  onFiltersChange: (filters: OrdersFilters) => void
  currentFilters: OrdersFilters
}

export function OrdersFiltersComponent({ onFiltersChange, currentFilters }: OrdersFiltersComponentProps) {
  const [filters, setFilters] = useState<OrdersFilters>(currentFilters)
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (
    key: keyof OrdersFilters,
    value: any
  ) => {
    const newFilters = { ...filters }
    if (
      value === '' ||
      value === null ||
      value === undefined ||
      value === 'all'
    ) {
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
    const clearedFilters: OrdersFilters = {}
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
      
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrar Órdenes
          </SheetTitle>
          <SheetDescription>
            Usa los filtros para encontrar órdenes específicas en tu historial.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-full  pr-4">
          <div className="space-y-6 mt-6 pb-4">
          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="status">Estado de la Orden</Label>
            <Select 
              value={filters.status || ''} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">⏳ Pendiente</SelectItem>
                <SelectItem value="partial_paid">💰 Parcialmente Pagado</SelectItem>
                <SelectItem value="paid">✅ Pagado</SelectItem>
                <SelectItem value="cancelled">❌ Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                <SelectItem value="all">Todos los métodos</SelectItem>
                <SelectItem value="cash">💵 Efectivo</SelectItem>
                <SelectItem value="credit_card">💳 Tarjeta de Crédito</SelectItem>
                <SelectItem value="debit_card">💳 Tarjeta de Débito</SelectItem>
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

          </div>
        </ScrollArea>

        {/* Botones de Acción */}
        <div className="flex gap-2 pt-4 border-t mt-4">
          <Button onClick={applyFilters} className="flex-1">
            Aplicar Filtros
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}