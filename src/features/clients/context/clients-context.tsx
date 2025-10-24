import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { ClientPrimitives } from '../types'

type ClientDialogType =  'add' | 'edit' | 'delete' | 'view' | 'import'
interface ClientsContextType {
  open: ClientDialogType | null
  setOpen: (str: ClientDialogType | null) => void
  currentRow: ClientPrimitives | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ClientPrimitives | null>>
}

const ClientsContext = React.createContext<ClientsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ClientsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ClientDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ClientPrimitives | null>(null)

  return (
    <ClientsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ClientsContext>
  )
}

 
export const useClients = () => {
  const clientsContext = React.useContext(ClientsContext)

  if (!clientsContext) {
    throw new Error('useClients has to be used within <ClientsContext>')
  }

  return clientsContext
}
