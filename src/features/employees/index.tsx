import { useMemo } from 'react'
import { generateRoleOptions } from '@/lib/utils.ts'
import { useGetRoles } from '@/hooks/useAuth.ts'
import { TableSkeleton } from '@/components/TableSkeleton.tsx'
import { Main } from '@/components/layout/main'
import { CustomTable } from '@/components/tables/custom-table.tsx'
import { DataTableToolbar } from '@/components/tables/data-table-toolbar.tsx'
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees.ts'
import { Separator } from '../../components/ui/separator.tsx'
import { SidebarTrigger } from '../../components/ui/sidebar.tsx'
import { EmployeeDialogs } from './components/employee-dialogs.tsx'
import { EmployeePrimaryButtons } from './components/employee-primary-buttons.tsx'
import {
  createColumns,
  globalFilterFn,
} from './components/employees-columns.tsx'
import { DataTableFacetedFilter } from './components/employees-table-filters.tsx'
import EmployeesProvider from './context/employees-context.tsx'
import { Employee } from './types.ts'

export default function Employees() {
  const { data: employees, isLoading } = useGetEmployees()
  const { data: roles } = useGetRoles()
  const columns = useMemo(() => createColumns(), [])
  const roleOptions = useMemo(() => {
    if (!roles) return []
    return generateRoleOptions(roles)
  }, [roles])

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <EmployeesProvider>
      <Main>
        <section className='p-2'>
          <div className='mb-2 w-full flex sm:items-center flex-col sm:flex-row  sm:justify-between'>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-2 items-center'>
                <SidebarTrigger variant='outline' className='sm:hidden' />
                <Separator orientation='vertical' className='h-7 sm:hidden' />
                <h1 className='text-2xl font-bold'>Empleados</h1>
              </div>

              <p className='text-muted-foreground self-start mb-2 sm:mb-0'>
                Gestiona los empleados de tu negocio aqui.
              </p>
            </div>
            <EmployeePrimaryButtons />
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            {employees && (
              <CustomTable<Employee>
                data={employees}
                columns={columns}
                globalFilterFn={globalFilterFn}
                toolbar={(table) => (
                  <DataTableToolbar
                    table={table}
                    searchPlaceholder='Buscar por nombre...'
                  >
                    <DataTableFacetedFilter
                      column={table.getColumn('roleNames')}
                      title='Roles'
                      options={roleOptions}
                    />
                  </DataTableToolbar>
                )}
              />
            )}
          </div>
        </section>
      </Main>

      <EmployeeDialogs />
    </EmployeesProvider>
  )
}
