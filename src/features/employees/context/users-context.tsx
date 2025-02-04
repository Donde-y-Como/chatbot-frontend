import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Employee } from '@/features/appointments/types.ts'

type EmployeeDialogType = | 'add' | 'edit' | 'delete'

interface EmployeesContextType {
  open: EmployeeDialogType | null
  setOpen: (str: EmployeeDialogType | null) => void
  currentRow: Employee | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Employee | null>>
}

const EmployeesContext = React.createContext<EmployeesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function EmployeesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<EmployeeDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Employee | null>(null)

  return (
    <EmployeesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </EmployeesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useEmployees = () => {
  const employeeContext = React.useContext(EmployeesContext)

  if (!employeeContext) {
    throw new Error('useEmployees has to be used within <EmployeesContext>')
  }

  return employeeContext
}
