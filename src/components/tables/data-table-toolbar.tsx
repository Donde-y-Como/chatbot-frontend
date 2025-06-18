import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  showSearch?: boolean
  searchColumn?: string
  searchPlaceholder?: string
  enableGlobalFilter?: boolean
}

export function DataTableToolbar<TData>({
  table,
  showSearch = true,
  searchColumn = 'name',
  searchPlaceholder = 'Buscar...',
  enableGlobalFilter = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  // Función para buscar
  const handleSearchChange = (value: string) => {
    if (enableGlobalFilter) {
      table.setGlobalFilter(value)
    } else {
      table.getColumn(searchColumn)?.setFilterValue(value)
    }
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {showSearch && (
          <Input
            placeholder={searchPlaceholder}
            value={
              enableGlobalFilter
                ? (table.getState().globalFilter ?? '') 
                : (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) => handleSearchChange(event.target.value)}
            className='h-8 sm:w-[150px] lg:w-[250px] w-full'
          />
        )}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Restablecer
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
