import { useServices } from '../context/services-context.tsx'
import { ServiceActionDialog } from './service-action-dialog.tsx'
import { ServicesDeleteDialog } from './services-delete-dialog.tsx'
import { ServiceViewDialog } from '@/features/services/components/service-view-dialog.tsx'
import { QuickServiceDialog } from './quick-service-dialog.tsx'

export function ServicesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useServices()
  return (
    <>
      {/* Diálogo para servicio rápido */}
      <QuickServiceDialog
        key='quick-service-add'
        open={open === 'quick-add'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'quick-add' : null)}
      />

      {/* Diálogo para servicio completo */}
      <ServiceActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'add' : null)}
      />

      {currentRow && (
        <>
          <ServiceViewDialog
            key={`user-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentService={currentRow}
          />

          <ServiceActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentService={currentRow}
          />

          <ServicesDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
