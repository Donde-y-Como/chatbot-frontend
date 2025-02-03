import { useServices } from '../context/services-context.tsx'
import { ServiceActionDialog } from './service-action-dialog.tsx'
import { ServicesDeleteDialog } from './services-delete-dialog.tsx'

export function ServicesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useServices()
  return (
    <>
      <ServiceActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <ServiceActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentService={currentRow}
          />

          <ServicesDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
