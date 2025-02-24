import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconAlertTriangle } from '@tabler/icons-react'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance.ts'
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Employee } from '../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Employee
}

export function EmployeeDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()
  const deleteEmployeeMutation = useMutation({
    mutationKey: ['delete-employee'],
    async mutationFn() {
      const res = await api.delete(`/employees/${currentRow.id}`);
      if (res.status !== 200) throw new Error('Error deleting employees')
    },
    onSuccess: () => {
      toast.success('Empleado ha sido eliminado correctamente.')
      onOpenChange(false)
      void queryClient.setQueryData<Employee[]>(['employees'], (oldEmployees) => {
        if (oldEmployees === undefined) return oldEmployees
        return oldEmployees.filter((employee) => employee.id !== currentRow.id)
      })
    },
    onError: () => {
      toast.error('Hubo un error al eliminar el empleado')
    }
  })

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) return
    deleteEmployeeMutation.mutate()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='mr-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Eliminar empleado
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            ¿Estás seguro de eliminar al empleado?<br />
            Esta acción es permanente y puede afectar a sus citas creadas. <br />
            Escribe <b>{currentRow.name}</b> para confirmar.
          </p>

          <Label className='my-2'>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Escribe ${currentRow.name} para confirmar.`}
            />
          </Label>

          {/*<Alert variant='destructive'>*/}
          {/*  <AlertTitle>Aguas!</AlertTitle>*/}
          {/*  <AlertDescription>*/}
          {/*    Por favor sé cuidadoso al eliminar servicios, esta acción no se puede deshacer.*/}
          {/*  </AlertDescription>*/}
          {/*</Alert>*/}
        </div>
      }
      confirmText='Eliminar'
      destructive
    />
  )
}
