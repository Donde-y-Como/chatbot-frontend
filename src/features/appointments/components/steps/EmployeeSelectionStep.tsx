import { useMemo, useState } from 'react'
import { CheckCircle, Loader2, Search, User, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmployeeAvailable } from '../../types'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'

interface EmployeeSelectionStepProps {
  availableEmployees: EmployeeAvailable[]
  loadingEmployees: boolean
  selectedEmployeeIds: string[]
  onEmployeeToggle: (employeeId: string) => void
  onNext: () => void
  onBack: () => void
  onCancel: () => void
}

/**
 * Step 3: Employee selection component
 */
export function EmployeeSelectionStep({
  availableEmployees,
  loadingEmployees,
  selectedEmployeeIds,
  onEmployeeToggle,
  onNext,
  onBack,
  onCancel,
}: EmployeeSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return availableEmployees

    return availableEmployees.filter((employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [availableEmployees, searchQuery])

  // Función para limpiar la búsqueda
  const clearSearch = () => setSearchQuery('')

  return (
    <div className='space-y-4 h-[22rem]'>
      <div className='flex items-center justify-between'>
        <label className='text-sm font-medium block'>
          Empleados (Opcional)
        </label>
        {selectedEmployeeIds.length > 0 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() =>
              selectedEmployeeIds.forEach((id) => onEmployeeToggle(id))
            }
            className='text-xs h-8'
          >
            Desmarcar todos
          </Button>
        )}
      </div>

      {availableEmployees.length > 0 ? (
        <>
          {/* Componente de búsqueda */}
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <Search className='h-4 w-4 text-muted-foreground' />
            </div>
            <Input
              type='text'
              placeholder='Buscar empleado por nombre...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 pr-10'
            />
            {searchQuery && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute inset-y-0 right-0 flex items-center pr-3 h-full'
                onClick={clearSearch}
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>

          {/* Contador de resultados */}
          {searchQuery && (
            <p className='text-xs text-muted-foreground'>
              {filteredEmployees.length}{' '}
              {filteredEmployees.length === 1 ? 'resultado' : 'resultados'}{' '}
              encontrados
            </p>
          )}

          {/* Lista de empleados con scroll */}
          <ScrollArea className='h-52 w-full rounded-md border'>
            <div className='p-4'>
              {filteredEmployees.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
                  {filteredEmployees.map((employee) => (
                    <Card
                      key={employee.id}
                      className={cn(
                        'cursor-pointer hover:border-primary transition-all',
                        {
                          'border-primary bg-primary/5':
                            selectedEmployeeIds.includes(employee.id),
                        }
                      )}
                      onClick={() => onEmployeeToggle(employee.id)}
                    >
                      <CardContent className='p-2'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <Avatar className='h-7 w-7'>
                              <AvatarImage
                                src={employee.photo}
                                alt={employee.name}
                                className='object-cover'
                              />
                              <AvatarFallback>
                                {employee.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='text-sm'>{employee.name}</p>
                            </div>
                          </div>
                          {selectedEmployeeIds.includes(employee.id) && (
                            <CheckCircle className='h-5 w-5 text-primary' />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center p-8 text-muted-foreground'>
                  <Search className='h-8 w-8 mb-2' />
                  <p className='text-center'>
                    No se encontraron empleados con ese nombre
                  </p>
                  <Button variant='link' onClick={clearSearch} className='mt-2'>
                    Limpiar búsqueda
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      ) : loadingEmployees ? (
        <div>
          <p className='mb-2 text-center text-sm text-muted-foreground'>
            Buscando empleados disponibles en el horario seleccionado...
          </p>
          <div className='flex justify-center'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center p-8 border rounded-md text-muted-foreground'>
          <User className='h-8 w-8 mb-2' />
          <p className='text-center'>
            No hay empleados disponibles para este horario
          </p>
          <p className='text-center text-sm mt-2'>
            Puedes continuar sin seleccionar empleados
          </p>
        </div>
      )}

      <div className='flex justify-between gap-2'>
        <div className='flex gap-2'>
          <Button variant='destructive' onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant='outline' onClick={onBack}>
            Atrás
          </Button>
        </div>
        <Button onClick={onNext}>Continuar</Button>
      </div>
    </div>
  )
}
