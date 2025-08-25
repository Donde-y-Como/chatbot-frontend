import { useMemo, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'
import { Loader2, Plus, Search } from 'lucide-react'
import { PERMISSIONS } from '@/api/permissions.ts'
import { RenderIfCan } from '@/lib/Can.tsx'
import {
  useCreateRole,
  useDeleteRole,
  useGetRoles,
  useUpdateRole,
} from '@/hooks/useAuth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreateRoleData, Role, UpdateRoleData } from '@/features/auth/types'
import ContentSection from '../components/content-section'
import { DeleteRoleDialog } from './components/delete-role-dialog'
import { RoleDialog } from './components/role-dialog'
import { RoleList } from './components/role-list'
import { ViewRoleDialog } from './components/view-role-dialog'

export default function RolesSection() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  // Debounce de la búsqueda
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const {
    data: roles,
    isPending: isLoadingRoles,
    error: rolesError,
  } = useGetRoles()

  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole()
  const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateRole()
  const { mutateAsync: deleteRole, isPending: isDeleting } = useDeleteRole()

  // Filtrar roles basándose en la búsqueda
  const filteredRoles = useMemo(() => {
    if (!roles) return []

    if (!debouncedSearchQuery.trim()) {
      return roles
    }

    const query = debouncedSearchQuery.toLowerCase().trim()

    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query)
    )
  }, [roles, debouncedSearchQuery])

  const handleCreate = async (values: CreateRoleData) => {
    await createRole(values)
    setIsCreateDialogOpen(false)
  }

  const handleUpdate = async (values: UpdateRoleData) => {
    if (selectedRole) {
      await updateRole({
        roleId: selectedRole.id,
        data: values,
      })

      setIsEditDialogOpen(false)
      setSelectedRole(undefined)
    }
  }

  const handleDelete = async () => {
    if (selectedRole) {
      await deleteRole(selectedRole.id)
      setIsDeleteDialogOpen(false)
      setSelectedRole(undefined)
    }
  }

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (role: Role) => {
    setSelectedRole(role)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role)
    setIsDeleteDialogOpen(true)
  }

  const openViewDialog = (role: Role) => {
    setSelectedRole(role)
    setIsViewDialogOpen(true)
  }

  return (
    <ContentSection
      title='Roles y Permisos'
      desc='Administra los roles y permisos para controlar el acceso de los empleados'
    >
      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <h3 className='text-lg font-medium'>Roles del sistema</h3>
          <RenderIfCan permission={PERMISSIONS.ROLE_CREATE}>
            <Button onClick={openCreateDialog}>
              <Plus className='mr-2 h-4 w-4' />
              Nuevo rol
            </Button>
          </RenderIfCan>
        </div>

        {/* Barra de búsqueda */}
        <div className='relative max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Buscar por nombre o descripción'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Mostrar información de búsqueda */}
        {debouncedSearchQuery && (
          <div className='text-sm text-muted-foreground'>
            {filteredRoles.length === 0
              ? `No se encontraron roles que coincidan con "${debouncedSearchQuery}"`
              : `Mostrando ${filteredRoles.length} de ${roles?.length || 0} roles`}
          </div>
        )}

        {isLoadingRoles && (
          <div className='flex justify-center items-center py-10'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <span className='ml-2'>Cargando roles...</span>
          </div>
        )}

        {rolesError && (
          <Alert variant='destructive' className='mb-6'>
            <AlertTitle>Error al cargar los roles</AlertTitle>
            <AlertDescription>
              No se pudieron cargar los roles. Por favor, intenta recargar la
              página.
            </AlertDescription>
          </Alert>
        )}

        {roles && (
          <RoleList
            roles={filteredRoles}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onView={openViewDialog}
          />
        )}

        {/* View Dialog */}
        {selectedRole && (
          <ViewRoleDialog
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setSelectedRole(undefined)
            }}
            data={selectedRole}
          />
        )}

        {/* Create Dialog */}
        <RoleDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isCreating}
          title='Crear nuevo rol'
          submitLabel='Crear'
        />

        {/* Edit Dialog */}
        <RoleDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedRole(undefined)
          }}
          onSubmit={handleUpdate}
          isSubmitting={isUpdating}
          initialData={selectedRole}
          title='Editar rol'
          submitLabel='Actualizar'
        />

        {/* Delete Dialog */}
        <DeleteRoleDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedRole(undefined)
          }}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          role={selectedRole}
        />
      </div>
    </ContentSection>
  )
}
