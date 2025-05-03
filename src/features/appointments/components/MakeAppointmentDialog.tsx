import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useAppointmentForm } from '../hooks/useAppointmentForm'
import { AppointmentStepIndicator } from './AppointmentStepIndicator'
import {
  ClientServiceStep,
  DateTimeStep,
  EmployeeSelectionStep,
  ConfirmationStep
} from './steps'

interface MakeAppointmentDialogProps {
  defaultClientName?: string
  open?: boolean
  setOpen?: (open: boolean) => void
}

/**
 * Dialog component for creating a new appointment
 * This component can be used standalone or via the AppointmentDialogProvider context
 */
export function MakeAppointmentDialog({
  defaultClientName,
  open: externalOpen,
  setOpen: externalSetOpen
}: MakeAppointmentDialogProps) {
  // Combine external and internal state for flexibility
  const {
    // State and data
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
    
    // Actions
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
  } = useAppointmentForm(defaultClientName, () => {
    if (externalSetOpen) externalSetOpen(false)
  })

  // Determine whether to use external or internal open state
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalSetOpen || setInternalOpen

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    // If closing and has filled fields, don't close
    if (!newOpen && hasFilledFields()) {
      return
    }
    
    // Otherwise, update open state normally
    setOpen(newOpen)
    if (!newOpen) resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 appointment-dialog-trigger">
          Agendar Cita
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Agendar Cita</DialogTitle>
          <DialogDescription>
            Complete los siguientes pasos para agendar su cita
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {/* Progress indicator */}
          <AppointmentStepIndicator activeStep={activeStep} />

          <Tabs defaultValue="1" value={activeStep.toString()}>
            {/* Step 1: Client and Service Selection */}
            <TabsContent value="1">
              <ClientServiceStep
                clientId={clientId}
                serviceIds={serviceIds}
                onClientChange={setClientId}
                onServiceIdsChange={setServiceIds}
                onServiceToggle={toggleServiceSelection}
                onNext={() => setActiveStep(2)}
                onCancel={() => {
                  setOpen(false)
                  resetForm()
                }}
              />
            </TabsContent>

            {/* Step 2: Date and Time Selection */}
            <TabsContent value="2">
              <DateTimeStep
                date={date}
                onDateChange={setDate}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                onNext={() => setActiveStep(3)}
                onBack={() => setActiveStep(1)}
                onCancel={() => {
                  setOpen(false)
                  resetForm()
                }}
              />
            </TabsContent>

            {/* Step 3: Employee Selection (Optional) */}
            <TabsContent value="3">
              <EmployeeSelectionStep
                availableEmployees={availableEmployees}
                selectedEmployeeIds={selectedEmployeeIds}
                onEmployeeToggle={toggleEmployeeSelection}
                onNext={() => setActiveStep(4)}
                onBack={() => setActiveStep(2)}
                onCancel={() => {
                  setOpen(false)
                  resetForm()
                }}
              />
            </TabsContent>

            {/* Step 4: Confirmation */}
            <TabsContent value="4">
              <ConfirmationStep
                date={date}
                timeRange={timeRange}
                selectedClient={selectedClient}
                selectedServices={selectedServices}
                selectedEmployeeIds={selectedEmployeeIds}
                availableEmployees={availableEmployees}
                loading={loading}
                onSubmit={handleSubmit}
                onBack={() => setActiveStep(3)}
                onCancel={() => {
                  setOpen(false)
                  resetForm()
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
