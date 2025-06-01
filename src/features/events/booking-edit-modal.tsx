import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Booking, updateBookingSchema, UpdateBookingData } from './types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS, getValidNextStatuses } from './utils/booking-status';

type BookingEditFormValues = UpdateBookingData & {
  date?: string;
};

interface BookingEditModalProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onSaveBooking: (bookingId: string, data: UpdateBookingData) => Promise<void>;
  isLoading?: boolean;
}

export function BookingEditModal({
  booking,
  open,
  onClose,
  onSaveBooking,
  isLoading = false,
}: BookingEditModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingEditFormValues>({
    resolver: zodResolver(updateBookingSchema),
    defaultValues: {
      date: '',
      participants: 1,
      notes: '',
      status: 'pendiente',
      amount: 0,
      paymentStatus: 'pendiente',
    },
  });

  // Reiniciar el formulario cuando cambia la reserva
  useEffect(() => {
    if (booking && open) {
      reset({
        date: booking.date ? format(new Date(booking.date), "yyyy-MM-dd'T'HH:mm") : '',
        participants: booking.participants,
        notes: booking.notes || '',
        status: booking.status,
        amount: booking.amount || 0,
        paymentStatus: booking.paymentStatus,
      });
    }
  }, [booking, open, reset]);

  // Reiniciar el formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      reset({
        date: '',
        participants: 1,
        notes: '',
        status: 'pendiente',
        amount: 0,
        paymentStatus: 'pendiente',
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: BookingEditFormValues) => {
    if (!booking) return;
    
    const updateData: UpdateBookingData = {};
    
    // Solo incluir campos que han cambiado
    if (data.date && data.date !== format(new Date(booking.date), "yyyy-MM-dd'T'HH:mm")) {
      updateData.date = new Date(data.date).toISOString();
    }
    if (data.participants !== booking.participants) {
      updateData.participants = data.participants;
    }
    if (data.notes !== booking.notes) {
      updateData.notes = data.notes;
    }
    if (data.status !== booking.status) {
      updateData.status = data.status;
    }
    if (data.amount !== booking.amount) {
      updateData.amount = data.amount;
    }
    if (data.paymentStatus !== booking.paymentStatus) {
      updateData.paymentStatus = data.paymentStatus;
    }

    // Solo hacer la llamada si hay cambios
    if (Object.keys(updateData).length > 0) {
      await onSaveBooking(booking.id, updateData);
    }
    
    onClose();
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Reserva</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Fecha y Hora</Label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <Input
                  {...field}
                  type="datetime-local"
                  className="w-full"
                />
              )}
            />
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="participants">Número de Participantes</Label>
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
                  {/* Estado actual siempre disponible */}
                  <SelectItem value={booking.status}>
                    {BOOKING_STATUS_LABELS[booking.status]} (actual)
                  </SelectItem>
                  {/* Estados válidos siguientes */}
                  {getValidNextStatuses(booking.status).map((status) => (
                      <SelectItem key={status} value={status}>
                          {BOOKING_STATUS_LABELS[status]}
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

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
            >
              {(isSubmitting || isLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
