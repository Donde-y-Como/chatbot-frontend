import { useClients } from "../context/clients-context"
import { ClientActionDialog } from "./client-action-dialog"
import { ClientDeleteDialog } from "./client-delete-dialog"
import { ClientViewDialog } from "./client-view-dialog"
import { ClientImportDialog } from "./client-import-dialog"
import { SendPortalAccessDialog } from "./send-portal-access-dialog"

export function ClientDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useClients()
  return (
    <>
      <ClientImportDialog
        key='client-import'
        open={open === 'import'}
        onOpenChange={() => setOpen(null)}
      />

      <ClientActionDialog
        key='client-add'
        open={open === 'add'}
        onOpenChange={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <ClientActionDialog
            key={`client-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentClient={currentRow}
          />

          <ClientViewDialog
            key={`client-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentClient={currentRow}
          />

          <SendPortalAccessDialog
            client={currentRow}
            open={open === 'portal'}
            onOpenChange={() => {
              setOpen('portal')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
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
