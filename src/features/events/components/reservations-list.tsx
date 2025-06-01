import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { MoreHorizontal, Pencil, Trash2, User } from 'lucide-react'
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useQueryClient } from '@tanstack/react-query'
import { useGetClients } from "../../appointments/hooks/useGetClients"
import { useBookingMutations } from "../hooks/useBookingMutations"
import { BookingStatus, PaymentStatus, EventWithBookings, UpdateBookingData } from "../types"
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS, BookingStatusBadge, PaymentStatusBadge } from "../utils/booking-status"

type ReservationsListProps = {
  event: EventWithBookings
}

export function ReservationsList({ event }: ReservationsListProps) {
  const { data: clients } = useGetClients()
  const { updateBooking, deleteBooking, isUpdatingBooking, isDeletingBooking } = useBookingMutations()
  const queryClient = useQueryClient()
  
  const [editingBooking, setEditingBooking] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    status: '' as BookingStatus,
    amount: 0,
    paymentStatus: '' as PaymentStatus,
    notes: ''
  })

  const getInitials = (name: string) => {
    if (!name) return ''
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const handleEditBooking = (bookingId: string) => {
    const booking = event.bookings.find(b => b.id === bookingId)
    if (booking) {
      setEditForm({
        status: booking.status,
        amount: booking.amount,
        paymentStatus: booking.paymentStatus,
        notes: booking.notes || ''
      })
      setEditingBooking(bookingId)
    }
  }

  const handleUpdateBooking = async () => {
    if (!editingBooking) return

    try {
      const updateData: UpdateBookingData = {
        status: editForm.status,
        amount: editForm.amount,
        paymentStatus: editForm.paymentStatus,
        notes: editForm.notes
      }

      await updateBooking({ bookingId: editingBooking, data: updateData })
      // Forzar refetch de la query específica del evento
      await queryClient.invalidateQueries({ queryKey: ['event', event.id] })
      toast.success('Reserva actualizada correctamente')
      setEditingBooking(null)
    } catch (error) {
      toast.error('Error al actualizar la reserva')
      console.error('Error updating booking:', error)
    }
  }

  const handleDeleteBooking = async (bookingId: string, clientName: string) => {
    try {
      await deleteBooking(bookingId)
      // Forzar refetch de la query específica del evento
      await queryClient.invalidateQueries({ queryKey: ['event', event.id] })
      toast.success(`Cliente ${clientName} eliminado del evento`)
    } catch (error) {
      toast.error('Error al eliminar cliente del evento')
      console.error('Error deleting booking:', error)
    }
  }

  const formatDate = (isoDate: string) => {
    if (!isoDate) return 'N/A'
    const date = new Date(isoDate)
    return new Intl.DateTimeFormat('es', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (!event.bookings.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Sin reservas</h3>
        <p className="text-sm">Este evento aún no tiene reservas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reservas del evento</h3>
        <Badge variant="outline">
          {event.bookings.length} {event.bookings.length === 1 ? 'reserva' : 'reservas'}
        </Badge>
      </div>
      
      <div className="border rounded-lg">
        <div className="grid grid-cols-[60px_1fr_auto] gap-4 items-center p-3 border-b font-medium text-sm text-muted-foreground">
          <div>Foto</div>
          <div>Cliente</div>
          <div>Opciones</div>
        </div>
        
        {event.bookings.map((booking) => {
          const client = clients?.find(c => c.id === booking.clientId)
          
          return (
            <div key={booking.id} className="grid grid-cols-[60px_1fr_auto] gap-4 items-center p-3 border-b last:border-b-0 hover:bg-muted/50">
              {/* Foto */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={client?.photo} alt={client?.name} className="object-cover" />
                <AvatarFallback>{getInitials(client?.name || '')}</AvatarFallback>
              </Avatar>
              
              {/* Información del cliente */}
              <div className="space-y-1">
                <div className="font-medium">{client?.name || 'Cliente no encontrado'}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{booking.participants} participantes</span>
                  <span>•</span>
                  <span>{formatDate(booking.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookingStatusBadge status={booking.status} />
                  <PaymentStatusBadge status={booking.paymentStatus} />
                </div>
              </div>
              
              {/* Botón de opciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleEditBooking(booking.id)}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar reserva
                  </DropdownMenuItem>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar cliente del evento
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar cliente del evento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que quieres eliminar a <strong>{client?.name}</strong> de este evento? 
                          Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteBooking(booking.id, client?.name || 'Cliente')}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeletingBooking}
                        >
                          {isDeletingBooking ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}
      </div>

      {/* Dialog de edición */}
      <Dialog open={editingBooking !== null} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar reserva</DialogTitle>
            <DialogDescription>
              Modifica el estatus, abono y notas de la reserva
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Estado de la reserva */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado de la reserva</Label>
              <Select 
                value={editForm.status} 
                onValueChange={(value: BookingStatus) => setEditForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado del pago */}
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Estado del pago</Label>
              <Select 
                value={editForm.paymentStatus} 
                onValueChange={(value: PaymentStatus) => setEditForm(prev => ({ ...prev, paymentStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Abono */}
            <div className="space-y-2">
              <Label htmlFor="amount">Abono</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={editForm.amount}
                onChange={(e) => setEditForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Agregar notas sobre la reserva..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEditingBooking(null)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateBooking}
              disabled={isUpdatingBooking}
            >
              {isUpdatingBooking ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}