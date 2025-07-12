import React, { createContext, useContext, useState } from 'react'

interface DialogStateContextType {
  hasOpenDialogs: boolean
  openDialog: () => void
  closeDialog: () => void
  isOpenConnectionClient: boolean
  openConnectionClient: (clientData?: any) => void
  closeConnectionClient: () => void
  selectedClientData: any
}

const DialogStateContext = createContext<DialogStateContextType | null>(null)

export function DialogStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [openDialogCount, setOpenDialogCount] = useState(0)
  const [openConnectionClientDialog, setOpenConnectionClientDialog] =
    useState(false)
  const [selectedClientData, setSelectedClientData] = useState<any>(null)

  const openDialog = () => {
    setOpenDialogCount((prev) => prev + 1)
  }

  const closeDialog = () => {
    setOpenDialogCount((prev) => Math.max(0, prev - 1))
  }

  const openConnectionClient = (clientData?: any) => {
    setSelectedClientData(clientData)
    setOpenConnectionClientDialog(true)
  }
  const closeConnectionClient = () => {
    setOpenConnectionClientDialog(false)
    setSelectedClientData(null)
  }

  return (
    <DialogStateContext.Provider
      value={{
        hasOpenDialogs: openDialogCount > 0,
        openDialog,
        closeDialog,
        isOpenConnectionClient: openConnectionClientDialog,
        openConnectionClient,
        closeConnectionClient,
        selectedClientData,
      }}
    >
      {children}
    </DialogStateContext.Provider>
  )
}

export function useDialogState() {
  const context = useContext(DialogStateContext)
  if (!context) {
    throw new Error('useDialogState must be used within DialogStateProvider')
  }
  return context
}
