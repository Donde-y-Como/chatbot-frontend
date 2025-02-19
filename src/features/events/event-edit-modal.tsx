import * as React from 'react'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker.tsx'
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  EndCondition,
  EventPrimitives,
  Frequency,
} from '@/features/events/types'

type EditableEvent = Partial<EventPrimitives>

export function EventEditModal({
  event,
  open,
  onClose,
  onSave,
}: {
  event: EventPrimitives
  open: boolean
  onClose: () => void
  onSave: (changes: EditableEvent) => void
}) {
  const [changes, setChanges] = React.useState<EditableEvent>({})

  const updateField = <K extends keyof EventPrimitives>(
    field: K,
    value: EventPrimitives[K]
  ) => {
    setChanges((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>

        <DialogDescription className="sr-only">Editar evento</DialogDescription>

        <Tabs defaultValue='general' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='capacity'>Capacidad</TabsTrigger>
            <TabsTrigger value='schedule'>Horario</TabsTrigger>
          </TabsList>

          <TabsContent value='general' className='space-y-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Nombre del Evento</Label>
              <Input
                id='name'
                placeholder='Ej: Clase de Yoga'
                defaultValue={event.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Descripción</Label>
              <Textarea
                id='description'
                placeholder='Describe tu evento...'
                defaultValue={event.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='location'>Ubicación</Label>
              <Textarea
                id='location'
                defaultValue={event.location}
                placeholder='Virtual o dirección física'
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label>Precio</Label>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='number'
                  placeholder='0.00'
                  defaultValue={event.price.amount}
                  onChange={(e) =>
                    updateField('price', {
                      currency: changes.price?.currency ?? event.price.currency,
                      amount: parseFloat(e.target.value),
                    })
                  }
                />
                <Select
                  defaultValue={event.price.currency}
                  onValueChange={(value) =>
                    updateField('price', {
                      amount: changes.price?.amount ?? event.price.amount,
                      currency: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='USD'>USD</SelectItem>
                    <SelectItem value='EUR'>EUR</SelectItem>
                    <SelectItem value='MXN'>MXN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='capacity' className='space-y-4'>
            <div className='grid gap-2'>
              <Label>Límite de Capacidad</Label>
              <div className='flex items-center gap-4'>
                <Switch
                  id='isLimited'
                  checked={
                    changes.capacity?.isLimited ?? event.capacity.isLimited
                  }
                  onCheckedChange={(checked) =>
                    updateField('capacity', {
                      ...event.capacity,
                      isLimited: checked,
                      maxCapacity: checked
                        ? event.capacity.maxCapacity || 1
                        : undefined,
                    })
                  }
                />
                <Label htmlFor='isLimited'>Capacidad Limitada</Label>
              </div>

              {(changes.capacity?.isLimited ?? event.capacity.isLimited) && (
                <div className='grid gap-2'>
                  <Label htmlFor='maxCapacity'>Capacidad Máxima</Label>
                  <Input
                    id='maxCapacity'
                    type='number'
                    min='1'
                    placeholder='Número de participantes'
                    defaultValue={event.capacity.maxCapacity ?? 0}
                    onChange={(e) =>
                      updateField('capacity', {
                        isLimited: true,
                        maxCapacity: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='schedule' className='space-y-4'>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label>Duración</Label>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <Label htmlFor='startAt'>Inicio</Label>
                    <DateTimePicker
                      htmlId={'startAt'}
                      defaultValue={new Date(event.duration.startAt)}
                      onChange={(date: Date) => {
                        updateField('duration', {
                          endAt:
                            changes.duration?.endAt ?? event.duration.endAt,
                          startAt: date.toISOString(),
                        })
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor='endAt'>Fin</Label>
                    <DateTimePicker
                      htmlId={'endAt'}
                      defaultValue={new Date(event.duration.endAt)}
                      onChange={(date: Date) => {
                        updateField('duration', {
                          startAt:
                            changes.duration?.startAt ?? event.duration.startAt,
                          endAt: date.toISOString(),
                        })
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className='grid gap-2'>
                <Label>Recurrencia</Label>
                <Select
                  defaultValue={
                    changes.recurrence?.frequency ?? event.recurrence.frequency
                  }
                  onValueChange={(value: Frequency) =>
                    updateField('recurrence', {
                      frequency: value,
                      endCondition:
                        value === 'never'
                          ? null
                          : event.recurrence.endCondition,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='never'>Nunca</SelectItem>
                    <SelectItem value='daily'>Diario</SelectItem>
                    <SelectItem value='weekly'>Semanal</SelectItem>
                    <SelectItem value='monthly'>Mensual</SelectItem>
                    <SelectItem value='yearly'>Anual</SelectItem>
                  </SelectContent>
                </Select>

                {(changes.recurrence?.frequency ??
                  event.recurrence.frequency) !== 'never' && (
                  <div className='grid gap-2'>
                    <Label>Finalización</Label>
                    <Select
                      defaultValue={
                        (changes.recurrence?.endCondition?.type ??
                          event.recurrence.endCondition?.type) ||
                        'null'
                      }
                      onValueChange={(value) => {
                        let endCondition: EndCondition = null
                        if (value === 'occurrences') {
                          endCondition = { type: 'occurrences', occurrences: 1 }
                        } else if (value === 'date') {
                          endCondition = { type: 'date', until: new Date() }
                        }
                        updateField('recurrence', {
                          ...event.recurrence,
                          ...changes.recurrence,
                          endCondition,
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='null'>Sin fecha final</SelectItem>
                        <SelectItem value='occurrences'>
                          Después de varias ocurrencias
                        </SelectItem>
                        <SelectItem value='date'>
                          En fecha específica
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {(changes.recurrence?.endCondition?.type ??
                      event.recurrence.endCondition?.type) ===
                      'occurrences' && (
                      <div className='grid gap-2'>
                        <Label>Número de Ocurrencias</Label>
                        <Input
                          type='number'
                          min='1'
                          placeholder='Ej: 10'
                          value={
                            changes.recurrence?.endCondition?.type ===
                            'occurrences'
                              ? changes.recurrence.endCondition.occurrences
                              : event.recurrence.endCondition?.type ===
                                  'occurrences'
                                ? event.recurrence.endCondition.occurrences
                                : ''
                          }
                          onChange={(e) =>
                            updateField('recurrence', {
                              ...event.recurrence,
                              ...changes.recurrence,
                              endCondition: {
                                type: 'occurrences',
                                occurrences: parseInt(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    )}

                    {(changes.recurrence?.endCondition?.type ??
                      event.recurrence.endCondition?.type) === 'date' && (
                      <div className='grid gap-2'>
                        <Label>Fecha Final</Label>
                        <Input
                          type='date'
                          value={
                            changes.recurrence?.endCondition?.type === 'date'
                              ? changes.recurrence.endCondition.until
                                  .toISOString()
                                  .slice(0, 10)
                              : event.recurrence.endCondition?.type === 'date'
                                ? new Date(event.recurrence.endCondition.until)
                                    .toISOString()
                                    .slice(0, 10)
                                : ''
                          }
                          onChange={(e) =>
                            updateField('recurrence', {
                              ...event.recurrence,
                              ...changes.recurrence,
                              endCondition: {
                                type: 'date',
                                until: new Date(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave(changes)
              onClose()
            }}
          >
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
