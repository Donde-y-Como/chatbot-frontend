import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetClients } from '@/features/appointments/hooks/useGetClients';
import { useGetEventWithBookings } from '@/features/events/hooks/useGetEventWithBookings';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { ClientPrimitives } from '../clients/types';
import { useGetEventAvailableDates } from './hooks/useGetEventAvailableDates';
import { Booking } from './types';
import { CreateOrSelectClient } from '@/features/appointments/components/CreateOrSelectClient.tsx'

const bookingFormSchema = z.object({
  clientId: z.string().min(1, { message: 'Debes seleccionar un cliente.' }),
  participants: z
    .number({ invalid_type_error: 'El número de participantes es requerido.' })
    .min(1, { message: 'Mínimo 1 participante.' }),
});
type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface EventBookingModalProps {
  eventId: string;
  open: boolean;
  onClose: () => void;
  onSaveBooking: (data: { clientId: string; participants: number; date: Date }) => Promise<void>;
  onRemoveBooking: (bookingId: string) => Promise<void>;
}

export function EventBookingModal({
  eventId,
  open,
  onClose,
  onSaveBooking,
  onRemoveBooking,
}: EventBookingModalProps) {
  const { data: event, isLoading: isEventLoading } = useGetEventWithBookings(eventId);
  const { data: clients, isLoading: isClientsLoading } = useGetClients();

  const availableDates = useGetEventAvailableDates(event);

  // Selected occurrence date.
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  useEffect(() => {
    if (availableDates.length && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // React-hook-form for adding a new booking.
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { clientId: '', participants: 1 },
  });

  const [clientId, setClientId] = useState('');

  // Actualizar clientId en el formulario cuando cambia
  useEffect(() => {
    if (clientId) {
      setValue('clientId', clientId);
    }
  }, [clientId, setValue]);

  // Reiniciar el formulario cuando se abre o cierra el modal
  useEffect(() => {
    if (!open) {
      reset({ clientId: '', participants: 1 });
      setClientId('');
    }
  }, [open, reset, setClientId]);

  const onSubmit = async (data: BookingFormValues) => {
    if (!selectedDate) return;
    await onSaveBooking({ ...data, date: selectedDate });
    reset();
    setClientId(''); // Limpiamos el estado local también
  };

  const handleRemoveBooking = async (booking: Booking) => {
    await onRemoveBooking(booking.id)
  }

  // Filter bookings that match the selected date.
  const bookingsForSelectedDate = useMemo(() => {
    if (!event || !selectedDate) return [] as Booking[];
    return event.bookings.filter((booking: Booking) =>
      isSameDay(startOfDay(parseISO(booking.date)), selectedDate)
    );
  }, [event, selectedDate]);



  if (isEventLoading || isClientsLoading) {
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Administrar Reservas</DialogTitle>
          <DialogDescription>
            {selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es }) : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Occurrence Date Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Selecciona una fecha:</label>
            <Select value={selectedDate?.toISOString()} onValueChange={(value) => setSelectedDate(new Date(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Fecha" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date.toISOString()} value={date.toISOString()}>
                    {format(date, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Booking Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <Button type="submit" className="w-full">
              Agregar Reserva
            </Button>
          </form>

          {/* List Existing Bookings for Selected Date */}
          {clients && (<BookingsList bookingsForSelectedDate={bookingsForSelectedDate} clients={clients} handleRemoveBooking={handleRemoveBooking} />)}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



export function BookingsList({ bookingsForSelectedDate, clients, handleRemoveBooking }: { bookingsForSelectedDate: Booking[], clients: ClientPrimitives[], handleRemoveBooking: (booking: Booking) => void }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Reservas existentes</h3>
      {bookingsForSelectedDate.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay reservas para esta fecha.</p>
      ) : (
        <ScrollArea className="h-64 rounded-md border">
          <div className="p-4">
            <AnimatePresence>
              {bookingsForSelectedDate.map((booking: Booking) => {
                const client = clients.find((c: ClientPrimitives) => c.id === booking.clientId);
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center justify-between p-3 border-b"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {client?.name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client?.name || 'Cliente desconocido'}</p>
                        <p className="text-sm text-muted-foreground">
                          Participantes: {booking.participants}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBooking(booking)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}