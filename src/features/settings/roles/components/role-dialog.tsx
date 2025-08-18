import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Shield } from 'lucide-react'
import { useGetPermissions } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CreateRoleData, Role, UpdateRoleData } from '@/features/auth/types'

const roleFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  permissions: z
    .array(z.string())
    .min(1, 'Debe seleccionar al menos un permiso'),
})

type RoleFormValues = z.infer<typeof roleFormSchema>

interface RoleDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: CreateRoleData | UpdateRoleData) => Promise<void>
  isSubmitting: boolean
  title: string
  submitLabel: string
  initialData?: Role
}

export function RoleDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  title,
  submitLabel,
  initialData,
}: RoleDialogProps) {
  const { data: permissionsData, isLoading: permissionsLoading } =
    useGetPermissions()
  const permissions = permissionsData?.permissions || []

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        permissions: initialData.permissions,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        permissions: [],
      })
    }
  }, [initialData, form.reset])

  const handleSubmit = async (values: RoleFormValues) => {
    await onSubmit(values)
    form.reset()
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  // Agrupar permisos por dominio
  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      const domain = permission.split('.')[0]
      if (!acc[domain]) {
        acc[domain] = []
      }
      acc[domain].push(permission)
      return acc
    },
    {} as Record<string, string[]>
  )

  const getDomainDisplayName = (domain: string) => {
    const domainNames: Record<string, string> = {
      appointment: 'Citas',
      employee: 'Empleados',
      client: 'Clientes',
      service: 'Servicios',
      event: 'Eventos',
      role: 'Roles',
    }
    return domainNames[domain] || domain
  }

  const getPermissionDisplayName = (permission: string) => {
    const [domain, action] = permission.split('.')
    const actionNames: Record<string, string> = {
      create: 'Crear',
      read: 'Ver',
      update: 'Editar',
      delete: 'Eliminar',
    }
    return actionNames[action] || action
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-2xl max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            {title}
          </DialogTitle>
          <DialogDescription>
            Define el nombre, descripción y permisos para este rol.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='flex flex-col flex-1'
          >
            <div className='flex-1 space-y-4 py-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del rol *</FormLabel>
                      <FormControl>
                        <Input placeholder='Ej: Recepcionista' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Ej: Manejo de citas y clientes'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='permissions'
                render={() => (
                  <FormItem>
                    <FormLabel>Permisos *</FormLabel>
                    <FormMessage />
                    <ScrollArea className='h-[300px] w-full border rounded-md p-4'>
                      <div className='space-y-4'>
                        {Object.entries(groupedPermissions).map(
                          ([domain, domainPermissions]) => (
                            <div key={domain} className='space-y-2'>
                              <h4 className='font-medium text-sm flex items-center gap-2'>
                                {getDomainDisplayName(domain)}
                                <span className='text-xs text-muted-foreground'>
                                  ({domainPermissions.length} permisos)
                                </span>
                              </h4>
                              <div className='grid grid-cols-2 gap-2 pl-4'>
                                {domainPermissions.map((permission) => (
                                  <FormField
                                    key={permission}
                                    control={form.control}
                                    name='permissions'
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={permission}
                                          className='flex flex-row items-start space-x-3 space-y-0'
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(
                                                permission
                                              )}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([
                                                      ...field.value,
                                                      permission,
                                                    ])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) =>
                                                          value !== permission
                                                      )
                                                    )
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className='text-sm font-normal'>
                                            {getPermissionDisplayName(
                                              permission
                                            )}
                                          </FormLabel>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              {domain !==
                                Object.keys(groupedPermissions).slice(
                                  -1
                                )[0] && <Separator className='mt-3' />}
                            </div>
                          )
                        )}
                      </div>
                    </ScrollArea>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting || permissionsLoading}
              >
                {isSubmitting ? 'Guardando...' : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}