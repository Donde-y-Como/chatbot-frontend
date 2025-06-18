import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Service } from '@/features/appointments/types.ts'

type ServicesDialogType = 'add' | 'edit' | 'delete' | 'view' | 'quick-add'

interface ServicesContextType {
  open: ServicesDialogType | null
  setOpen: (str: ServicesDialogType | null) => void
  currentRow: Service | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Service | null>>
  handleSelectServiceType: (type: 'quick' | 'complete') => void
}

const ServicesContext = React.createContext<ServicesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ServicesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ServicesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Service | null>(null)

  const handleSelectServiceType = (type: 'quick' | 'complete') => {
    if (type === 'quick') {
      setOpen('quick-add')
    } else {
      setOpen('add')
    }
  }

  return (
    <ServicesContext value={{ 
      open, 
      setOpen, 
      currentRow, 
      setCurrentRow, 
      handleSelectServiceType 
    }}>
      {children}
    </ServicesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useServices = () => {
  const servicesContext = React.useContext(ServicesContext)

  if (!servicesContext) {
    throw new Error('useServices has to be used within <ServicesContext>')
  }

  return servicesContext
}
