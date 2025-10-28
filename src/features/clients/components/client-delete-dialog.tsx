import { IconAlertTriangle } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ClientApiService } from '../services/ClientApiService'
import { ClientPrimitives } from '../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ClientPrimitives
}

export function ClientDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()
  const deleteClientMutation = useMutation({
    mutationKey: ['delete-client'],
    async mutationFn() {
      await ClientApiService.delete(currentRow.id)
    },
    onSuccess: () => {
      toast.success('El cliente ha sido eliminado correctamente.')
      onOpenChange(false)
      queryClient.setQueryData<ClientPrimitives[]>(['clients'], (oldClients) => {
        if (oldClients === undefined) return oldClients
        return oldClients.filter((client) => client.id !== currentRow.id)
      })
    },
    onError: () => {
      toast.error('Hubo un error al eliminar el cliente')
    }
  })

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) return
    deleteClientMutation.mutate()
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
          Eliminar cliente
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            ¿Estás seguro de eliminar al cliente?<br />
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
        </div>
      }
      confirmText='Eliminar'
      destructive
    />
  )
}
