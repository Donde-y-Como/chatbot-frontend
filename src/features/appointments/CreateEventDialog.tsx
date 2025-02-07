import { useState } from 'react'
import { addDays, format } from 'date-fns'
import { now } from '@internationalized/date'
import { es } from 'date-fns/locale/es'
import { useMediaQuery } from 'react-responsive'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Calendar } from '@/components/ui/calendar.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Input } from '@/components/ui/input.tsx'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { appointmentService } from '@/features/appointments/appointmentService.ts'
import { Event } from '@/features/appointments/types.ts'

export function CreateEventDialog() {
  // Estado del formulario
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState<Date>(
    now('America/Mexico_City').toDate()
  )
  const [endDate, setEndDate] = useState<Date>(
    addDays(now('America/Mexico_City').toDate(), 1)
  )
  // Usamos inputs de tipo "time" para capturar la hora (formato HH:mm)
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [capacity, setCapacity] = useState<number | ''>('')
  const [price, setPrice] = useState<number | ''>('')
  const [isLimited, setIsLimited] = useState(false)
  const [repeatEvery, setRepeatEvery] = useState<
    'never' | 'day' | 'week' | 'month' | 'year'
  >('never')
  const [loading, setLoading] = useState(false)

  // Detecta si el dispositivo es desktop (por ejemplo, ancho >= 768px)
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' })

  // Función auxiliar para convertir "HH:mm" a minutos desde la medianoche
  const timeStringToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate || !startTime || !endTime) {
      toast.error('Por favor, completa todos los campos requeridos')
      return
    }

    if (isLimited && !capacity) {
      toast.error('Por favor, ingresa la capacidad del evento')
      return
    }

    const eventData: Omit<Event, 'id'> = {
      name,
      description,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      startTime: timeStringToMinutes(startTime),
      endTime: timeStringToMinutes(endTime),
      capacity: isLimited ? Number(capacity) : null,
      price: Number(price),
      isLimited,
      repeatEvery,
    }

    setLoading(true)
    try {
      const success = await appointmentService.createEvent(eventData)
      if (success) {
        toast.success('Evento creado con éxito')
      } else {
        toast.error('Error al crear el evento')
      }

      setOpen(false)
      // Aquí podrías limpiar el formulario o actualizar estados según convenga
    } catch (error) {
      toast.error('Error al crear el evento')
    } finally {
      setLoading(false)
    }
  }

  // Formulario para modo mobile (diseño actual sin tabs)
  const mobileForm = (
    <div className='flex flex-col gap-4'>
      <label className='flex flex-col'>
        <span>Nombre del evento</span>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Nombre del evento'
        />
      </label>
      <label className='flex flex-col'>
        <span>Descripción</span>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Descripción'
        />
      </label>
      <label className='flex flex-col'>
        <span>Precio</span>
        <Input
          type='number'
          value={price}
          onChange={(e) => setPrice(Number(e.target.value) || '')}
          placeholder='Precio'
        />
      </label>
      <label className='flex items-center gap-2'>
        <input
          type='checkbox'
          checked={isLimited}
          onChange={(e) => setIsLimited(e.target.checked)}
        />
        <span>Evento con capacidad limitada</span>
      </label>
      {isLimited && (
        <label className='flex flex-col'>
          <span>Capacidad</span>
          <Input
            type='number'
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value) || '')}
            placeholder='Capacidad'
          />
        </label>
      )}
      <label className='flex flex-col'>
        <span>Repetición</span>
        <Select
          value={repeatEvery}
          onValueChange={(value) =>
            setRepeatEvery(value as 'never' | 'day' | 'week' | 'month' | 'year')
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Repetición' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='never'>Nunca</SelectItem>
            <SelectItem value='day'>Diario</SelectItem>
            <SelectItem value='week'>Semanal</SelectItem>
            <SelectItem value='month'>Mensual</SelectItem>
            <SelectItem value='year'>Anual</SelectItem>
          </SelectContent>
        </Select>
      </label>
      <label className='flex flex-col gap-2'>
        <span>Fecha de inicio</span>
        <Calendar
          locale={es}
          mode='single'
          selected={startDate}
          onSelect={(date) => setStartDate(date as Date)}
        />
      </label>
      <label className='flex flex-col'>
        <span>Hora de inicio</span>
        <Input
          type='time'
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          placeholder='Hora de inicio'
        />
      </label>
      <label className='flex flex-col gap-2'>
        <span>Fecha de finalización</span>
        <Calendar
          locale={es}
          mode='single'
          selected={endDate}
          onSelect={(date) => setEndDate(date as Date)}
        />
      </label>
      <label className='flex flex-col'>
        <span>Hora de finalización</span>
        <Input
          type='time'
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder='Hora de finalización'
        />
      </label>
    </div>
  )

  // Formulario dividido en tabs para desktop
  const desktopForm = (
    <Tabs defaultValue='detalles'>
      <TabsList>
        <TabsTrigger value='detalles'>Detalles</TabsTrigger>
        <TabsTrigger value='fechas'>Fechas y Horarios</TabsTrigger>
      </TabsList>
      <TabsContent value='detalles'>
        <div className='flex flex-col gap-4 px-1'>
          <label className='flex flex-col'>
            <span>Nombre del evento</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Nombre del evento'
            />
          </label>
          <label className='flex flex-col'>
            <span>Descripción</span>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Descripción'
            />
          </label>
          <label className='flex flex-col'>
            <span>Precio</span>
            <Input
              type='number'
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || '')}
              placeholder='Precio'
            />
          </label>
          <label className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={isLimited}
              onChange={(e) => setIsLimited(e.target.checked)}
            />
            <span>Evento con capacidad limitada</span>
          </label>
          {isLimited && (
            <label className='flex flex-col'>
              <span>Capacidad</span>
              <Input
                type='number'
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value) || '')}
                placeholder='Capacidad'
              />
            </label>
          )}
          <label className='flex flex-col'>
            <span>Repetición</span>
            <Select
              value={repeatEvery}
              onValueChange={(value) =>
                setRepeatEvery(
                  value as 'never' | 'day' | 'week' | 'month' | 'year'
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Repetición' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='never'>Nunca</SelectItem>
                <SelectItem value='day'>Diario</SelectItem>
                <SelectItem value='week'>Semanal</SelectItem>
                <SelectItem value='month'>Mensual</SelectItem>
                <SelectItem value='year'>Anual</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
      </TabsContent>
      <TabsContent value='fechas'>
        <div className='flex flex-col gap-4'>
          <label className='flex flex-col gap-2'>
            <span>Fecha de inicio</span>
            <Calendar
              locale={es}
              mode='single'
              selected={startDate}
              onSelect={(date) => setStartDate(date as Date)}
            />
          </label>
          <label className='flex flex-col'>
            <span>Hora de inicio</span>
            <Input
              type='time'
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder='Hora de inicio'
            />
          </label>
          <label className='flex flex-col gap-2'>
            <span>Fecha de finalización</span>
            <Calendar
              locale={es}
              mode='single'
              selected={endDate}
              onSelect={(date) => setEndDate(date as Date)}
            />
          </label>
          <label className='flex flex-col'>
            <span>Hora de finalización</span>
            <Input
              type='time'
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder='Hora de finalización'
            />
          </label>
        </div>
      </TabsContent>
    </Tabs>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='w-full bg-primary hover:bg-primary/90 transition-all duration-300'>
          Crear Evento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogDescription className='sr-only'>
          Crear nuevo evento
        </DialogDescription>
        <DialogHeader>
          <DialogTitle>Crear Evento</DialogTitle>
        </DialogHeader>
        <ScrollArea className='h-96'>
          {isDesktop ? desktopForm : mobileForm}
        </ScrollArea>
        <DialogFooter>
          <Button disabled={loading || !name.trim().length || !startDate || !startTime.length || !endTime.length || !endDate} onClick={handleSubmit}>
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
