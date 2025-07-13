import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, CheckCircle2, Clock, Package, User, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { MakeAppointmentDialog } from '@/features/appointments/components/MakeAppointmentDialog';
import { usePendingServices, useScheduleClientServices } from '../hooks/usePendingServices';
import { PendingServiceInfo, ServiceSelection } from '../types';


interface PendingServicesTabProps {
  clientId: string;
  clientName: string;
}

export function PendingServicesTab({ clientId, clientName }: PendingServicesTabProps) {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [serviceIdsForAppointment, setServiceIdsForAppointment] = useState<string[]>([]);

  const { data: pendingServicesResponse, isLoading, error, refetch } = usePendingServices(clientId);
  const scheduleServicesMutation = useScheduleClientServices();

  // Filter services that still have pending appointments (pendingCount > 0)
  const allServices = pendingServicesResponse?.data || [];
  const pendingServices = allServices.filter(service => service.serviceItem.pendingCount > 0);

  const handleServiceSelection = (serviceKey: string, checked: boolean) => {
    const newSelection = new Set(selectedServices);
    if (checked) {
      newSelection.add(serviceKey);
    } else {
      newSelection.delete(serviceKey);
    }
    setSelectedServices(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select services that can still be scheduled (pendingCount > 0)
      const selectableServiceKeys = pendingServices
        .filter(service => service.serviceItem.pendingCount > 0)
        .map(service => `${service.orderId}-${service.serviceItem.itemId}`);
      setSelectedServices(new Set(selectableServiceKeys));
    } else {
      setSelectedServices(new Set());
    }
  };

  const handleScheduleSelected = () => {
    if (selectedServices.size === 0) return;

    const serviceIds: string[] = Array.from(selectedServices)
      .map((serviceKey) => {
        // Find the service that matches this key to get the correct itemId
        const service = pendingServices.find(
          (s) => `${s.orderId}-${s.serviceItem.itemId}` === serviceKey
        )
        return service?.serviceItem.itemId
      })
      .filter((itemId): itemId is string => itemId !== undefined) // Type-safe filter

    // Remove duplicates in case the same service appears in multiple orders
    const uniqueServiceIds = [...new Set(serviceIds)];

    setServiceIdsForAppointment(uniqueServiceIds);
    setAppointmentDialogOpen(true);
  };

  const handleScheduleSingle = (service: PendingServiceInfo) => {
    setServiceIdsForAppointment([service.serviceItem.itemId]);
    setAppointmentDialogOpen(true);
  };

  const handleAppointmentCreated = async (appointmentId: string) => {
    if (serviceIdsForAppointment.length === 0) return;

    // Group services by order for the API call
    const serviceSelections: ServiceSelection[] = [];
    const servicesByOrder = new Map<string, string[]>();

    serviceIdsForAppointment.forEach(serviceId => {
      const service = pendingServices.find(s => s.serviceItem.itemId === serviceId);
      if (service) {
        if (!servicesByOrder.has(service.orderId)) {
          servicesByOrder.set(service.orderId, []);
        }
        servicesByOrder.get(service.orderId)!.push(serviceId);
      }
    });

    servicesByOrder.forEach((serviceItemIds, orderId) => {
      serviceSelections.push({ orderId, serviceItemIds });
    });

    try {
      await scheduleServicesMutation.mutateAsync({
        clientId,
        request: {
          serviceSelections,
          appointmentId
        }
      });

      // Clear selections and close dialog
      setSelectedServices(new Set());
      setServiceIdsForAppointment([]);
      setAppointmentDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Error scheduling services:', error);
    }
  };

  const formatPrice = (price: { amount: number; currency: string }) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: price.currency,
    }).format(price.amount);
  };

  const getServiceKey = (service: PendingServiceInfo) => 
    `${service.orderId}-${service.serviceItem.itemId}`;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error al cargar los servicios pendientes. 
          <Button variant="link" onClick={() => refetch()} className="p-0 ml-2 h-auto">
            Intentar de nuevo
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (pendingServices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <CardTitle className="text-lg mb-2">No hay servicios pendientes</CardTitle>
          <CardDescription>
            Todos los servicios de este cliente han sido agendados completamente.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  // Calculate selection stats
  const selectableServices = pendingServices.filter(service => service.serviceItem.pendingCount > 0);
  const allSelected = selectedServices.size === selectableServices.length && selectableServices.length > 0;
  const someSelected = selectedServices.size > 0;
  
  // Calculate total pending appointments
  const totalPendingAppointments = pendingServices.reduce((total, service) => total + service.serviceItem.pendingCount, 0);

  return (
    <div className="space-y-4 p-2">
      {/* Header with bulk actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            aria-label="Seleccionar todos los servicios"
            disabled={selectableServices.length === 0}
          />
          <div>
            <p className="font-medium">
              {pendingServices.length} servicio{pendingServices.length !== 1 ? 's' : ''} pendiente{pendingServices.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-muted-foreground">
              {totalPendingAppointments} cita{totalPendingAppointments !== 1 ? 's' : ''} por agendar
              {someSelected && (
                <span className="ml-2">• {selectedServices.size} seleccionado{selectedServices.size !== 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
        </div>
        
        {someSelected && (
          <Button 
            onClick={handleScheduleSelected}
            disabled={scheduleServicesMutation.isPending}
            className="w-full sm:w-auto"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Seleccionados ({selectedServices.size})
          </Button>
        )}
      </div>

      {/* Services list */}
      <div className="space-y-3">
        {pendingServices.map((service) => {
          const serviceKey = getServiceKey(service);
          const isSelected = selectedServices.has(serviceKey);
          const orderDate = format(new Date(service.orderCreatedAt), 'dd/MM/yyyy', { locale: es });
          
          // New progress calculations
          const progress = service.serviceItem.scheduledCount / service.serviceItem.quantity;
          const progressPercentage = Math.round(progress * 100);
          const canScheduleMore = service.serviceItem.pendingCount > 0;
          const fullyScheduled = service.serviceItem.scheduledCount === service.serviceItem.quantity;

          return (
            <Card key={serviceKey} className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleServiceSelection(serviceKey, !!checked)}
                      aria-label={`Seleccionar ${service.serviceItem.name}`}
                      disabled={!canScheduleMore}
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {service.serviceItem.name}
                        {service.serviceItem.quantity > 1 && (
                          <Badge variant={fullyScheduled ? "default" : "secondary"} className="text-xs">
                            {service.serviceItem.scheduledCount}/{service.serviceItem.quantity}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Package className="h-3 w-3" />
                        Orden del {orderDate}
                        <Badge variant="outline" className="text-xs">
                          {service.orderId.slice(-8)}
                        </Badge>
                      </CardDescription>
                      
                      {/* Progress indicator for multi-quantity services */}
                      {service.serviceItem.quantity > 1 && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progreso de agendamiento</span>
                            <span>{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all duration-300" 
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {service.serviceItem.pendingCount} pendiente{service.serviceItem.pendingCount !== 1 ? 's' : ''}
                            {service.serviceItem.appointmentIds.length > 0 && (
                              <span className="ml-2">
                                • {service.serviceItem.appointmentIds.length} cita{service.serviceItem.appointmentIds.length !== 1 ? 's' : ''} creada{service.serviceItem.appointmentIds.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(service.serviceItem.finalPrice)}</p>
                    <p className="text-sm text-muted-foreground">
                      Cant. {service.serviceItem.quantity}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    {canScheduleMore ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        {service.serviceItem.quantity === 1 
                          ? "Requiere programación de cita"
                          : `${service.serviceItem.pendingCount} pendiente${service.serviceItem.pendingCount !== 1 ? 's' : ''} de agendar`
                        }
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Completamente agendado
                      </>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={() => handleScheduleSingle(service)}
                    disabled={scheduleServicesMutation.isPending || !canScheduleMore}
                    variant={canScheduleMore ? "default" : "outline"}
                    className="w-full sm:w-auto"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {canScheduleMore 
                      ? (service.serviceItem.quantity === 1 ? "Agendar" : `Agendar (${service.serviceItem.pendingCount})`)
                      : "Agendado"
                    }
                  </Button>
                </div>
                
                {service.serviceItem.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <p className="text-sm">{service.serviceItem.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Appointment Dialog */}
      <MakeAppointmentDialog
        defaultOpen={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
        defaultClientName={clientName}
        defaultServiceIds={serviceIdsForAppointment}
        onAppointmentCreated={handleAppointmentCreated}
      />
    </div>
  );
}