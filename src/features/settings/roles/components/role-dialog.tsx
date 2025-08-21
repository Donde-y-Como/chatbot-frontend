import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Search, Shield, X } from 'lucide-react'
import { getDomainDisplayName, getPermissionDisplayName } from '@/lib/utils.ts'
import { useGetPermissions } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
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

// Role templates for quick setup
export function RoleDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  title,
  submitLabel,
  initialData,
}: RoleDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: permissionsData, isLoading: permissionsLoading } =
    useGetPermissions()
  const permissions = useMemo(
    () => permissionsData?.permissions || [],
    [permissionsData]
  )

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

  // Filter permissions based on search term
  const filteredPermissions = useMemo(() => {
    if (!searchTerm) return permissions
    return permissions.filter((permission) => {
      const [domain, action] = permission.split('.')
      const domainName = getDomainDisplayName(domain).toLowerCase()
      const actionName = getPermissionDisplayName(permission).toLowerCase()
      return (
        domainName.includes(searchTerm.toLowerCase()) ||
        actionName.includes(searchTerm.toLowerCase()) ||
        permission.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [permissions, searchTerm])

  // Get selected permissions count
  const selectedPermissions = form.watch('permissions')
  const selectedCount = selectedPermissions?.length || 0

  const handleSubmit = async (values: RoleFormValues) => {
    await onSubmit(values)
    form.reset()
  }

  const handleClose = () => {
    form.reset()
    setSearchTerm('')
    onClose()
  }

  // Bulk permission actions
  const selectAllPermissions = () => {
    form.setValue('permissions', filteredPermissions)
  }

  const deselectAllPermissions = () => {
    form.setValue('permissions', [])
  }

  const toggleDomainPermissions = (
    domain: string,
    domainPermissions: string[]
  ) => {
    const currentPermissions = form.getValues('permissions')
    const domainSelected = domainPermissions.every((p) =>
      currentPermissions.includes(p)
    )

    if (domainSelected) {
      // Remove all domain permissions
      form.setValue(
        'permissions',
        currentPermissions.filter((p) => !domainPermissions.includes(p))
      )
    } else {
      // Add all domain permissions
      const newPermissions = [
        ...new Set([...currentPermissions, ...domainPermissions]),
      ]
      form.setValue('permissions', newPermissions)
    }
  }

  // Agrupar permisos filtrados por dominio
  const groupedPermissions = filteredPermissions.reduce(
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-4xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            {title}
          </DialogTitle>
          <DialogDescription>
            Define el nombre, descripción y permisos para este rol.
            {selectedCount > 0 && (
              <Badge variant='secondary' className='ml-2'>
                {selectedCount} permiso{selectedCount !== 1 ? 's' : ''}{' '}
                seleccionado{selectedCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='flex flex-col flex-1'
          >
            <div className='flex-1 space-y-6 py-4'>
              {/* Basic Information */}
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
                        <Textarea
                          placeholder='Ej: Manejo de citas y atención al cliente'
                          className='min-h-[60px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Permissions Section */}
              <FormField
                control={form.control}
                name='permissions'
                render={() => (
                  <FormItem>
                    {/* Search and Bulk Actions */}
                    <div className='space-y-3'>
                      <div className='flex gap-2'>
                        <div className='relative flex-1'>
                          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                          <Input
                            placeholder='Buscar permisos...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='pl-9'
                          />
                        </div>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={selectAllPermissions}
                          disabled={filteredPermissions.length === 0}
                        >
                          <Check className='h-4 w-4 mr-1' />
                          Todos
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={deselectAllPermissions}
                          disabled={selectedCount === 0}
                        >
                          <X className='h-4 w-4 mr-1' />
                          Ninguno
                        </Button>
                      </div>

                      {searchTerm && (
                        <div className='text-sm text-muted-foreground'>
                          {filteredPermissions.length} de {permissions.length}{' '}
                          permisos encontrados
                        </div>
                      )}
                    </div>

                    <FormMessage />

                    {permissionsLoading ? (
                      <div className='flex items-center justify-center h-[300px] border rounded-md'>
                        <div className='text-sm text-muted-foreground'>
                          Cargando permisos...
                        </div>
                      </div>
                    ) : filteredPermissions.length === 0 ? (
                      <div className='flex items-center justify-center h-[300px] border rounded-md'>
                        <div className='text-sm text-muted-foreground'>
                          {searchTerm
                            ? 'No se encontraron permisos'
                            : 'No hay permisos disponibles'}
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className='h-[350px] w-full border rounded-md p-4'>
                        <div className='space-y-4'>
                          {Object.entries(groupedPermissions).map(
                            ([domain, domainPermissions]) => {
                              const currentPermissions =
                                form.getValues('permissions')
                              const domainSelected = domainPermissions.every(
                                (p) => currentPermissions.includes(p)
                              )

                              return (
                                <div key={domain} className='space-y-3'>
                                  <div className='flex items-center justify-between'>
                                    <h4 className='font-medium text-sm flex items-center gap-2'>
                                      <Checkbox
                                        checked={domainSelected}
                                        onCheckedChange={() =>
                                          toggleDomainPermissions(
                                            domain,
                                            domainPermissions
                                          )
                                        }
                                      />
                                      {getDomainDisplayName(domain)}
                                      <Badge
                                        variant='outline'
                                        className='text-xs'
                                      >
                                        {
                                          domainPermissions.filter((p) =>
                                            currentPermissions.includes(p)
                                          ).length
                                        }
                                        /{domainPermissions.length}
                                      </Badge>
                                    </h4>
                                  </div>
                                  <div className='grid grid-cols-2 gap-2 pl-6'>
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
                                                  onCheckedChange={(
                                                    checked
                                                  ) => {
                                                    return checked
                                                      ? field.onChange([
                                                          ...field.value,
                                                          permission,
                                                        ])
                                                      : field.onChange(
                                                          field.value?.filter(
                                                            (value) =>
                                                              value !==
                                                              permission
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
                            }
                          )}
                        </div>
                      </ScrollArea>
                    )}
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
