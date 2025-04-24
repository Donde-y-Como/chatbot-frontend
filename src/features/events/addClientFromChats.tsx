import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateOrSelectClient } from '@/features/appointments/components/CreateOrSelectClient';
import { useGetEventAvailableDates } from './hooks/useGetEventAvailableDates';
import { useGetEvents } from './hooks/useGetEvents';
import { useGetEventWithBookings } from './hooks/useGetEventWithBookings';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEventMutations } from './hooks/useEventMutations';

const bookingFormSchema = z.object({
  clientId: z.string().min(1, { message: 'Debes seleccionar un cliente.' }),
  eventId: z.string().min(1, { message: 'Debes seleccionar un evento.' }),
  participants: z
    .number({ invalid_type_error: 'El número de participantes es requerido.' })
    .min(1, { message: 'Mínimo 1 participante.' }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface AddClientFromChatsProps {
  open: boolean;
  onClose: () => void;
  preselectedClientId?: string;
  title?: string;
}

export function AddClientFromChats({
  open,
  onClose,
  preselectedClientId,
  title = 'Agendar Cliente en Evento',
}: AddClientFromChatsProps) {
  const { data: events, isLoading: isEventsLoading } = useGetEvents();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const { data: selectedEvent, isLoading: isEventLoading } = useGetEventWithBookings(selectedEventId || '');
  
  const availableDates = useGetEventAvailableDates(selectedEvent);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { bookEvent } = useEventMutations();

  // Cliente seleccionado/creado
  const [clientId, setClientId] = useState(preselectedClientId || '');

  // Configuración del formulario
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { 
      clientId: preselectedClientId || '', 
      eventId: '', 
      participants: 1 
    },
  });

  // Actualizar formulario cuando cambia el cliente
  useEffect(() => {
    if (clientId) {
      setValue('clientId', clientId);
    }
  }, [clientId, setValue]);

  // Actualizar formulario cuando cambia el evento
  useEffect(() => {
    if (selectedEventId) {
      setValue('eventId', selectedEventId);
    }
  }, [selectedEventId, setValue]);

  // Seleccionar la primera fecha disponible (siguiendo el enfoque de EventBookingModal)
  useEffect(() => {
    if (availableDates.length && !selectedDate) {
      // Filtrar para incluir solo fechas futuras
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      const futureDates = availableDates.filter(date => {
        try {
          return date >= now;
        } catch (e) {
          return false;
        }
      });
      
      if (futureDates.length > 0) {
        setSelectedDate(futureDates[0]);
      }
    }
  }, [availableDates, selectedDate]);

  // Resetear el formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      reset({ clientId: preselectedClientId || '', eventId: '', participants: 1 });
      setSelectedEventId('');
      setSelectedDate(null);
      if (!preselectedClientId) {
        setClientId('');
      }
    } else if (preselectedClientId) {
      setClientId(preselectedClientId);
    }
  }, [open, reset, preselectedClientId]);

  // Manejar el envío del formulario
  const onSubmit = async (data: BookingFormValues) => {
    // Verificar que la fecha sea válida
    if (!selectedDate || isNaN(selectedDate.getTime())) {
      console.error('Fecha inválida al intentar agendar evento');
      return;
    }
    
    try {
      await bookEvent({
        eventId: data.eventId,
        clientId: data.clientId,
        date: selectedDate,
        participants: data.participants,
        notes: ''
      });
      
      // Cerrar modal y resetear formulario
      onClose();
      reset();
      setSelectedEventId('');
      setSelectedDate(null);
      if (!preselectedClientId) {
        setClientId('');
      }
    } catch (error) {
      console.error('Error al agendar evento:', error);
    }
  };

  // Mostrar spinner mientras se cargan los datos
  if (isEventsLoading || (selectedEventId && isEventLoading)) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Filtrar fechas válidas y futuras para el selector
  const filteredDates = availableDates.filter(date => {
    // Primero verificar que la fecha es válida
    if (!date || isNaN(date.getTime())) {
      return false;
    }
    
    try {
      // Luego verificar que es una fecha futura
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return date >= now;
    } catch (e) {
      console.error('Error comparando fechas:', e);
      return false;
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {selectedDate && !isNaN(selectedDate.getTime())
              ? format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })
              : 'Selecciona un evento y una fecha disponible'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Selección o creación de cliente */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Cliente</label>
            <Controller
              control={control}
              name="clientId"
              render={() => (
                <>
                  <CreateOrSelectClient value={clientId} onChange={setClientId} />
                  {errors.clientId && (
                    <p className="text-sm text-red-600">{errors.clientId.message}</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Selector de eventos */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Evento</label>
            <Controller
              control={control}
              name="eventId"
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedEventId(value);
                    setSelectedDate(null); // Resetear fecha seleccionada al cambiar evento
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events?.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.eventId && (
              <p className="text-sm text-red-600">{errors.eventId.message}</p>
            )}
          </div>

          {/* Número de participantes */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Número de Participantes</label>
            <Controller
              control={control}
              name="participants"
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={1}
                  className="w-full"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {errors.participants && (
              <p className="text-sm text-red-600">{errors.participants.message}</p>
            )}
          </div>

          {/* Selector de fechas disponibles (se muestra solo si hay un evento seleccionado) */}
          {selectedEventId && (
            <div className="flex flex-col gap-2">
              <label className="font-medium">Fecha</label>
              <Select 
                value={selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate.toISOString() : ''} 
                onValueChange={(value) => {
                  try {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                      setSelectedDate(date);
                    }
                  } catch (error) {
                    console.error('Error parsing date:', error);
                  }
                }}
                disabled={filteredDates.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={filteredDates.length === 0 ? "No hay fechas disponibles" : "Selecciona una fecha"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredDates.map((date) => {
                    // Solo renderizamos el item si la fecha es válida
                    if (!date || isNaN(date.getTime())) {
                      return null;
                    }
                    
                    try {
                      const isoString = date.toISOString();
                      return (
                        <SelectItem key={date.getTime()} value={isoString}>
                          {format(date, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                        </SelectItem>
                      );
                    } catch (error) {
                      console.error('Error al renderizar fecha:', error, date);
                      return null;
                    }
                  })}
                </SelectContent>
              </Select>
              {filteredDates.length === 0 && selectedEventId && (
                <p className="text-sm text-amber-600">Este evento no tiene fechas futuras disponibles.</p>
              )}
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose} className="mr-2">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={
                !selectedDate || 
                isNaN(selectedDate?.getTime?.()) || 
                !selectedEventId || 
                !clientId
              }
            >
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}