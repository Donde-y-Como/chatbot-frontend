import React, { useMemo, useState } from 'react'
import { CheckCircle, Loader2, Search, X, Package, Wrench, AlertCircle, Plus, Minus, User, Clock, CalendarX } from 'lucide-react'
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
import { ConsumableUsage, EmployeeAvailabilityInfo } from '../../types'

// Helper function to format time in minutes to HH:MM format
function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

interface EmployeeResourcesSelectionStepProps {
  // Employee props
  availableEmployees: EmployeeAvailabilityInfo[]
  loadingEmployees: boolean
  selectedEmployeeIds: string[]
  onEmployeeToggle: (employeeId: string) => void
  // Equipment & Consumables props
  selectedEquipmentIds: string[]
  consumableUsages: ConsumableUsage[]
  inheritedEquipmentIds: string[] // Nuevos props para identificar heredados
  inheritedConsumableUsages: ConsumableUsage[]
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
  inheritedEquipmentIds,
  inheritedConsumableUsages,
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

  // Obtener equipos seleccionados (incluye los que están en la cita pero ya no están activos)
  const selectedEquipmentItems = useMemo(() => {
    return equipment.filter(eq => selectedEquipmentIds.includes(eq.id))
  }, [equipment, selectedEquipmentIds])

  // Combinar equipos activos con equipos ya seleccionados para mostrar
  const equipmentToShow = useMemo(() => {
    const activeIds = new Set(activeEquipment.map(eq => eq.id))
    const selectedNotActive = selectedEquipmentItems.filter(eq => !activeIds.has(eq.id))
    return [...activeEquipment, ...selectedNotActive]
  }, [activeEquipment, selectedEquipmentItems])

  // Filtrar equipos por búsqueda
  const filteredEquipment = useMemo(() => {
    if (!equipmentSearchQuery.trim()) return equipmentToShow

    return equipmentToShow.filter((eq) =>
      eq.name.toLowerCase().includes(equipmentSearchQuery.toLowerCase()) ||
      eq.category?.toLowerCase().includes(equipmentSearchQuery.toLowerCase()) ||
      eq.brand?.toLowerCase().includes(equipmentSearchQuery.toLowerCase())
    )
  }, [equipmentToShow, equipmentSearchQuery])

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
  
  // Obtener cantidad heredada de un consumible
  const getInheritedConsumableUsage = (consumableId: string): number => {
    const usage = inheritedConsumableUsages.find(u => u.consumableId === consumableId)
    return usage?.quantity || 0
  }
  
  // Verificar si un equipo es heredado del servicio
  const isEquipmentInherited = (equipmentId: string): boolean => {
    return inheritedEquipmentIds.includes(equipmentId)
  }
  
  // Verificar si un consumible tiene cantidad heredada
  const isConsumableInherited = (consumableId: string): boolean => {
    return getInheritedConsumableUsage(consumableId) > 0
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
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      {filteredEmployees.map((employee) => {
                        const hasUnavailableSlots = employee.unavailableSlots && employee.unavailableSlots.length > 0
                        return (
                          <Card
                            key={employee.id}
                            className={cn(
                              'cursor-pointer hover:border-primary transition-all',
                              {
                                'border-primary bg-primary/5':
                                  selectedEmployeeIds.includes(employee.id),
                                'border-orange-400 bg-orange-50 dark:bg-orange-950':
                                  hasUnavailableSlots && !selectedEmployeeIds.includes(employee.id),
                              }
                            )}
                            onClick={() => onEmployeeToggle(employee.id)}
                          >
                            <CardContent className='p-3'>
                              <div className='flex items-start justify-between mb-2'>
                                <div className='flex items-center gap-2'>
                                  <Avatar className='h-8 w-8'>
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
                                    <p className='text-sm font-medium'>{employee.name}</p>
                                  </div>
                                </div>
                                {selectedEmployeeIds.includes(employee.id) && (
                                  <CheckCircle className='h-5 w-5 text-primary flex-shrink-0' />
                                )}
                              </div>

                              {/* Unavailable slots information */}
                              {hasUnavailableSlots && (
                                <div className='mt-2 space-y-1'>
                                  <p className='text-xs font-medium text-muted-foreground flex items-center gap-1'>
                                    <AlertCircle className='h-3 w-3' />
                                    No disponible:
                                  </p>
                                  <div className='space-y-1'>
                                    {employee.unavailableSlots.slice(0, 3).map((slot, idx) => (
                                      <div key={idx} className='flex items-center gap-1 text-xs'>
                                        {slot.reason === 'appointment' ? (
                                          <Clock className='h-3 w-3 text-orange-600' />
                                        ) : (
                                          <CalendarX className='h-3 w-3 text-orange-600' />
                                        )}
                                        <span className='text-orange-700 dark:text-orange-400'>
                                          {formatMinutesToTime(slot.startAt)} - {formatMinutesToTime(slot.endAt)}
                                        </span>
                                        <Badge variant='outline' className='text-[10px] px-1 py-0 h-4'>
                                          {slot.reason === 'appointment' ? 'Cita' : 'Horario'}
                                        </Badge>
                                      </div>
                                    ))}
                                    {employee.unavailableSlots.length > 3 && (
                                      <p className='text-[10px] text-muted-foreground'>
                                        +{employee.unavailableSlots.length - 3} más
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {!hasUnavailableSlots && (
                                <div className='mt-2'>
                                  <Badge variant='outline' className='text-xs bg-green-100 border-green-400 dark:bg-green-900 dark:border-green-500 dark:text-green-300'>
                                    Completamente disponible
                                  </Badge>
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
                  {filteredEquipment.map((eq) => {
                    const isInherited = isEquipmentInherited(eq.id)
                    return (
                      <Card
                        key={eq.id}
                        className={cn(
                          'cursor-pointer hover:border-primary transition-all',
                          {
                            'border-primary bg-primary/5':
                              selectedEquipmentIds.includes(eq.id),
                            'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400': isInherited && !selectedEquipmentIds.includes(eq.id), // Estilo para heredados
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
                                {isInherited && (
                                  <Badge variant='outline' className='text-xs bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-500 dark:text-blue-300'>
                                    Del servicio
                                  </Badge>
                                )}
                                {eq.status !== EquipmentStatus.ACTIVE && (
                                  <Badge variant='secondary' className='text-xs'>
                                    {eq.status}
                                  </Badge>
                                )}
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
                    )
                  })}
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
                    const inheritedUsage = getInheritedConsumableUsage(consumable.id)
                    const isInherited = isConsumableInherited(consumable.id)
                    const canIncrement = currentUsage < consumable.stock
                    const canDecrement = currentUsage > 0

                    return (
                      <Card key={consumable.id} className={cn(
                        'transition-all',
                        currentUsage > 0 && 'border-primary bg-primary/5',
                        isInherited && currentUsage === inheritedUsage && 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400' // Estilo para heredados sin cambios
                      )}>
                        <CardContent className='p-3'>
                          <div className='flex items-center justify-between'>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2'>
                                <Package className='h-4 w-4 text-muted-foreground' />
                                <p className='text-sm font-medium'>{consumable.name}</p>
                                {isInherited && (
                                  <Badge variant='outline' className='text-xs bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-500 dark:text-blue-300'>
                                    Del servicio: {inheritedUsage}
                                  </Badge>
                                )}
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
