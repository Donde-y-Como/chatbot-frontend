'use client'

import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { OrderWithDetails } from '@/features/store/types'
import { useDeleteOrder } from '../hooks'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: OrderWithDetails
}

export function OrderDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const deleteOrderMutation = useDeleteOrder()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteOrderMutation.mutateAsync(currentRow.id)
      toast.success(
        `La orden #${currentRow.id.slice(-8).toUpperCase()} ha sido eliminada correctamente.`
      )
      onOpenChange(false)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(`Hubo un error al eliminar la orden #${currentRow.id.slice(-8).toUpperCase()}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={isLoading}
      isLoading={isLoading}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='mr-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Eliminar orden
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            ¿Estás seguro de eliminar la orden{' '}
            <span className='font-bold'>#{currentRow.id.slice(-8).toUpperCase()}</span>?
            <br />
            Esta acción es permanente y no se puede deshacer.
          </p>
        </div>
      }
      confirmText={isLoading ? 'Eliminando...' : 'Eliminar'}
      cancelBtnText="Cancelar"
      destructive
    />
  )
}