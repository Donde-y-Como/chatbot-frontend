import { Edit, Save, X } from 'lucide-react'
import { PERMISSIONS } from '@/api/permissions.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RenderIfCan } from '@/lib/Can.tsx'

export default function ProfileHeader({
  user,
  isEditingProfile,
  setIsEditingProfile,
  form,
  handleLogoUpload,
  saveProfileChanges,
  isUploading,
}) {
  return (
    <div className='space-y-8'>
      {/* Foto de Perfil */}
      <FormField
        control={form.control}
        name='logo'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Foto de Perfil</FormLabel>
            <FormControl>
              <div className='flex items-center space-x-4'>
                <Avatar className='h-44 w-44'>
                  <AvatarImage
                    src={field.value || user?.logo}
                    alt='Logo'
                    className='h-full w-full rounded-full overflow-hidden'
                  />
                  <AvatarFallback>{user?.name}</AvatarFallback>
                </Avatar>
                {isEditingProfile && (
                  <div>
                    <label
                      htmlFor='upload-logo'
                      className='cursor-pointer bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors'
                    >
                      {isUploading ? 'Cargando...' : 'Seleccionar imagen'}
                    </label>
                    <input
                      id='upload-logo'
                      type='file'
                      accept='image/png, image/jpeg'
                      className='hidden'
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleLogoUpload(file)
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </FormControl>
            <FormDescription>
              Selecciona una nueva foto de perfil.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Nombre de la Empresa */}
      <FormField
        control={form.control}
        name='name'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Empresa</FormLabel>
            <FormControl>
              <Input
                placeholder={user?.name ?? ''}
                {...field}
                disabled={!isEditingProfile}
              />
            </FormControl>
            <FormDescription>Este nombre no es público.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Botones de edición/guardado */}
      <div className='flex space-x-2'>
        {isEditingProfile ? (
          <>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsEditingProfile(false)}
            >
              <X className='h-4 w-4 mr-1' /> Cancelar
            </Button>
            <Button
              variant='default'
              size='sm'
              onClick={saveProfileChanges}
              disabled={isUploading}
            >
              <Save className='h-4 w-4 mr-1' /> Guardar
            </Button>
          </>
        ) : (
          <RenderIfCan permission={PERMISSIONS.BUSINESS_UPDATE}>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setIsEditingProfile(true)
                form.setValue('name', user?.name || '')
                form.setValue('logo', user?.logo || '')
              }}
            >
              <Edit className='h-4 w-4 mr-1' /> Editar
            </Button>
          </RenderIfCan>
        )}
      </div>
    </div>
  )
}
