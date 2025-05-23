import { useState } from 'react'
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
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Appointment } from '@/features/appointments/types.ts'
import { useAppointmentForm } from '../hooks/useAppointmentForm'
import { AppointmentStepIndicator } from './AppointmentStepIndicator'
import {
  ClientServiceStep,
  ConfirmationStep,
  DateTimeStep,
  EmployeeSelectionStep,
} from './steps'

export function EditAppointmentDialog({
  appointment,
}: {
  appointment: Appointment
}) {
  const [open, setOpen] = useState(false)

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
    () => {
      setOpen(false)
    },
    appointment
  )

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasFilledFields()) {
      return
    }

    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size='sm' variant='outline' className='h-9'>
          <Edit className='h-4 w-4 mr-2' />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-auto'>
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
                onCancel={() => {
                  setOpen(false)
                  resetForm()
                }}
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
                onCancel={() => {
                  setOpen(false)
                  resetForm()
                }}
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
                onCancel={() => {
                  setOpen(false)
                  resetForm()
                }}
              />
            </TabsContent>

            {/* Step 4: Confirmation */}
            <TabsContent value='4'>
              <ConfirmationStep
                date={date}
                timeRange={timeRange}
                selectedClient={selectedClient}
                selectedServices={selectedServices}
                selectedEmployeeIds={selectedEmployeeIds}
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
