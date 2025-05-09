import { useState } from 'react'
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
import { AppointmentStepIndicator } from './AppointmentStepIndicator'
import {
  ClientServiceStep,
  DateTimeStep,
  EmployeeSelectionStep,
  ConfirmationStep,
} from './steps'

export function MakeAppointmentDialog() {
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
    loadingEmployees,
    setSelectedEmployeeIds,

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
  } = useAppointmentForm(() => {
    setOpen(false)
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasFilledFields()) {
      return
    }

    setOpen(newOpen)
    if (!newOpen) resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className='w-full bg-primary hover:bg-primary/90 transition-all duration-300 appointment-dialog-trigger'>
          Agendar Cita
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-3xl  overflow-y-auto'>
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
                  onCancel={() => {
                    setOpen(false)
                    resetForm()
                  }}
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
                  onCancel={() => {
                    setOpen(false)
                    resetForm()
                  }}
                />
              </TabsContent>

              {/* Step 3: Employee Selection (Optional) */}
              <TabsContent value='3' className='flex flex-col h-full'>
                <EmployeeSelectionStep
                  loadingEmployees={loadingEmployees}
                  availableEmployees={availableEmployees}
                  selectedEmployeeIds={selectedEmployeeIds}
                  onEmployeeToggle={toggleEmployeeSelection}
                  onNext={() => setActiveStep(4)}
                  onBack={() => { setActiveStep(2); setSelectedEmployeeIds([]) }}
                  onCancel={() => {
                    setOpen(false)
                    resetForm()
                  }}
                />
              </TabsContent>

              {/* Step 4: Confirmation */}
              <TabsContent value='4' className='flex flex-col h-full'>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}