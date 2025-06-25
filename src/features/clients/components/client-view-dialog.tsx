import { format, formatDistance } from 'date-fns'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
} from '@tabler/icons-react'
import { es } from 'date-fns/locale'
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  Clock,
  ExternalLink,
  FileType,
  Loader2,
  Mail,
  MapPin,
  MapPinned,
  Paperclip,
  Tag,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlatformName } from '@/features/chats/ChatTypes'
import { useClientAppointments } from '../hooks/useClientAppointments'
import { useClientEvents } from '../hooks/useClientEvents'
import { ClientPrimitives } from '../types'
import { PlatformChatButton } from './platform-chat-button'

interface ClientViewDialogProps {
  currentClient: ClientPrimitives
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientViewDialog({
  currentClient,
  open,
  onOpenChange,
}: ClientViewDialogProps) {
  // Use our custom hooks for client appointments and events
  const {
    appointments,
    services,
    isLoading: isLoadingAppointments,
  } = useClientAppointments(currentClient.id, open)
  const {
    clientEvents,
    isLoading: isLoadingEvents,
    isError: isErrorEvents,
    error: eventsError,
  } = useClientEvents(currentClient.id, open)

  // Memoize some stats for the client summary
  const latestEvent = clientEvents.length > 0 ? clientEvents[0].event : null
  const totalEventParticipants = clientEvents.reduce(
    (sum, { booking }) => sum + booking.participants,
    0
  )

  // Format dates consistently
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado'
    try {
      return format(new Date(dateString), 'PPP', { locale: es })
    } catch {
      return 'Fecha inválida'
    }
  }

