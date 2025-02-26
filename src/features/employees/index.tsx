import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { useGetEmployees } from '@/features/appointments/hooks/useGetEmployees.ts'
import { columns } from './components/employees-columns.tsx'
import { EmployeeDialogs } from './components/employee-dialogs.tsx'
import { EmployeePrimaryButtons } from './components/employee-primary-buttons.tsx'
import EmployeesProvider from './context/employees-context.tsx'
import { TableSkeleton } from '@/components/TableSkeleton.tsx'
import { CustomTable } from '@/components/tables/custom-table.tsx'
import { Employee } from './types.ts'
import { SidebarTrigger } from '../../components/ui/sidebar.tsx'
import { Separator } from '../../components/ui/separator.tsx'

export default function Employees() {
  const { data: employees, isLoading } = useGetEmployees()

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <EmployeesProvider>
      <Main fixed>
        <section className='p-2'>
          <div
            className="mb-2 w-full flex sm:items-center flex-col sm:flex-row  sm:justify-between">
            <div className='flex flex-col gap-2'>
              <div className='flex gap-2 items-center'>
                <SidebarTrigger variant='outline' className='sm:hidden' />
                <Separator orientation='vertical' className='h-7 sm:hidden' />
                <h1 className='text-2xl font-bold'>Empleados</h1>
              </div>

              <p className="text-muted-foreground self-start mb-2 sm:mb-0">
                Gestiona los empleados de tu negocio aqui.
              </p>
            </div>
            <EmployeePrimaryButtons />
          </div>
          <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
            {employees && <CustomTable<Employee> data={employees} columns={columns} />}
          </div>
        </section>
      </Main>

      <EmployeeDialogs />
    </EmployeesProvider>
  )
}
