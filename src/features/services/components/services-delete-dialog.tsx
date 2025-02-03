'use client'

import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { toast } from 'sonner'
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

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) return

    onOpenChange(false)
    toast.success('The following service has been deleted: '+ currentRow.name)
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