  // Format time from minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
            <Avatar className='h-16 w-16 border-2 border-primary/10'>
              <AvatarImage src={currentClient.photo} alt={currentClient.name} />
              <AvatarFallback className='text-lg'>
                {currentClient.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className='text-2xl font-bold'>
                Detalles del Cliente
              </DialogTitle>
              <p className='text-sm font-medium mt-1'>{currentClient.name}</p>
              <DialogDescription className='flex items-center mt-1'>
                <Mail className='h-4 w-4 mr-2' />
                {currentClient.email || 'Sin correo electrónico'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className='max-h-[70vh] w-full'>
          <Tabs
            defaultValue='details'
            className='w-full mt-2'
            orientation='horizontal'
          >
            <TabsList className='grid w-full grid-cols-4 mb-4'>
              <TabsTrigger value='details'>Detalles</TabsTrigger>
              <TabsTrigger value='resumen'>Resumen</TabsTrigger>
              <TabsTrigger value='annexes'>Anexos</TabsTrigger>
              <TabsTrigger value='notes'>Notas</TabsTrigger>
            </TabsList>

            <TabsContent value='details' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Personal Information */}
                <Card>
                  <CardContent className='p-4 space-y-3'>
                    <h3 className='font-semibold text-lg'>
                      Información Personal
                    </h3>
                    <Separator />

                    <div className='space-y-2'>
                      {currentClient.address && (
                        <div className='flex items-start'>
                          <MapPin className='h-5 w-5 mr-2 mt-0.5 text-muted-foreground flex-shrink-0' />
                          <span>{currentClient.address}</span>
                        </div>
                      )}

                      {currentClient.birthdate && (
                        <div className='flex items-center'>
                          <Calendar className='h-5 w-5 mr-2 text-muted-foreground flex-shrink-0' />
                          <span>
                            Nacimiento: {formatDate(currentClient.birthdate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Platform Identities */}
                <Card>
                  <CardContent className='p-4 space-y-3'>
                    <h3 className='font-semibold text-lg'>
                      Cuentas de Plataforma
                    </h3>
                    <Separator />

                    {currentClient.platformIdentities &&
                    currentClient.platformIdentities.length > 0 ? (
                      <div className='space-y-3'>
                        {currentClient.platformIdentities.map(
                          (identity, index) => (
                            <div key={index} className='border rounded-md p-3'>
                              <div className='flex items-center justify-between mb-2'>
                                <Badge
                                  variant='outline'
                                  className='capitalize text-sm flex items-center gap-1 cursor-pointer hover:bg-accent'
                                  onClick={() => {
                                    const chatButton = document.getElementById(
                                      `platform-detail-${currentClient.id}-${identity.platformName}`
                                    )
                                    if (chatButton) {
                                      chatButton.click()
                                    }
                                  }}
                                >
                                  {(() => {
                                    // Determinar qué icono mostrar según la plataforma
                                    const PlatformIcon =
                                      {
                                        [PlatformName.Whatsapp]:
                                          IconBrandWhatsapp,
                                        [PlatformName.WhatsappWeb]:
                                          IconBrandWhatsapp,
                                        [PlatformName.Facebook]:
                                          IconBrandFacebook,
                                        [PlatformName.Instagram]:
                                          IconBrandInstagram,
                                      }[identity.platformName] || null

                                    return (
                                      PlatformIcon && (
                                        <PlatformIcon
                                          size={14}
                                          className={cn(
                                            (identity.platformName ===
                                              PlatformName.Whatsapp ||
                                              identity.platformName ===
                                                PlatformName.WhatsappWeb) &&
                                              'text-green-500',
                                            identity.platformName ===
                                              PlatformName.Facebook &&
                                              'text-blue-500',
                                            identity.platformName ===
                                              PlatformName.Instagram &&
                                              'text-pink-500'
                                          )}
                                        />
                                      )
                                    )
                                  })()}
                                  <span className='ml-1'>
                                    {identity.platformName}
                                  </span>
                                  <PlatformChatButton
                                    clientId={currentClient.id}
                                    platformName={identity.platformName}
                                    profileName={identity.profileName}
                                    id={`platform-detail-${currentClient.id}-${identity.platformName}`}
                                    className='hidden'
                                  />
                                </Badge>
                              </div>
                              <div className='flex items-center'>
                                <span className='font-medium'>
                                  {identity.profileName}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className='text-muted-foreground'>
                        Sin identidades de plataforma asociadas
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardContent className='p-4 space-y-3'>
                    <h3 className='font-semibold text-lg'>Etiquetas</h3>
                    <Separator />

                    {currentClient.tagIds && currentClient.tagIds.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {currentClient.tagIds.map((tagId, index) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='px-3 py-1 text-xs'
                          >
                            <Tag className='h-3 w-3 mr-1' />
                            {tagId}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className='text-muted-foreground'>
                        Sin etiquetas asignadas
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* System Info */}
                <Card>
                  <CardContent className='p-4 space-y-3'>
                    <h3 className='font-semibold text-lg'>
                      Información del Sistema
                    </h3>
                    <Separator />

                    <div className='space-y-2 text-sm'>
                      <div className='flex items-center'>
                        <Clock className='h-4 w-4 mr-2 text-muted-foreground' />
                        <span className='text-muted-foreground'>
                          Creado: {formatDate(currentClient.createdAt)}
                        </span>
                      </div>
                      <div className='flex items-center'>
                        <Clock className='h-4 w-4 mr-2 text-muted-foreground' />
                        <span className='text-muted-foreground'>
                          Actualizado: {formatDate(currentClient.updatedAt)}
                        </span>
                      </div>
                      <div className='flex items-center'>
                        <span className='text-xs text-muted-foreground'>
                          ID: {currentClient.id}
                        </span>
                      </div>
                      <div className='flex items-center'>
                        <span className='text-xs text-muted-foreground'>
                          Negocio ID: {currentClient.businessId}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='annexes'>
              <Card>
                <CardContent className='p-4 space-y-3'>
                  <h3 className='font-semibold text-lg'>
                    Archivos Adjuntos & Documentos
                  </h3>
                  <Separator />

                  {currentClient.annexes && currentClient.annexes.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                      {currentClient.annexes.map((annex, index) => (
                        <Card
                          key={index}
                          className='p-3 hover:bg-accent/50 cursor-pointer transition-colors'
                        >
                          <div className='flex items-center'>
                            <Paperclip className='h-4 w-4 mr-2 text-muted-foreground' />
                            <span className='font-medium truncate'>
                              {annex.name || 'Sin título'}
                            </span>
                          </div>
                          {annex.media && (
                            <div className='mt-2 flex items-center justify-between'>
                              <div className='flex items-center'>
                                <FileType className='h-4 w-4 mr-1 text-muted-foreground' />
                                <p className='text-xs text-muted-foreground truncate'>
                                  {annex.media.type}
                                </p>
                              </div>
                              {annex.media.url && (
                                <a
                                  href={annex.media.url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-xs text-primary flex items-center hover:underline'
                                >
                                  <ExternalLink className='h-3 w-3 mr-1' />
                                  Ver
                                </a>
                              )}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground'>
                      Sin documentos adjuntos
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='notes'>
              <Card>
                <CardContent className='p-4 space-y-3'>
                  <h3 className='font-semibold text-lg'>Notas</h3>
                  <Separator />

                  {currentClient.notes ? (
                    <div className='whitespace-pre-wrap rounded-md bg-muted/50 p-4'>
                      {currentClient.notes}
                    </div>
                  ) : (
                    <p className='text-muted-foreground'>
                      Sin notas disponibles
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='resumen' className='space-y-4'>
              {/* Client Summary Card */}
              <Card>
                <CardContent className='p-4 space-y-3'>
                  <h3 className='font-semibold text-lg'>Resumen del Cliente</h3>
                  <Separator />

                  {isLoadingAppointments || isLoadingEvents ? (
                    <div className='flex justify-center items-center py-4'>
                      <Loader2 className='h-8 w-8 animate-spin text-primary' />
                      <span className='ml-2'>Cargando datos...</span>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='flex items-center space-x-2'>
                        <Calendar className='h-5 w-5 text-muted-foreground' />
                        <div>
                          <p className='text-sm text-muted-foreground'>
                            Total de citas realizadas
                          </p>
                          <p className='font-medium'>{appointments.length}</p>
                        </div>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <Users className='h-5 w-5 text-muted-foreground' />
                        <div>
                          <p className='text-sm text-muted-foreground'>
                            Total de eventos asistidos por este cliente
                          </p>
                          <p className='font-medium'>
                            {clientEvents.length}
                            {totalEventParticipants > 0 && (
                              <span className='text-xs text-muted-foreground ml-1'>
                                (con {totalEventParticipants} participantes en
                                total)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <CalendarDays className='h-5 w-5 text-muted-foreground' />
                        <div>
                          <p className='text-sm text-muted-foreground'>
                            Fecha de la última cita
                          </p>
                          <p className='font-medium'>
                            {appointments.length > 0
                              ? formatDate(
                                  appointments.sort(
                                    (a, b) =>
                                      new Date(b.date).getTime() -
                                      new Date(a.date).getTime()
                                  )[0].date
                                )
                              : 'No hay citas'}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <CalendarDays className='h-5 w-5 text-muted-foreground' />
                        <div>
                          <p className='text-sm text-muted-foreground'>
                            Fecha del último evento
                          </p>
                          <p className='font-medium'>
                            {latestEvent ? (
                              <span className='flex flex-col'>
                                <span>
                                  {formatDate(latestEvent.duration.startAt)}
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                  {formatDistance(
                                    new Date(latestEvent.duration.startAt),
                                    new Date(),
                                    {
                                      addSuffix: true,
                                      locale: es,
                                    }
                                  )}
                                </span>
                              </span>
                            ) : (
                              'No hay eventos'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Appointment History Card */}
              <Card>
                <CardContent className='p-4 space-y-3'>
                  <h3 className='font-semibold text-lg'>Historial de Citas</h3>
                  <Separator />

                  {isLoadingAppointments ? (
                    <div className='flex justify-center items-center py-4'>
                      <Loader2 className='h-6 w-6 animate-spin text-primary' />
                    </div>
                  ) : appointments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Folio</TableHead>
                          <TableHead>Servicio</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Hora</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments
                          .sort(
                            (a, b) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime()
                          )
                          .map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>{appointment.folio}</TableCell>
                              <TableCell>
                                <div className='flex flex-col'>
                                  <span>{appointment.serviceNames}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatDate(appointment.date)}
                              </TableCell>
                              <TableCell>
                                {formatTime(appointment.timeRange.startAt)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className='text-muted-foreground text-center py-4'>
                      No hay citas registradas
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Event History Card */}
              <Card>
                <CardContent className='p-4 space-y-3'>
                  <div className='flex justify-between items-center'>
                    <h3 className='font-semibold text-lg'>
                      Historial de Eventos de {currentClient.name}
                    </h3>
                    <Badge variant='outline' className='bg-primary/10'>
                      Total: {clientEvents.length}
                    </Badge>
                  </div>
                  <Separator />

                  {isLoadingEvents ? (
                    <div className='flex justify-center items-center py-4'>
                      <Loader2 className='h-6 w-6 animate-spin text-primary' />
                      <span className='ml-2'>
                        Cargando historial de eventos...
                      </span>
                    </div>
                  ) : isErrorEvents ? (
                    <div className='flex justify-center items-center py-4 text-destructive'>
                      <AlertCircle className='h-6 w-6 mr-2' />
                      <span>
                        Error al cargar los eventos del cliente:{' '}
                        {eventsError?.message || 'Error desconocido'}
                      </span>
                    </div>
                  ) : clientEvents.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Folio</TableHead>
                            <TableHead>Nombre del evento</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Asistentes</TableHead>
                            <TableHead>Ubicación</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientEvents.map(({ event, booking }, index) => (
                            <TableRow
                              key={booking.id}
                              className='group hover:bg-muted/50'
                            >
                              <TableCell className='font-medium'>
                                E{(index + 1).toString().padStart(3, '0')}
                              </TableCell>
                              <TableCell>
                                <div className='flex flex-col'>
                                  <span className='font-medium'>
                                    {event.name}
                                  </span>
                                  {booking.notes && (
                                    <span className='text-xs text-muted-foreground truncate max-w-[200px]'>
                                      {booking.notes}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className='flex flex-col'>
                                  <span>
                                    {formatDate(event.duration.startAt)}
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    {formatDistance(
                                      new Date(event.duration.startAt),
                                      new Date(),
                                      {
                                        addSuffix: true,
                                        locale: es,
                                      }
                                    )}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className='flex items-center'>
                                  <Clock className='h-3.5 w-3.5 mr-1 text-muted-foreground' />
                                  {new Date(event.duration.startAt).getHours()}:
                                  {new Date(event.duration.startAt)
                                    .getMinutes()
                                    .toString()
                                    .padStart(2, '0')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className='flex items-center'>
                                  <Users className='h-3.5 w-3.5 mr-1 text-muted-foreground' />
                                  <span>{booking.participants}</span>
                                  {event.capacity.isLimited &&
                                    event.capacity.maxCapacity && (
                                      <span className='text-xs text-muted-foreground ml-1'>
                                        de {event.capacity.maxCapacity}
                                      </span>
                                    )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className='flex items-center'>
                                  <MapPinned className='h-3.5 w-3.5 mr-1 text-muted-foreground' />
                                  <span className='truncate max-w-[150px]'>
                                    {event.location}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Event details - can be expanded on click if needed */}
                      {clientEvents.length > 5 && (
                        <div className='flex justify-center mt-2'>
                          <span className='text-xs text-muted-foreground'>
                            Mostrando {clientEvents.length} eventos
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className='flex flex-col items-center justify-center py-8 text-center'>
                      <CalendarDays className='h-12 w-12 text-muted-foreground mb-2 opacity-50' />
                      <p className='text-muted-foreground font-medium'>
                        No hay eventos registrados para {currentClient.name}
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        Este cliente no ha asistido a ningún evento todavía
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
