'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconAlertTriangle } from '@tabler/icons-react'
import { toast } from 'sonner'
import { api } from '@/api/axiosInstance.ts'
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
  const [isLoading, setIsLoading] = useState(false)
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
      setIsLoading(false)
      void queryClient.setQueryData<Service[]>(['services'], (oldServices) => {
        if (oldServices === undefined) return oldServices
        return oldServices.filter((service) => service.id !== currentRow.id)
      })
    },
    onError: () => {
      toast.error('Hubo un error al eliminar el servicio ' + currentRow.name)
      setIsLoading(false)
    }
  })

  const handleDelete = () => {
    setIsLoading(true)
    deleteServiceMutation.mutate()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={isLoading}
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
            ¿Estás seguro de eliminar el servicio{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            Esta acción es permanente y puede afectar a las citas creadas.
          </p>
        </div>
      }
      confirmText={isLoading ? 'Eliminando...' : 'Eliminar'}
      destructive
    />
  )
}
