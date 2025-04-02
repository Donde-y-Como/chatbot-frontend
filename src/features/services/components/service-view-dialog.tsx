import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarIcon, Clock, Info, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export interface Service {
  id: string
  businessId: string
  name: string
  description: string
  duration: {
    value: number
    unit: 'minutes' | 'hours'
  }
  price: {
    amount: number
    currency: string
  }
  maxConcurrentBooks: number
  minBookingLeadHours: number
  schedule: Record<string, MinutesTimeRange>
}

export interface MinutesTimeRange {
  startAt: number
  endAt: number
}

interface Props {
  currentService?: Service
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper function to format minutes to time with AM/PM (e.g., 540 -> "9:00 AM")
const formatMinutesToTime = (minutes: number): string => {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
};

// Spanish day names mapping
const dayNamesInSpanish: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

export function ServiceViewDialog({
  currentService,
  open,
  onOpenChange,
}: Props) {

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
      }}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
        <DialogHeader className="text-left">
          <DialogTitle aria-label="View Service Details">
            Detalles de Servicio
          </DialogTitle>
          <DialogDescription>
            Ver información detallada sobre este servicio.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area with accessibility improvements */}
        <ScrollArea className="h-[26.25rem] md:h-[28rem] w-full pr-4 -mr-4 py-1">
          {currentService ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{currentService.name}</h3>
                      <Badge variant="outline" className="mt-1">
                        ID: {currentService.id.substring(0, 8)}
                      </Badge>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <Badge className="text-lg bg-primary/20 text-primary hover:bg-primary/30 py-1.5 px-3">
                        {formatCurrency(currentService.price.amount, currentService.price.currency)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Service Description */}
                <Card className="md:col-span-2">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">Descripción</h3>
                    </div>
                    <Separator className="mb-3" />
                    <p className="text-sm text-muted-foreground">{currentService.description}</p>
                  </CardContent>
                </Card>

                {/* Duration Info */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">Duración</h3>
                    </div>
                    <Separator className="mb-3" />
                    <div className="text-sm text-muted-foreground">
                      <p>{currentService.duration.value} {currentService.duration.unit === 'minutes' ? 'minutos' : 'horas'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Capacity Info */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">Capacidad</h3>
                    </div>
                    <Separator className="mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Capacidad maxima de asistentes: {currentService.maxConcurrentBooks}
                    </p>
                  </CardContent>
                </Card>

                {/* Schedule Info */}
                <Card className="md:col-span-2">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">Horarios</h3>
                    </div>
                    <Separator className="mb-3" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(currentService.schedule).map(([day, timeRange]) => (
                        <div key={day} className="flex flex-col p-2 border rounded-md">
                          <span className="font-medium">{dayNamesInSpanish[day.toLowerCase()] || day}</span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {formatMinutesToTime(timeRange.startAt)} - {formatMinutesToTime(timeRange.endAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Info */}
                {/*<Card className="md:col-span-2">*/}
                {/*  <CardContent className="p-4">*/}
                {/*    <div className="flex items-center gap-2 mb-2">*/}
                {/*      <CreditCard className="h-5 w-5 text-muted-foreground" />*/}
                {/*      <h3 className="font-medium">Payment</h3>*/}
                {/*    </div>*/}
                {/*    <Separator className="mb-3" />*/}
                {/*    <div className="flex justify-between items-center">*/}
                {/*      <span className="text-sm font-medium">Price:</span>*/}
                {/*      <span className="text-sm font-semibold">*/}
                {/*        {formatCurrency(currentService.price.amount, currentService.price.currency)}*/}
                {/*      </span>*/}
                {/*    </div>*/}
                {/*  </CardContent>*/}
                {/*</Card>*/}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No service selected</p>
            </div>
          )}
        </ScrollArea>

        {/* Dialog Footer with Button */}
        <DialogFooter className="sm:justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}