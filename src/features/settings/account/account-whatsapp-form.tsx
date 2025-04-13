import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CaretSortIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  EnvelopeClosedIcon,
  HomeIcon,
  GlobeIcon,
  TextAlignLeftIcon,
  ImageIcon,
  IdCardIcon,
  UpdateIcon,
} from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { url } from 'inspector'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from '@/components/ui/textarea'
import { AccountApiService } from './accountApiService'
import AccountWhatsappProfilePhoto from './components/account-whatsapp-profile-photo'
import { useGetAccount } from './hooks/useGetAccounts'
import { useUpdateAccount } from './hooks/useUpdateAccounts'
import {
  defaultValues,
  whatsappFormSchema,
  WhatsAppFormValues,
  verticals,
  AccountPrimitives,
  PATTERNS,
} from './types'

interface props {
  accountData: AccountPrimitives
}

export function AccountWhatsAppForm({ accountData }: props) {
  const [websites, setWebsites] = useState<string[]>([''])
  const [photo, setPhoto] = useState<string>(accountData.profile_picture_url)

  const subir = (url: string) => {
    console.log(url)

    setPhoto(url)
  }

  const form = useForm<WhatsAppFormValues>({
    resolver: zodResolver(whatsappFormSchema),
    defaultValues: accountData || defaultValues,
    mode: 'onChange',
  })

  const updateMutation = useUpdateAccount()

  useEffect(() => {
    if (accountData) {
      setPhoto(accountData.profile_picture_url)
      setWebsites(accountData.websites?.length ? accountData.websites : [''])
    }
  }, [accountData])

  const validateWebsites = (
    websites: string[]
  ): { hasDuplicates: boolean; hasInvalidUrls: boolean } => {
    const nonEmptyWebsites = websites.filter((site) => site.trim() !== '')
    const hasDuplicates =
      nonEmptyWebsites.length !== new Set(nonEmptyWebsites).size
    const hasInvalidUrls = nonEmptyWebsites.some(
      (site) => !PATTERNS.URL.test(site)
    )

    return { hasDuplicates, hasInvalidUrls }
  }

  const addWebsite = () => {
    setWebsites([...websites, ''])

    const currentWebsites = form.getValues('websites') || []
    form.setValue('websites', [...currentWebsites, ''], {
      shouldValidate: true,
    })

    setTimeout(() => {
      const inputs = document.querySelectorAll('input[name^="websites."]')
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement
      if (lastInput) lastInput.focus()
    }, 100)
  }

  const removeWebsite = (index: number) => {
    if (websites.length > 1) {
      const newWebsites = [...websites]
      newWebsites.splice(index, 1)
      setWebsites(newWebsites)

      form.setValue('websites', newWebsites, { shouldValidate: true })
    }
  }

  const updateWebsite = (index: number, value: string) => {
    const newWebsites = [...websites]
    newWebsites[index] = value
    setWebsites(newWebsites)

    form.setValue('websites', newWebsites, { shouldValidate: true })

    if (value && !PATTERNS.URL.test(value)) {
      form.setError(`websites.${index}`, {
        type: 'pattern',
        message:
          'La URL debe comenzar con http:// o https:// y tener un dominio válido.',
      })
    } else {
      form.clearErrors(`websites.${index}`)
    }
  }

  async function onSubmit(data: WhatsAppFormValues) {
    data.websites = websites
    const { hasDuplicates, hasInvalidUrls } = validateWebsites(data.websites)

    if (hasDuplicates) {
      toast.error('No puedes tener sitios web duplicados')
      return
    }

    if (hasInvalidUrls) {
      toast.error('Uno o mas sitios web tienen un formato de URL invalido')
      return
    }

    try {
      const accountData: Partial<AccountPrimitives> = {
        address: data.address,
        description: data.description,
        email: data.email,
        profile_picture_url: photo,
        websites: data.websites,
        vertical: data.vertical,
      }

      await updateMutation.mutateAsync(accountData)

      toast.success('Tu perfil de negocio de WhatsApp ha sido actualizado.')
    } catch (error) {
      toast.error('Error al actualizar el perfil de WhatsApp')
    }
  }

  return (
    <>
      <AccountWhatsappProfilePhoto
        currentPhotoUrl={photo}
        onPhotoUpdated={subir}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <HomeIcon className='h-4 w-4' />
                  Dirección del Negocio
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Ingresa la dirección de tu negocio'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  La dirección física de tu negocio. Ej: Calle Principal #123,
                  Ciudad.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <TextAlignLeftIcon className='h-4 w-4' />
                  Descripción del Negocio
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Ingresa una descripción de tu negocio'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Proporciona una breve descripción de tu negocio (máximo 256
                  caracteres).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <EnvelopeClosedIcon className='h-4 w-4' />
                  Correo Electrónico
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='correo@ejemplo.com'
                    type='email'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Tu correo electrónico de negocio para notificaciones de la
                  cuenta.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel className='flex items-center gap-2 mb-2'>
              <GlobeIcon className='h-4 w-4' />
              Sitios Web
            </FormLabel>
            <FormDescription className='mb-4'>
              Agrega uno o más sitios web de tu negocio. Cada URL debe ser única
              y comenzar con http:// o https://.
            </FormDescription>

            {websites.map((website, index) => (
              <div key={index} className='flex items-center gap-2 mb-2'>
                <div className='flex-1'>
                  <FormField
                    control={form.control}
                    name={`websites.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder='https://ejemplo.com'
                            type='url'
                            value={website}
                            onChange={(e) => {
                              updateWebsite(index, e.target.value)
                              field.onChange(e)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={() => removeWebsite(index)}
                  disabled={websites.length === 1 && index === 0}
                  className='flex-shrink-0'
                  title='Eliminar sitio web'
                >
                  <TrashIcon className='h-4 w-4' />
                </Button>
              </div>
            ))}

            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={addWebsite}
            >
              <PlusIcon className='mr-2 h-4 w-4' />
              Agregar Sitio Web
            </Button>

            {form.formState.errors.websites &&
              !Array.isArray(form.formState.errors.websites) && (
                <p className='text-sm font-medium text-destructive mt-2'>
                  {form.formState.errors.websites.message}
                </p>
              )}
          </div>

          <FormField
            control={form.control}
            name='vertical'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel className='flex items-center gap-2'>
                  <IdCardIcon className='h-4 w-4' />
                  Sector de Negocio
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-[240px] justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value
                          ? verticals.find(
                              (vertical) => vertical.value === field.value
                            )?.label
                          : 'Selecciona un sector de negocio'}
                        <CaretSortIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-[240px] p-0'>
                    <Command>
                      <CommandInput placeholder='Buscar sectores...' />
                      <CommandEmpty>No se encontraron sectores.</CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {verticals.map((vertical) => (
                            <CommandItem
                              value={vertical.label}
                              key={vertical.value}
                              onSelect={() => {
                                form.setValue('vertical', vertical.value)
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  vertical.value === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {vertical.label}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Selecciona la categoría que mejor describe tu negocio.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            disabled={updateMutation.isPending}
            className='flex items-center gap-2'
          >
            {updateMutation.isPending ? (
              <>
                <UpdateIcon className='h-4 w-4 animate-spin' />
                Actualizando...
              </>
            ) : (
              <>
                <UpdateIcon className='h-4 w-4' />
                Actualizar Perfil de WhatsApp
              </>
            )}
          </Button>
        </form>
      </Form>
    </>
  )
}
