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

export default function Employees() {
  const { data: employees, isLoading } = useGetEmployees()

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <EmployeesProvider>
      <Header fixed>
        <Search />
      </Header>

      <Main fixed>
        <section className='px-2'>
          <div
            className="mb-2 flex items-center justify-center text-center sm:text-justify sm:justify-between space-y-2 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Empleados</h2>
              <p className="text-muted-foreground">
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
