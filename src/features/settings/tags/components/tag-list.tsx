import { Tag } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TagListProps {
  tags: Tag[]
  onEdit: (tag: Tag) => void
  onDelete: (tag: Tag) => void
  onView: (tag: Tag) => void
}

export function TagList({ tags, onEdit, onDelete, onView }: TagListProps) {
  if (tags.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        No hay etiquetas registradas
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {tags.map((tag) => (
        <Card key={tag.id} className='hover:shadow-md transition-shadow'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center gap-3'>
                  {/* Color visual */}
                  <div 
                    className='w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0'
                    style={{ backgroundColor: tag.color }}
                    title={`Color: ${tag.color}`}
                  />
                  <h3 className='font-semibold text-lg truncate'>{tag.name}</h3>
                </div>
                {tag.description && (
                  <p className='text-sm text-muted-foreground mt-2 line-clamp-2'>
                    {tag.description}
                  </p>
                )}
                <div className='flex items-center gap-2 mt-2'>
                  <Badge variant='outline' className='text-xs font-mono'>
                    {tag.color}
                  </Badge>
                  <span className='text-xs text-muted-foreground'>
                    {format(new Date(tag.createdAt), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onView(tag)}
                className='flex-1'
              >
                <Eye className='h-4 w-4 mr-1' />
                Ver
              </Button>
              <Button
                variant='outline' 
                size='sm'
                onClick={() => onEdit(tag)}
                className='flex-1'
              >
                <Edit className='h-4 w-4 mr-1' />
                Editar
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onDelete(tag)}
                className='text-destructive hover:text-destructive'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
