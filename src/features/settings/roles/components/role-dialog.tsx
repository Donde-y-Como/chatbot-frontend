import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Search, Shield, X, Info, AlertTriangle } from 'lucide-react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreateRoleData, Role, UpdateRoleData } from '@/features/auth/types'
import {
  PERMISSIONS,
  Permission,
  PERMISSION_DEPENDENCIES,
  addPermissionsRelated
} from '@/api/permissions'
import { Textarea } from '@/components/ui/textarea.tsx' // Import your permission system

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
  const [searchTerm, setSearchTerm] = useState('')
  const [showDependencies, setShowDependencies] = useState(false)
  const [removalWarning, setRemovalWarning] = useState<{
    permission: string
    dependents: string[]
  } | null>(null)

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

  // Get current permissions with dependencies resolved
  const currentPermissions = form.watch('permissions')
  const resolvedPermissions = useMemo(() => {
    return addPermissionsRelated(currentPermissions as Permission[])
  }, [currentPermissions])

  // Separate manually selected from auto-added permissions
  const { manuallySelected, autoAdded } = useMemo(() => {
    const manual = new Set(currentPermissions)
    const auto = resolvedPermissions.filter(p => !manual.has(p))

    return {
      manuallySelected: currentPermissions,
      autoAdded: auto
    }
  }, [currentPermissions, resolvedPermissions])

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
  const totalPermissionsCount = resolvedPermissions.length
  const manualPermissionsCount = currentPermissions?.length || 0

  const handleSubmit = async (values: RoleFormValues) => {
    // Submit with all resolved permissions (manual + dependencies)
    const finalValues = {
      ...values,
      permissions: resolvedPermissions
    }
    await onSubmit(finalValues)
    form.reset()
  }

  const handleClose = () => {
    form.reset()
    setSearchTerm('')
    onClose()
  }

  // Enhanced permission toggle with dependency resolution
  const handlePermissionToggle = (permission: Permission, checked: boolean) => {
    const currentValues = form.getValues('permissions') as Permission[]

    if (checked) {
      // Add permission and its dependencies
      const withDependencies = addPermissionsRelated([...currentValues, permission])
      form.setValue('permissions', withDependencies)
      setRemovalWarning(null) // Clear any warnings
    } else {
      // Check if removing this permission would break dependencies
      const withoutPermission = currentValues.filter(p => p !== permission)
      const resolvedWithoutPermission = addPermissionsRelated(withoutPermission)

      if (resolvedWithoutPermission.includes(permission)) {
        // Find dependent permissions and show warning
        const dependents = currentValues.filter(p => {
          const deps = getDependenciesFor(p)
          return deps.includes(permission)
        })
        setRemovalWarning({
          permission: getPermissionDisplayName(permission),
          dependents: dependents.map(p => getPermissionDisplayName(p))
        })
      } else {
        form.setValue('permissions', withoutPermission)
        setRemovalWarning(null)
      }
    }
  }

  // Bulk permission actions with dependencies
  const selectAllPermissions = () => {
    const allResolved = addPermissionsRelated(filteredPermissions as Permission[])
    form.setValue('permissions', allResolved)
  }

  const deselectAllPermissions = () => {
    form.setValue('permissions', [])
  }

  const toggleDomainPermissions = (
    domain: string,
    domainPermissions: Permission[]
  ) => {
    const currentValues = form.getValues('permissions') as Permission[]
    const domainSelected = domainPermissions.every((p) =>
      resolvedPermissions.includes(p)
    )

    if (domainSelected) {
      // Remove domain permissions that can be safely removed
      const withoutDomain = currentValues.filter((p) => !domainPermissions.includes(p))
      form.setValue('permissions', withoutDomain)
    } else {
      // Add all domain permissions with dependencies
      const withDomain = addPermissionsRelated([...currentValues, ...domainPermissions as Permission[]])
      form.setValue('permissions', withDomain)
    }
  }

  // Check if a permission was auto-added due to dependencies
  const isAutoAdded = (permission: Permission) => {
    return autoAdded.includes(permission)
  }

  // Get dependencies for a permission
  const getDependenciesFor = (permission: Permission): Permission[] => {
    return PERMISSION_DEPENDENCIES[permission] || []
  }

  // Group filtered permissions by domain
  const groupedPermissions = filteredPermissions.reduce(
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-4xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            {title}
          </DialogTitle>
          <DialogDescription className='flex flex-col gap-2'>
            <div>
              Define el nombre, descripción y permisos para este rol.
            </div>
            <div className='flex items-center gap-2 flex-wrap'>
              <Badge variant='secondary'>
                {manualPermissionsCount} seleccionado{manualPermissionsCount !== 1 ? 's' : ''}
              </Badge>
              {autoAdded.length > 0 && (
                <Badge variant='outline' className='text-orange-600 border-orange-200'>
                  +{autoAdded.length} dependencia{autoAdded.length !== 1 ? 's' : ''}
                </Badge>
              )}
              <Badge variant='default'>
                = {totalPermissionsCount} total
              </Badge>
              {autoAdded.length > 0 && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowDependencies(!showDependencies)}
                  className='text-xs h-6 px-2'
                >
                  <Info className='h-3 w-3 mr-1' />
                  {showDependencies ? 'Ocultar' : 'Ver'} dependencias
                </Button>
              )}
            </div>
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

              {/* Removal Warning */}
              {removalWarning && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No se puede remover <strong>{removalWarning.permission}</strong> porque es requerido por: {removalWarning.dependents.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
              {showDependencies && autoAdded.length > 0 && (
                <div className='bg-orange-50 border border-orange-200 rounded-md p-3'>
                  <h4 className='font-medium text-sm text-orange-800 mb-2'>
                    Permisos añadidos automáticamente:
                  </h4>
                  <div className='flex flex-wrap gap-1'>
                    {autoAdded.map((permission) => (
                      <Badge
                        key={permission}
                        variant='outline'
                        className='text-xs text-orange-700 border-orange-300'
                      >
                        {getPermissionDisplayName(permission as Permission)}
                      </Badge>
                    ))}
                  </div>
                  <p className='text-xs text-orange-600 mt-2'>
                    Estos permisos son requeridos por los permisos que seleccionaste manualmente.
                  </p>
                </div>
              )}

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
                          disabled={manualPermissionsCount === 0}
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
                              const domainSelected = domainPermissions.every(
                                (p) => resolvedPermissions.includes(p)
                              )
                              domainPermissions.some(
                                (p) => resolvedPermissions.includes(p)
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
                                            resolvedPermissions.includes(p)
                                          ).length
                                        }
                                        /{domainPermissions.length}
                                      </Badge>
                                    </h4>
                                  </div>
                                  <div className='grid grid-cols-2 gap-2 pl-6'>
                                    {domainPermissions.map((permission) => {
                                      const isChecked = resolvedPermissions.includes(permission)
                                      const isAutoAddedPermission = isAutoAdded(permission)
                                      const isManuallySelected = currentPermissions.includes(permission)
                                      const dependencies = getDependenciesFor(permission as Permission)

                                      return (
                                        <div key={permission} className='space-y-1'>
                                          <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                                            <FormControl>
                                              <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={(checked) =>
                                                  handlePermissionToggle(
                                                    permission as Permission,
                                                    !!checked
                                                  )
                                                }
                                              />
                                            </FormControl>
                                            <FormLabel
                                              className={`text-sm font-normal flex items-center gap-1 ${
                                                isAutoAddedPermission
                                                  ? 'text-orange-600'
                                                  : 'text-foreground'
                                              }`}
                                            >
                                              {getPermissionDisplayName(permission)}
                                              {isAutoAddedPermission && (
                                                <Badge
                                                  variant='outline'
                                                  className='text-xs text-orange-600 border-orange-300'
                                                >
                                                  auto
                                                </Badge>
                                              )}
                                            </FormLabel>
                                          </FormItem>

                                          {/* Show dependencies for manually selected permissions */}
                                          {isManuallySelected && dependencies.length > 0 && (
                                            <div className='text-xs text-muted-foreground pl-6'>
                                              Requiere: {dependencies.map(dep =>
                                              getPermissionDisplayName(dep)
                                            ).join(', ')}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
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