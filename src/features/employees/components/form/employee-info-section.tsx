import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Briefcase,
  CalendarIcon,
  Camera,
  Check,
  ChevronsUpDown,
  Lock,
  Mail,
  MapPin,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { FileUpload } from '@/components/file-upload'
import { useGetRoles } from '@/hooks/useAuth'

export function EmployeeInfoSection({ form, files, onFilesChange, isEdit }) {
  const { data: roles, isLoading: rolesLoading } = useGetRoles()
  return (
    <div className='flex flex-col flex-1'>
      {/* Employee Data Section */}
      <div className='flex-1'>
        <div className='pb-3'>
          <h3 className='flex items-center gap-2 text-base font-semibold'>
            <User className='h-4 w-4 text-primary' />
            Datos del Empleado
          </h3>
        </div>
        <div className='space-y-4'>
          {/* Basic Information */}
          <div className='space-y-3'>
            <div className='grid gap-3 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel className='text-sm font-medium'>
                      Nombre completo *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ingresa el nombre completo del empleado'
                        className='h-9'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel className='text-sm font-medium flex items-center gap-2'>
                      <Mail className='h-3.5 w-3.5' />
                      Correo electrónico *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='empleado@ejemplo.com'
                        type='email'
                        className='h-9'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-3 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='roleIds'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel className='text-sm font-medium flex items-center gap-2'>
                      <Briefcase className='h-3.5 w-3.5' />
                      Roles *
                    </FormLabel>
                    <div className='space-y-2'>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between h-9",
                                !field.value?.length && "text-muted-foreground"
                              )}
                              disabled={rolesLoading}
                            >
                              {field.value?.length
                                ? `${field.value.length} rol(es) seleccionado(s)`
                                : "Seleccionar roles"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar roles..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron roles.</CommandEmpty>
                              <CommandGroup>
                                {roles?.map((role) => (
                                  <CommandItem
                                    key={role.id}
                                    onSelect={() => {
                                      const currentValue = field.value || []
                                      const newValue = currentValue.includes(role.id)
                                        ? currentValue.filter((id) => id !== role.id)
                                        : [...currentValue, role.id]
                                      field.onChange(newValue)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value?.includes(role.id)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div>
                                      <div className="font-medium">{role.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {role.description}
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      {field.value?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {field.value.map((roleId) => {
                            const role = roles?.find((r) => r.id === roleId)
                            return (
                              <Badge key={roleId} variant="secondary" className="text-xs">
                                {role?.name}
                                <button
                                  type="button"
                                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={() => {
                                    const newValue = field.value.filter((id) => id !== roleId)
                                    field.onChange(newValue)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remover {role?.name}</span>
                                </button>
                              </Badge>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel className='text-sm font-medium flex items-center gap-2'>
                      <Lock className='h-3.5 w-3.5' />
                      {isEdit ? 'Nueva contraseña' : 'Contraseña *'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder={
                          isEdit
                            ? 'Dejar vacío para no cambiar'
                            : 'Contraseña de acceso'
                        }
                        className='h-9'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Camera className='h-4 w-4 text-primary' />
              <span className='text-sm font-medium'>Foto del Empleado</span>
            </div>
            <p className='text-xs text-muted-foreground'>
              Sube una foto del empleado para identificación visual
            </p>
            <div className='min-h-[80px] flex items-center justify-center'>
              <FileUpload
                maxFiles={1}
                maxSize={10 * 1024 * 1024}
                value={files}
                onChange={onFilesChange}
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <CalendarIcon className='h-4 w-4 text-primary' />
              <span className='text-sm font-medium'>Información Personal</span>
            </div>
            <div className='grid gap-3 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='birthDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col space-y-1'>
                    <FormLabel className='text-sm font-medium'>
                      Fecha de nacimiento
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal h-9',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), 'PPP', {
                                locale: es,
                              })
                            ) : (
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className='ml-auto h-3.5 w-3.5 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          locale={es}
                          captionLayout="dropdown-years"
                          fixedWeeks
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date?.toISOString())
                          }
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel className='text-sm font-medium flex items-center gap-2'>
                      <MapPin className='h-3.5 w-3.5' />
                      Dirección
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Dirección completa del empleado'
                        className='h-9'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
