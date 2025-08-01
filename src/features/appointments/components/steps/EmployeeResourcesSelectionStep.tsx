import React, { useMemo, useState } from 'react'
import { CheckCircle, Loader2, Search, X, Package, Wrench, AlertCircle, Plus, Minus, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEquipment } from '@/features/tools/hooks/useEquipment'
import { useConsumables } from '@/features/tools/hooks/useConsumables'
import { Equipment, EquipmentStatus, Consumable } from '@/features/tools/types'
import { ConsumableUsage, EmployeeAvailable } from '../../types'

interface EmployeeResourcesSelectionStepProps {
  // Employee props
  availableEmployees: EmployeeAvailable[]
  loadingEmployees: boolean
  selectedEmployeeIds: string[]
  onEmployeeToggle: (employeeId: string) => void
  // Equipment & Consumables props
  selectedEquipmentIds: string[]
  consumableUsages: ConsumableUsage[]
  onEquipmentToggle: (equipmentId: string) => void
  onConsumableUsageUpdate: (consumableId: string, quantity: number) => void
  // Navigation props
  onNext: () => void
  onBack: () => void
  onCancel: (e?: React.MouseEvent) => void
}

/**
 * Step 3: Employee, Equipment and Consumables selection component
 */
export function EmployeeResourcesSelectionStep({
  availableEmployees,
  loadingEmployees,
  selectedEmployeeIds,
  onEmployeeToggle,
  selectedEquipmentIds,
  consumableUsages,
  onEquipmentToggle,
  onConsumableUsageUpdate,
  onNext,
  onBack,
  onCancel,
}: EmployeeResourcesSelectionStepProps) {
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('')
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('')
  const [consumablesSearchQuery, setConsumablesSearchQuery] = useState('')
  
  const { equipment, loading: loadingEquipment } = useEquipment()
  const { consumables, loading: loadingConsumables } = useConsumables()

  // Filtrar empleados por búsqueda
  const filteredEmployees = useMemo(() => {
    if (!employeeSearchQuery.trim()) return availableEmployees

    return availableEmployees.filter((employee) =>
      employee.name.toLowerCase().includes(employeeSearchQuery.toLowerCase())
    )
  }, [availableEmployees, employeeSearchQuery])

  // Filtrar solo equipos activos
  const activeEquipment = useMemo(() => {
    return equipment.filter((eq) => eq.status === EquipmentStatus.ACTIVE)
  }, [equipment])

  // Filtrar equipos por búsqueda
  const filteredEquipment = useMemo(() => {
    if (!equipmentSearchQuery.trim()) return activeEquipment

    return activeEquipment.filter((eq) =>
      eq.name.toLowerCase().includes(equipmentSearchQuery.toLowerCase()) ||
      eq.category?.toLowerCase().includes(equipmentSearchQuery.toLowerCase()) ||
      eq.brand?.toLowerCase().includes(equipmentSearchQuery.toLowerCase())
    )
  }, [activeEquipment, equipmentSearchQuery])

  // Filtrar consumibles por búsqueda
  const filteredConsumables = useMemo(() => {
    if (!consumablesSearchQuery.trim()) return consumables

    return consumables.filter((consumable) =>
      consumable.name.toLowerCase().includes(consumablesSearchQuery.toLowerCase()) ||
      consumable.category?.toLowerCase().includes(consumablesSearchQuery.toLowerCase()) ||
      consumable.brand?.toLowerCase().includes(consumablesSearchQuery.toLowerCase())
    )
  }, [consumables, consumablesSearchQuery])

  // Obtener cantidad actual de un consumible
  const getConsumableUsage = (consumableId: string): number => {
    const usage = consumableUsages.find(u => u.consumableId === consumableId)
    return usage?.quantity || 0
  }

  // Incrementar cantidad de consumible
  const incrementConsumable = (consumable: Consumable) => {
    const currentUsage = getConsumableUsage(consumable.id)
    if (currentUsage < consumable.stock) {
      onConsumableUsageUpdate(consumable.id, currentUsage + 1)
    }
  }

  // Decrementar cantidad de consumible
  const decrementConsumable = (consumable: Consumable) => {
    const currentUsage = getConsumableUsage(consumable.id)
    if (currentUsage > 0) {
      onConsumableUsageUpdate(consumable.id, currentUsage - 1)
    }
  }

  // Limpiar búsquedas
  const clearEmployeeSearch = () => setEmployeeSearchQuery('')
  const clearEquipmentSearch = () => setEquipmentSearchQuery('')
  const clearConsumablesSearch = () => setConsumablesSearchQuery('')

  return (
    <div className='space-y-4 h-[22rem]'>
      <div className='flex items-center justify-between'>
        <label className='text-sm font-medium block'>
          Empleados y Recursos (Opcional)
        </label>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Empleados
            {selectedEmployeeIds.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedEmployeeIds.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Equipos
            {selectedEquipmentIds.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedEquipmentIds.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="consumables" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Consumibles
            {consumableUsages.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {consumableUsages.reduce((total, usage) => total + usage.quantity, 0)}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab de Empleados */}
        <TabsContent value="employees" className="space-y-4">
          {availableEmployees.length > 0 ? (
            <>
              {/* Búsqueda de empleados */}
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <Search className='h-4 w-4 text-muted-foreground' />
                </div>
                <Input
                  type='text'
                  placeholder='Buscar empleado por nombre...'
                  value={employeeSearchQuery}
                  onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                  className='pl-10 pr-10'
                />
                {employeeSearchQuery && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='absolute inset-y-0 right-0 flex items-center pr-3 h-full'
                    onClick={clearEmployeeSearch}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>

              {/* Lista de empleados */}
              {filteredEmployees.length > 0 ? (
                <ScrollArea className='h-40 w-full rounded-md border'>
                  <div className='p-4'>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
                      {filteredEmployees.map((employee) => (
                        <Card
                          key={employee.id}
                          className={cn(
                            'cursor-pointer hover:border-primary transition-all',
                            {
                              'border-primary bg-primary/5':
                                selectedEmployeeIds.includes(employee.id),
                            }
                          )}
                          onClick={() => onEmployeeToggle(employee.id)}
                        >
                          <CardContent className='p-2'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <Avatar className='h-7 w-7'>
                                  <AvatarImage
                                    src={employee.photo}
                                    alt={employee.name}
                                    className='object-cover'
                                  />
                                  <AvatarFallback>
                                    {employee.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className='text-sm'>{employee.name}</p>
                                </div>
                              </div>
                              {selectedEmployeeIds.includes(employee.id) && (
                                <CheckCircle className='h-5 w-5 text-primary' />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className='flex flex-col items-center justify-center p-8 border rounded-md text-muted-foreground'>
                  <Search className='h-8 w-8 mb-2' />
                  <p className='text-center'>
                    No se encontraron empleados con ese nombre
                  </p>
                  <Button variant='link' onClick={clearEmployeeSearch} className='mt-2'>
                    Limpiar búsqueda
                  </Button>
                </div>
              )}
            </>
          ) : loadingEmployees ? (
            <div>
              <p className='mb-2 text-center text-sm text-muted-foreground'>
                Buscando empleados disponibles en el horario seleccionado...
              </p>
              <div className='flex justify-center'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center p-8 border rounded-md text-muted-foreground'>
              <User className='h-8 w-8 mb-2' />
              <p className='text-center'>
                No hay empleados disponibles para este horario
              </p>
              <p className='text-center text-sm mt-2'>
                Puedes continuar sin seleccionar empleados
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tab de Equipos */}
        <TabsContent value="equipment" className="space-y-4">
          {/* Búsqueda de equipos */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <Search className='h-4 w-4 text-muted-foreground' />
            </div>
            <Input
              type='text'
              placeholder='Buscar equipo por nombre, categoría o marca...'
              value={equipmentSearchQuery}
              onChange={(e) => setEquipmentSearchQuery(e.target.value)}
              className='pl-10 pr-10'
            />
            {equipmentSearchQuery && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute inset-y-0 right-0 flex items-center pr-3 h-full'
                onClick={clearEquipmentSearch}
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>

          {/* Lista de equipos */}
          {loadingEquipment ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredEquipment.length > 0 ? (
            <ScrollArea className='h-40 w-full rounded-md border'>
              <div className='p-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {filteredEquipment.map((eq) => (
                    <Card
                      key={eq.id}
                      className={cn(
                        'cursor-pointer hover:border-primary transition-all',
                        {
                          'border-primary bg-primary/5':
                            selectedEquipmentIds.includes(eq.id),
                        }
                      )}
                      onClick={() => onEquipmentToggle(eq.id)}
                    >
                      <CardContent className='p-3'>
                        <div className='flex items-center justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <Wrench className='h-4 w-4 text-muted-foreground' />
                              <p className='text-sm font-medium'>{eq.name}</p>
                            </div>
                            {eq.category && (
                              <p className='text-xs text-muted-foreground mt-1'>
                                {eq.category}
                              </p>
                            )}
                            {eq.brand && (
                              <p className='text-xs text-muted-foreground'>
                                {eq.brand}
                              </p>
                            )}
                          </div>
                          {selectedEquipmentIds.includes(eq.id) && (
                            <CheckCircle className='h-5 w-5 text-primary flex-shrink-0' />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className='flex flex-col items-center justify-center p-8 border rounded-md text-muted-foreground'>
              <Wrench className='h-8 w-8 mb-2' />
              <p className='text-center'>
                {equipmentSearchQuery ? 'No se encontraron equipos' : 'No hay equipos activos disponibles'}
              </p>
              {equipmentSearchQuery && (
                <Button variant='link' onClick={clearEquipmentSearch} className='mt-2'>
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tab de Consumibles */}
        <TabsContent value="consumables" className="space-y-4">
          {/* Búsqueda de consumibles */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <Search className='h-4 w-4 text-muted-foreground' />
            </div>
            <Input
              type='text'
              placeholder='Buscar consumible por nombre, categoría o marca...'
              value={consumablesSearchQuery}
              onChange={(e) => setConsumablesSearchQuery(e.target.value)}
              className='pl-10 pr-10'
            />
            {consumablesSearchQuery && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute inset-y-0 right-0 flex items-center pr-3 h-full'
                onClick={clearConsumablesSearch}
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>

          {/* Lista de consumibles */}
          {loadingConsumables ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredConsumables.length > 0 ? (
            <ScrollArea className='h-40 w-full rounded-md border'>
              <div className='p-4'>
                <div className='space-y-3'>
                  {filteredConsumables.map((consumable) => {
                    const currentUsage = getConsumableUsage(consumable.id)
                    const canIncrement = currentUsage < consumable.stock
                    const canDecrement = currentUsage > 0

                    return (
                      <Card key={consumable.id} className={cn(
                        'transition-all',
                        currentUsage > 0 && 'border-primary bg-primary/5'
                      )}>
                        <CardContent className='p-3'>
                          <div className='flex items-center justify-between'>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2'>
                                <Package className='h-4 w-4 text-muted-foreground' />
                                <p className='text-sm font-medium'>{consumable.name}</p>
                              </div>
                              <div className='flex items-center gap-4 mt-1'>
                                {consumable.category && (
                                  <p className='text-xs text-muted-foreground'>
                                    {consumable.category}
                                  </p>
                                )}
                                <div className='flex items-center gap-1'>
                                  <p className='text-xs text-muted-foreground'>
                                    Stock: {consumable.stock}
                                  </p>
                                  {consumable.stock === 0 && (
                                    <AlertCircle className='h-3 w-3 text-red-500' />
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                className='h-8 w-8 p-0'
                                onClick={() => decrementConsumable(consumable)}
                                disabled={!canDecrement}
                              >
                                <Minus className='h-4 w-4' />
                              </Button>
                              <span className='text-sm font-medium w-8 text-center'>
                                {currentUsage}
                              </span>
                              <Button
                                variant='outline'
                                size='sm'
                                className='h-8 w-8 p-0'
                                onClick={() => incrementConsumable(consumable)}
                                disabled={!canIncrement || consumable.stock === 0}
                              >
                                <Plus className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                          {consumable.stock === 0 && (
                            <div className='mt-2 p-2 bg-red-50 rounded-md border border-red-200'>
                              <p className='text-xs text-red-600'>
                                Sin stock disponible
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className='flex flex-col items-center justify-center p-8 border rounded-md text-muted-foreground'>
              <Package className='h-8 w-8 mb-2' />
              <p className='text-center'>
                {consumablesSearchQuery ? 'No se encontraron consumibles' : 'No hay consumibles disponibles'}
              </p>
              {consumablesSearchQuery && (
                <Button variant='link' onClick={clearConsumablesSearch} className='mt-2'>
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className='flex justify-between gap-2'>
        <div className='flex gap-2'>
          <Button variant='destructive' onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant='outline' onClick={onBack}>
            Atrás
          </Button>
        </div>
        <Button onClick={onNext}>Continuar</Button>
      </div>
    </div>
  )
}
