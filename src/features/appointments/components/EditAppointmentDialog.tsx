import React, { useState } from 'react'
import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Appointment } from '@/features/appointments/types.ts'
import { useAppointmentForm } from '../hooks/useAppointmentForm'
import { isAppointmentPast } from '../utils/formatters'
import { AppointmentStepIndicator } from './AppointmentStepIndicator'
import {
  ClientServiceStep,
  ConfirmationStep,
  DateTimeStep,
  EmployeeSelectionStep,
  NotesStep,
  StatusAndPaymentStep,
} from './steps'

export function EditAppointmentDialog({
  appointment,
}: {
  appointment: Appointment
}) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevenir que se abra el diálogo padre
    setOpen(true)
  }

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

    // Nuevos campos
    status,
    paymentStatus,
    deposit,
    notes,
    setStatus,
    setPaymentStatus,
    setDeposit,
    setNotes,

    setActiveStep,
    setClientId,
    setServiceIds,
    toggleServiceSelection,
    setDate,
    setTimeRange,
    toggleEmployeeSelection,
    resetForm,
    handleSubmit,
    hasFilledFields,
    loadingEmployees,
  } = useAppointmentForm(
    undefined, // defaultClientName - no necesario para editar
    handleSuccess,
    appointment
  )

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasFilledFields()) {
      return
    }

    if (newOpen) {
      // Si se intenta abrir mediante el trigger, no hacer nada
      // porque ya manejamos esto en handleButtonClick
      return
    }

    setOpen(newOpen)
  }

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

  const isAppointmentExpired = isAppointmentPast(appointment.date, appointment.timeRange)

  if (isAppointmentExpired) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size='sm' 
              variant='outline' 
              className='h-9' 
              disabled
              onClick={(e) => e.stopPropagation()}
            >
              <Edit className='h-4 w-4 mr-2' />
              Editar
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>No se pueden editar citas que ya pasaron</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm' variant='outline' className='h-9' onClick={handleButtonClick}>
          <Edit className='h-4 w-4 mr-2' />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-auto' onClick={handleDialogClick}>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>Editar Cita</DialogTitle>
          <DialogDescription>Cambie los detalles de la cita</DialogDescription>
        </DialogHeader>

        <div className='mt-2'>
          <AppointmentStepIndicator activeStep={activeStep} />

          <Tabs defaultValue='1' value={activeStep.toString()}>
            <TabsContent value='1'>
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
            <TabsContent value='2'>
              <DateTimeStep
                date={date}
                onDateChange={setDate}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                onNext={() => setActiveStep(3)}
                onBack={() => setActiveStep(1)}
                onCancel={handleCancel}
              />
            </TabsContent>

            {/* Step 3: Employee Selection (Optional) */}
            <TabsContent value='3'>
              <EmployeeSelectionStep
                availableEmployees={availableEmployees}
                selectedEmployeeIds={selectedEmployeeIds}
                loadingEmployees={loadingEmployees}
                onEmployeeToggle={toggleEmployeeSelection}
                onNext={() => setActiveStep(4)}
                onBack={() => setActiveStep(2)}
                onCancel={handleCancel}
              />
            </TabsContent>

            {/* Step 4: Notes (Optional) */}
            <TabsContent value='4'>
              <NotesStep
                notes={notes}
                onNotesChange={setNotes}
                onNext={() => setActiveStep(5)}
                onBack={() => setActiveStep(3)}
                onCancel={handleCancel}
              />
            </TabsContent>

            {/* Step 5: Status and Payment */}
            <TabsContent value='5'>
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
            <TabsContent value='6'>
              <ConfirmationStep
                date={date}
                timeRange={timeRange}
                selectedClient={selectedClient}
                selectedServices={selectedServices}
                selectedEmployeeIds={selectedEmployeeIds}
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
      </DialogContent>
    </Dialog>
  )
}
