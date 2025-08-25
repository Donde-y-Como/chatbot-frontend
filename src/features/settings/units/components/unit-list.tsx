import { Edit, Trash2 } from 'lucide-react'
import { PERMISSIONS } from '@/api/permissions.ts'
import { RenderIfCan } from '@/lib/Can.tsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Unit } from '../types'

interface UnitListProps {
  units: Unit[]
  onEdit: (unit: Unit) => void
  onDelete: (unit: Unit) => void
  onView: (unit: Unit) => void
}

export function UnitList({ units, onEdit, onDelete, onView }: UnitListProps) {
  if (units.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        No hay unidades registradas
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {units.map((unit) => (
        <Card key={unit.id} className='hover:shadow-md transition-shadow'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='font-semibold text-lg'>{unit.name}</h3>
                <Badge variant='outline' className='font-mono mt-1'>
                  {unit.abbreviation}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='flex gap-2'>
              {/* <Button
                variant='outline'
                size='sm'
                onClick={() => onView(unit)}
                className='flex-1'
              >
                <Eye className='h-4 w-4 mr-1' />
                Ver
              </Button> */}
              <RenderIfCan permission={PERMISSIONS.UNIT_UPDATE}>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onEdit(unit)}
                  className='flex-1'
                >
                  <Edit className='h-4 w-4 mr-1' />
                  Editar
                </Button>
              </RenderIfCan>
              <RenderIfCan permission={PERMISSIONS.UNIT_DELETE}>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onDelete(unit)}
                  className='text-destructive hover:text-destructive'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </RenderIfCan>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
