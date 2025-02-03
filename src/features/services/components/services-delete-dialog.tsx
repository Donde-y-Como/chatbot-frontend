'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconAlertTriangle } from '@tabler/icons-react'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance.ts'
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Service } from '@/features/appointments/types.ts'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Service
}

export function ServicesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()
  const deleteServiceMutation = useMutation({
    mutationKey: ['delete-service'],
    async mutationFn() {
      const res = await api.delete(`/services/${currentRow.id}`);
      if(res.status !== 200) throw new Error('Error deleting service')
    },
    onSuccess: () => {
      toast.success(
        'El servicio ' + currentRow.name + ' ha sido eliminado correctamente.'
      )
      onOpenChange(false)
      void queryClient.setQueryData<Service[]>(['services'], (oldServices) => {
        if (oldServices === undefined) return oldServices
        return oldServices.filter((service) => service.id !== currentRow.id)
      })
    },
    onError: () => {
      toast.error('Hubo un error al eliminar el servicio ' + currentRow.name)
    }
  })

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) return
    deleteServiceMutation.mutate()
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
          Eliminar servicio
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Estas seguro de eliminar{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            Esta acción es permanente y puede afectar a sus citas creadas.
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
