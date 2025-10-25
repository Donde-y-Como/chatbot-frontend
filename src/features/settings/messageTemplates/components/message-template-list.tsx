import { Edit, Eye, Trash2, MessageSquare } from 'lucide-react'
import { PERMISSIONS } from '@/api/permissions.ts'
import { RenderIfCan } from '@/lib/Can.tsx'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageTemplate, templateTypeLabels } from '../types'

interface MessageTemplateListProps {
  templates: MessageTemplate[]
  onEdit: (template: MessageTemplate) => void
  onDelete: (template: MessageTemplate) => void
  onView: (template: MessageTemplate) => void
}

export function MessageTemplateList({
  templates,
  onEdit,
  onDelete,
  onView,
}: MessageTemplateListProps) {
  if (templates.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        <MessageSquare className='h-12 w-12 mx-auto mb-3 opacity-50' />
        <p>No hay plantillas de mensajes registradas</p>
        <p className='text-sm mt-1'>Crea tu primera plantilla para personalizar tus mensajes automáticos</p>
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {templates.map((template) => (
        <Card key={template.id} className='hover:shadow-md transition-shadow'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <MessageSquare className='h-4 w-4 text-primary' />
                  <h3 className='font-semibold text-lg'>
                    {templateTypeLabels[template.type]}
                  </h3>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant={template.isActive ? 'default' : 'secondary'}>
                    {template.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                  <Badge variant='outline' className='text-xs'>
                    {template.language.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='mb-3'>
              <p className='text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap'>
                {template.template}
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onView(template)}
                className='flex-1'
              >
                <Eye className='h-4 w-4 mr-1' />
                Ver
              </Button>
              <RenderIfCan permission={PERMISSIONS.BUSINESS_UPDATE}>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onEdit(template)}
                  className='flex-1'
                >
                  <Edit className='h-4 w-4 mr-1' />
                  Editar
                </Button>
              </RenderIfCan>
              <RenderIfCan permission={PERMISSIONS.BUSINESS_UPDATE}>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onDelete(template)}
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
