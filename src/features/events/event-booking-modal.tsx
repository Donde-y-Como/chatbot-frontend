import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { ClientPrimitives } from '../clients/types';
import { useGetEventAvailableDates } from './hooks/useGetEventAvailableDates';
import { Booking, createBookingSchema, BookingStatus, PaymentStatus } from './types';
import { CreateOrSelectClient } from '@/features/appointments/components/CreateOrSelectClient.tsx'
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookingEditModal } from './booking-edit-modal';
import { Edit } from 'lucide-react';
import { BookingStatusBadge, PaymentStatusBadge, BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from './utils/booking-status';

// Schema específico para el formulario (sin el campo date)
const bookingFormSchema = z.object({
  clientId: z.string().min(1, { message: 'El cliente es requerido' }),
  participants: z.number().int().min(1, { message: 'Mínimo 1 participante' }),
  notes: z.string().optional().default(''),
  status: z.enum(['pendiente', 'confirmada', 'reprogramada', 'completada', 'cancelada', 'no asistió']).optional().default('pendiente'),
  amount: z.number().min(0, { message: 'El monto no puede ser negativo' }).multipleOf(0.01, { message: 'Máximo 2 decimales' }).optional().default(0),
  paymentStatus: z.enum(['pendiente', 'pagado', 'parcial', 'reembolsado']).optional().default('pendiente'),
})

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface EventBookingModalProps {
  eventId: string;
  open: boolean;
  onClose: () => void;
  onSaveBooking: (data: { clientId: string; participants: number; date: Date; notes?: string; status?: BookingStatus; amount?: number; paymentStatus?: PaymentStatus }) => Promise<void>;
  onRemoveBooking: (bookingId: string) => Promise<void>;
  onUpdateBooking?: (bookingId: string, data: any) => Promise<void>;
  initialClientId?: string;
}

export function EventBookingModal({
  eventId,
  open,
  onClose,
  onSaveBooking,
  onRemoveBooking,
  onUpdateBooking,
  initialClientId,
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
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { 
      clientId: '', 
      participants: 1, 
      notes: '',
      status: 'pendiente',
      amount: 0,
      paymentStatus: 'pendiente'
    },
  });

  const [clientId, setClientId] = useState(initialClientId || '');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (initialClientId) {
      setClientId(initialClientId)
      setValue('clientId', initialClientId)
    }
  }, [initialClientId, setValue])

  // Actualizar clientId en el formulario cuando cambia
  useEffect(() => {
    if (clientId) {
      setValue('clientId', clientId);
    }
  }, [clientId, setValue]);

  // Reiniciar el formulario cuando se abre o cierra el modal
  useEffect(() => {
    if (!open) {
      reset({ 
        clientId: '', 
        participants: 1, 
        notes: '',
        status: 'pendiente',
        amount: 0,
        paymentStatus: 'pendiente'
      });
      setClientId(initialClientId || '');
    } else if (open && initialClientId) {
      setClientId(initialClientId)
      setValue('clientId', initialClientId)
    }
  }, [open, reset, setClientId, initialClientId, setValue]);

  const onSubmit = async (data: BookingFormValues) => {    
    if (!selectedDate) {
      console.error('No date selected');
      return;
    }
    
    // Validar capacidad antes de enviar (contar todas las reservas)
    if (event?.capacity.isLimited && event.capacity.maxCapacity) {
      const currentParticipants = bookingsForSelectedDate.reduce((sum, booking) => sum + booking.participants, 0);
      const totalAfterBooking = currentParticipants + data.participants;
      
      if (totalAfterBooking > event.capacity.maxCapacity) {
        const availableSpots = event.capacity.maxCapacity - currentParticipants;
        toast.error(
          availableSpots > 0 
            ? `No hay suficientes espacios disponibles. Solo quedan ${availableSpots} lugar${availableSpots !== 1 ? 'es' : ''} disponible${availableSpots !== 1 ? 's' : ''} para esta fecha.`
            : 'No hay espacios disponibles para esta fecha.'
        );
        return;
      }
    }
    
    try {
      const bookingData = {
        clientId: data.clientId,
        participants: data.participants,
        date: selectedDate,
        notes: data.notes || '',
        status: data.status || 'pendiente',
        amount: data.amount || 0,
        paymentStatus: data.paymentStatus || 'pendiente'
      };
      
      await onSaveBooking(bookingData);
      
      // Toast de éxito y cerrar modal
      toast.success('Cliente agendado con éxito');
      onClose();
      
      reset();
      setClientId('');
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const handleRemoveBooking = async (booking: Booking) => {
    await onRemoveBooking(booking.id)
  }

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditModalOpen(true);
  }

  const handleUpdateBooking = async (bookingId: string, data: any) => {
    if (onUpdateBooking) {
      await onUpdateBooking(bookingId, data);
    }
    setIsEditModalOpen(false);
    setEditingBooking(null);
  }

  // Filter bookings that match the selected date.
  const bookingsForSelectedDate = useMemo(() => {
    if (!event || !selectedDate || !event.bookings || !Array.isArray(event.bookings)) {
      return [] as Booking[];
    }
    return event.bookings.filter((booking: Booking) =>
      isSameDay(startOfDay(parseISO(booking.date)), selectedDate)
    );
  }, [event, selectedDate]);

  // Helper functions for booking statistics
  const getBookingStats = useMemo(() => {
    const confirmedBookings = bookingsForSelectedDate.filter(b => b.status === 'confirmada');
    const pendingBookings = bookingsForSelectedDate.filter(b => b.status === 'pendiente');
    const activeBookings = bookingsForSelectedDate.filter(b => 
      ['confirmada', 'pendiente', 'reprogramada'].includes(b.status)
    );
    
    return {
      confirmed: {
        count: confirmedBookings.length,
        participants: confirmedBookings.reduce((sum, b) => sum + b.participants, 0)
      },
      pending: {
        count: pendingBookings.length,
        participants: pendingBookings.reduce((sum, b) => sum + b.participants, 0)
      },
      active: {
        count: activeBookings.length,
        participants: activeBookings.reduce((sum, b) => sum + b.participants, 0)
      },
      total: {
        count: bookingsForSelectedDate.length,
        participants: bookingsForSelectedDate.reduce((sum, b) => sum + b.participants, 0)
      }
    };
  }, [bookingsForSelectedDate]);



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
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Administrar Reservas - {event?.name}</DialogTitle>
          <DialogDescription>
            {selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es }) : ''}
          </DialogDescription>
          
          {/* Event Capacity Information */}
          {event && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Información del Evento</h4>
                {event.capacity.isLimited ? (
                  <Badge variant={getBookingStats.total.participants >= (event.capacity.maxCapacity || 0) ? "destructive" : "secondary"}>
                    {event.capacity.isLimited && event.capacity.maxCapacity ? 
                      `${getBookingStats.total.participants}/${event.capacity.maxCapacity} asistentes` :
                      `${getBookingStats.total.participants} asistentes`
                    }
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    {getBookingStats.total.participants} asistentes • Sin límite
                  </Badge>
                )}
              </div>
              
              {event.capacity.isLimited && event.capacity.maxCapacity ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Capacidad total:</span>
                    <span className="font-medium">{event.capacity.maxCapacity} personas</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Reservas confirmadas:</span>
                    <span className="font-medium text-green-600">{getBookingStats.confirmed.participants} personas</span>
                  </div>
                  {getBookingStats.pending.participants > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Reservas pendientes:</span>
                      <span className="font-medium text-yellow-600">{getBookingStats.pending.participants} personas</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Espacios disponibles:</span>
                    <span className={`font-medium ${
                      (event.capacity.maxCapacity - getBookingStats.total.participants) > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {Math.max(0, event.capacity.maxCapacity - getBookingStats.total.participants)} personas
                    </span>
                  </div>
                  
                  {/* Visual capacity bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getBookingStats.total.participants >= event.capacity.maxCapacity 
                          ? 'bg-red-500' 
                          : getBookingStats.total.participants / event.capacity.maxCapacity > 0.8
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (getBookingStats.total.participants / event.capacity.maxCapacity) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    {((getBookingStats.total.participants / event.capacity.maxCapacity) * 100).toFixed(0)}% ocupado
                  </div>
                  
                  {/* Booking breakdown */}
                  <div className="pt-2 border-t border-muted-foreground/10">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Total de reservas: {getBookingStats.total.count} ({getBookingStats.total.participants} asistentes)</div>
                      <div className="flex gap-4">
                        <span>• Confirmadas: {getBookingStats.confirmed.count} ({getBookingStats.confirmed.participants}p)</span>
                        <span>• Pendientes: {getBookingStats.pending.count} ({getBookingStats.pending.participants}p)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Este evento no tiene límite de capacidad
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total de reservas: {getBookingStats.total.count} ({getBookingStats.total.participants} asistentes)
                  </div>
                </div>
              )}
            </div>
          )}
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
          <form onSubmit={(e) => {
            handleSubmit(onSubmit)(e);
          }} className="space-y-4">
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
                render={({ field }) => {
                  const currentParticipants = bookingsForSelectedDate.reduce((sum, booking) => sum + booking.participants, 0);
                  const availableSpots = event?.capacity.isLimited && event.capacity.maxCapacity 
                    ? event.capacity.maxCapacity - currentParticipants 
                    : null;
                  const maxAllowed = availableSpots !== null ? Math.min(availableSpots, event!.capacity.maxCapacity!) : undefined;
                  
                  return (
                    <>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={maxAllowed}
                        className="w-full"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                      {event?.capacity.isLimited && event.capacity.maxCapacity && (
                        <div className="text-sm text-muted-foreground">
                          {availableSpots !== null && availableSpots > 0 ? (
                            <span className="text-blue-600">
                              {availableSpots} lugar{availableSpots !== 1 ? 'es' : ''} disponible{availableSpots !== 1 ? 's' : ''} para esta fecha
                            </span>
                          ) : (
                            <span className="text-red-600">
                              No hay espacios disponibles para esta fecha
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )
                }}
              />
              {errors.participants && (
                <p className="text-sm text-red-600">{errors.participants.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Notas adicionales sobre la reserva..."
                    className="w-full"
                    rows={3}
                  />
                )}
              />
              {errors.notes && (
                <p className="text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Estado de la Reserva</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="paymentStatus">Estado del Pago</Label>
                <Controller
                  control={control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.paymentStatus && (
                  <p className="text-sm text-red-600">{errors.paymentStatus.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Monto/Abono</Label>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Guardando...' : 'Agregar Reserva'}
            </Button>
          </form>

          {/* List Existing Bookings for Selected Date */}
          {clients && (
            <BookingsList 
              bookingsForSelectedDate={bookingsForSelectedDate} 
              clients={clients} 
              handleRemoveBooking={handleRemoveBooking}
              handleEditBooking={handleEditBooking}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Modal de edición de reserva */}
      <BookingEditModal
        booking={editingBooking}
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBooking(null);
        }}
        onSaveBooking={handleUpdateBooking}
      />
    </Dialog>
  );
}



export function BookingsList({ 
  bookingsForSelectedDate, 
  clients, 
  handleRemoveBooking, 
  handleEditBooking 
}: { 
  bookingsForSelectedDate: Booking[], 
  clients: ClientPrimitives[], 
  handleRemoveBooking: (booking: Booking) => void,
  handleEditBooking: (booking: Booking) => void 
}) {
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
                      <div className="flex-1">
                        <p className="font-medium">{client?.name || 'Cliente desconocido'}</p>
                        <p className="text-sm text-muted-foreground">
                          Participantes: {booking.participants}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <BookingStatusBadge status={booking.status} />
                          <PaymentStatusBadge status={booking.paymentStatus} />
                          {booking.amount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              ${booking.amount.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBooking(booking)}
                        title="Editar reserva"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBooking(booking)}
                        title="Eliminar reserva"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
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