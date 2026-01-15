import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface RemoveChatConfirmationModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
}

export function RemoveChatConfirmationModal({
  open,
  setOpen,
  onConfirm,
  onCancel,
}: RemoveChatConfirmationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar conversación</AlertDialogTitle>
        </AlertDialogHeader>
        <div className=''>
          <div>Estas seguro de eliminar eta conversacion? NO AFECTA ningun dato del cliente.</div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
