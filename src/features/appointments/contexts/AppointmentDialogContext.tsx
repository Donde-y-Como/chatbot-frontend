import { createContext, useContext, useState } from 'react'
import { MakeAppointmentDialog } from '../components/MakeAppointmentDialog'

/**
 * Context for managing the appointment dialog state and opening it from anywhere in the app
 */
type AppointmentDialogContextType = {
  openDialog: (clientName?: string) => void
}

const AppointmentDialogContext = createContext<AppointmentDialogContextType | undefined>(undefined)

/**
 * Hook to access the appointment dialog context
 * Allows components to open the appointment dialog from anywhere in the app
 */
export function useAppointmentDialog() {
  const context = useContext(AppointmentDialogContext)
  if (context === undefined) {
    throw new Error('useAppointmentDialog debe ser usado dentro de un AppointmentDialogProvider')
  }
  return context
}

/**
 * Provider component for the appointment dialog context
 */
export function AppointmentDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [defaultClient, setDefaultClient] = useState<string | undefined>(undefined)
  
  const openDialog = (clientName?: string) => {
    setDefaultClient(clientName)
    setDialogOpen(true)
  }
  
  return (
    <AppointmentDialogContext.Provider value={{ openDialog }}>
      {dialogOpen && (
        <MakeAppointmentDialog 
          defaultClientName={defaultClient} 
          open={dialogOpen} 
          setOpen={setDialogOpen} 
        />
      )}
      {children}
    </AppointmentDialogContext.Provider>
  )
}

// Define a global window interface for the dialog opener
declare global {
  interface Window {
    openAppointmentDialog?: (clientName?: string) => void
  }
}
