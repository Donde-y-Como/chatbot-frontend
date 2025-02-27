import { useClients } from "../context/clients-context"
import { ClientActionDialog } from "./client-action-dialog"
import { ClientDeleteDialog } from "./client-delete-dialog"

export function ClientDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useClients()
  return (
    <>
      <ClientActionDialog
        key='client-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <ClientActionDialog
            key={`client-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentClient={currentRow}
          />

          {/* <ClientDeleteDialog
            key={`client-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          /> */}
        </>
      )}
    </>
  )
}
