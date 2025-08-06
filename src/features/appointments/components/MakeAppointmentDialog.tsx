import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useAppointmentForm } from '../hooks/useAppointmentForm'
import { useDialogState } from '../contexts/DialogStateContext'
import { MinutesTimeRange } from '../types'
import { AppointmentStepIndicator } from './AppointmentStepIndicator'
import {
  ClientServiceStep,
  DateTimeStep,
  EmployeeResourcesSelectionStep,
  NotesStep,
  StatusAndPaymentStep,
  ConfirmationStep,
} from './steps'

interface MakeAppointmentDialogProps {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultClientName?: string;
  defaultDate?: Date; // Para pre-llenar fecha cuando se hace clic en calendario
  defaultTimeRange?: MinutesTimeRange; // Para pre-llenar hora cuando se hace clic en hora específica
  defaultServiceIds?: string[]; // Para pre-seleccionar servicios
  onAppointmentCreated?: (appointmentId: string) => void; // Callback cuando se crea la cita
}

export function MakeAppointmentDialog({
  defaultOpen = false,
  onOpenChange,
  defaultClientName,
  defaultDate,
  defaultTimeRange,
  defaultServiceIds,
  onAppointmentCreated
}: MakeAppointmentDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const { openDialog, closeDialog } = useDialogState()
  const {
    activeStep,
    clientId,
    serviceIds,
    date,
    timeRange,
    selectedEmployeeIds,
    loading,
    selectedClient,
    selectedServices,
    availableEmployees,
    loadingEmployees,
    setSelectedEmployeeIds,

    // Nuevos campos
    status,
    paymentStatus,
    deposit,
    notes,
    setStatus,
    setPaymentStatus,
    setDeposit,
    setNotes,

    // Campos de equipos y consumibles
    selectedEquipmentIds,
    consumableUsages,

    setActiveStep,
    setClientId,
    setServiceIds,
    toggleServiceSelection,
    setDate,
    setTimeRange,
    toggleEmployeeSelection,
    toggleEquipmentSelection,
    updateConsumableUsage,
    resetForm,
    handleSubmit,
    hasFilledFields,
  } = useAppointmentForm(
    defaultClientName, 
    () => {
      // Usar la función de cambio externa si está disponible, o la interna si no
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setInternalOpen(false);
      }
    }, 
    undefined, 
    defaultDate, 
    defaultTimeRange,
    defaultServiceIds,
    onAppointmentCreated
  )

  // Determinar si se usa el control externo o interno
  const open = onOpenChange ? defaultOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasFilledFields()) {
      return;
    }

    setOpen(newOpen);
    if (newOpen) {
      openDialog();
    } else {
      closeDialog();
      resetForm();
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setOpen(false)
    resetForm()
  }

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevenir que clicks dentro del dialog se propaguen
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Solo mostrar el trigger si no se está controlando externamente */}
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button className='w-full bg-primary hover:bg-primary/90 transition-all duration-300 appointment-dialog-trigger'>
            Agendar Cita
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className='sm:max-w-3xl  overflow-y-auto' onClick={handleDialogClick}>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>Agendar Cita</DialogTitle>
          <DialogDescription>
            Complete los siguientes pasos para agendar su cita
          </DialogDescription>
        </DialogHeader>

        <div className=''>
          {/* Progress indicator */}
          <AppointmentStepIndicator activeStep={activeStep} />

          <div className='flex flex-col'>
            <Tabs defaultValue='1' value={activeStep.toString()} className='flex-1'>
              {/* Step 1: Client and Service Selection */}
              <TabsContent value='1' className='flex flex-col'>
                <ClientServiceStep
                  clientId={clientId}
                  serviceIds={serviceIds}
                  onClientChange={setClientId}
                  onServiceIdsChange={setServiceIds}
                  onServiceToggle={toggleServiceSelection}
                  onNext={() => setActiveStep(2)}
                  onCancel={handleCancel}
                />
              </TabsContent>

              {/* Step 2: Date and Time Selection */}
              <TabsContent value='2' className='flex flex-col h-full'>
                <DateTimeStep
                  date={date}
                  onDateChange={setDate}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                  onNext={() => setActiveStep(3)}
                  onBack={() => {
                    setActiveStep(1)
                    setDate(new Date())
                  }}
                  onCancel={handleCancel}
                />
              </TabsContent>

              {/* Step 3: Employee, Equipment and Consumables Selection (Optional) */}
              <TabsContent value='3' className='flex flex-col h-full'>
                <EmployeeResourcesSelectionStep
                  availableEmployees={availableEmployees}
                  loadingEmployees={loadingEmployees}
                  selectedEmployeeIds={selectedEmployeeIds}
                  onEmployeeToggle={toggleEmployeeSelection}
                  selectedEquipmentIds={selectedEquipmentIds}
                  consumableUsages={consumableUsages}
                  onEquipmentToggle={toggleEquipmentSelection}
                  onConsumableUsageUpdate={updateConsumableUsage}
                  onNext={() => setActiveStep(4)}
                  onBack={() => { setActiveStep(2); setSelectedEmployeeIds([]) }}
                  onCancel={handleCancel}
                />
              </TabsContent>

              {/* Step 4: Notes (Optional) */}
              <TabsContent value='4' className='flex flex-col h-full'>
                <NotesStep
                  notes={notes}
                  onNotesChange={setNotes}
                  onNext={() => setActiveStep(5)}
                  onBack={() => setActiveStep(3)}
                  onCancel={handleCancel}
                />
              </TabsContent>

              {/* Step 5: Status and Payment (Optional) */}
              <TabsContent value='5' className='flex flex-col h-full'>
                <StatusAndPaymentStep
                  status={status}
                  paymentStatus={paymentStatus}
                  deposit={deposit}
                  onStatusChange={setStatus}
                  onPaymentStatusChange={setPaymentStatus}
                  onDepositChange={setDeposit}
                  onNext={() => setActiveStep(6)}
                  onBack={() => setActiveStep(4)}
                  onCancel={handleCancel}
                />
              </TabsContent>

              {/* Step 6: Confirmation */}
              <TabsContent value='6' className='flex flex-col h-full'>
                <ConfirmationStep
                  date={date}
                  timeRange={timeRange}
                  selectedClient={selectedClient}
                  selectedServices={selectedServices}
                  selectedEmployeeIds={selectedEmployeeIds}
                  selectedEquipmentIds={selectedEquipmentIds}
                  consumableUsages={consumableUsages}
                  status={status}
                  paymentStatus={paymentStatus}
                  deposit={deposit}
                  notes={notes}
                  loading={loading}
                  onSubmit={handleSubmit}
                  onBack={() => setActiveStep(5)}
                  onCancel={handleCancel}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}