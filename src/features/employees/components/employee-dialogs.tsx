import { useEmployees } from '../context/employees-context.tsx'
import { EmployeeActionDialog } from './employee-action-dialog.tsx'
import { EmployeeDeleteDialog } from './employee-delete-dialog.tsx'
import { EmployeeViewDialog } from './employee-view-dialog.tsx'

export function EmployeeDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useEmployees()
  return (
    <>
      <EmployeeActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <EmployeeActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentEmployee={currentRow}
          />

          <EmployeeViewDialog
            key={`user-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentEmployee={currentRow}
          />
          
          <EmployeeDeleteDialog
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
