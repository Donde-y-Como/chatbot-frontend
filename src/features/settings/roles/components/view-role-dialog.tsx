import { Calendar, Shield, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Role } from '@/features/auth/types'
import { getDomainDisplayName, getPermissionDisplayName } from '@/lib/utils.ts'
import { Permission } from '@/api/permissions.ts'

interface ViewRoleDialogProps {
  isOpen: boolean
  onClose: () => void
  data: Role
}

export function ViewRoleDialog({ isOpen, onClose, data }: ViewRoleDialogProps) {
  // Agrupar permisos por dominio
  const groupedPermissions = data.permissions.reduce(
    (acc, permission) => {
      const domain = permission.split('.')[0]
      if (!acc[domain]) {
        acc[domain] = []
      }
      acc[domain].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            {data.name}
          </DialogTitle>
          <DialogDescription>{data.description}</DialogDescription>
        </DialogHeader>

        <div className='flex-1 space-y-6 py-4'>
          {/* Información básica */}
          <div className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-medium'>
                  <Calendar className='h-4 w-4' />
                  Fecha de creación
                </div>
                <p className='text-sm text-muted-foreground'>
                  {new Date(data.createdAt).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-medium'>
                  <Users className='h-4 w-4' />
                  Total de permisos
                </div>
                <p className='text-sm text-muted-foreground'>
                  {data.permissions.length} permisos asignados
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Permisos */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Permisos asignados</h3>

            {Object.keys(groupedPermissions).length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-sm text-muted-foreground'>
                  Este rol no tiene permisos asignados
                </p>
              </div>
            ) : (
              <ScrollArea className='h-[300px] w-full'>
                <div className='space-y-4'>
                  {Object.entries(groupedPermissions).map(
                    ([domain, domainPermissions]) => (
                      <div key={domain} className='space-y-3'>
                        <h4 className='font-medium text-sm flex items-center gap-2'>
                          {getDomainDisplayName(domain)}
                          <Badge variant='outline' className='text-xs'>
                            {domainPermissions.length} permisos
                          </Badge>
                        </h4>
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-2 pl-4'>
                          {domainPermissions.map((permission) => (
                            <Badge
                              key={permission}
                              variant='secondary'
                              className='text-xs'
                            >
                              {getPermissionDisplayName(permission)}
                            </Badge>
                          ))}
                        </div>
                        {domain !==
                          Object.keys(groupedPermissions).slice(-1)[0] && (
                          <Separator className='mt-3' />
                        )}
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
