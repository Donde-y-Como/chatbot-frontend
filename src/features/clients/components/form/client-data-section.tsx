import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Plus, X, Phone, User, Mail, Tag as TagIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { PlatformName } from '@/features/chats/ChatTypes'
import {
  CreateClientForm,
  PlatformIdentity,
  Tag,
} from '../../types'
import { ClientTagSelector } from '@/components/forms/client-tag-selector.tsx'

export function ClientDataSection({
  form,
  tags = [],
}: {
  form: UseFormReturn<CreateClientForm>
  tags: Tag[]
}) {
  const { control, getValues, setValue, watch } = form
  const [whatsappWebNumber, setWhatsappWebNumber] = useState('')

  const platformIdentities: PlatformIdentity[] =
    watch('platformIdentities') || []


  const removePlatformIdentity = (index: number) => {
    const currentIdentities = getValues('platformIdentities') || []
    setValue(
      'platformIdentities',
      currentIdentities.filter((_: PlatformIdentity, i: number) => i !== index)
    )
  }

  const addWhatsAppNumber = () => {
    if (!whatsappWebNumber.trim() || !getValues('name')) {
      return
    }

    const formattedNumber = whatsappWebNumber.replace(/\D/g, '')
    if (formattedNumber.length < 10) {
      return
    }

    const currentIdentities = getValues('platformIdentities') || []
    const alreadyExists = currentIdentities.some(
      (identity: PlatformIdentity) =>
        identity.platformId === `${formattedNumber}@s.whatsapp.net` &&
        identity.platformName === PlatformName.WhatsappWeb
    )
    
    if (alreadyExists) {
      return
    }

    setValue('platformIdentities', [
      ...currentIdentities,
      {
        platformId: `${formattedNumber}@s.whatsapp.net`,
        platformName: PlatformName.WhatsappWeb,
        profileName: getValues('name'),
      },
    ])
    setWhatsappWebNumber('')
  }

  return (
    <div className='space-y-8'>
      {/* Basic Information Section */}
      <Card>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <User className='h-5 w-5 text-primary' />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium'>Nombre completo *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Ingresa el nombre completo del cliente' 
                      className='h-10'
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium flex items-center gap-2'>
                    <Mail className='h-4 w-4' />
                    Correo electrónico
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='cliente@ejemplo.com' 
                      type='email'
                      className='h-10'
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={control}
            name='notes'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium'>Notas adicionales</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder='Información adicional sobre el cliente, preferencias, historial, etc.'
                    className='min-h-[80px] resize-none'
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Tags Section */}
      <Card>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <TagIcon className='h-5 w-5 text-primary' />
            Etiquetas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name='tagIds'
            render={({ field }) => (
              <FormItem>
                <ClientTagSelector
                  title='Organización del Cliente'
                  description='Selecciona etiquetas para categorizar y organizar mejor a este cliente'
                  helperText='Las etiquetas te ayudan a segmentar clientes por tipo, preferencias, estado, etc.'
                  selectedTags={field.value || []}
                  onTagsChange={field.onChange}
                  availableTags={tags}
                />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Contact Information Section */}
      <Card>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Phone className='h-5 w-5 text-primary' />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            <FormLabel className='text-sm font-medium'>Número de WhatsApp</FormLabel>
            <div className='flex gap-2'>
              <Input
                type='tel'
                placeholder='Ej: 5551234567'
                value={whatsappWebNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setWhatsappWebNumber(value)
                }}
                className='flex-1 h-10'
                maxLength={10}
              />
              <Button
                type='button'
                onClick={addWhatsAppNumber}
                disabled={!whatsappWebNumber.trim() || whatsappWebNumber.length < 10}
                size='sm'
                className='px-4 h-10'
              >
                <Plus className='h-4 w-4 mr-1' />
                Agregar
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>
              Ingresa solo números. Ej: 5551234567 (sin espacios ni guiones)
            </p>
          </div>
          
          {platformIdentities.length > 0 && (
            <>
              <Separator />
              <div className='space-y-2'>
                <FormLabel className='text-sm font-medium'>Números registrados</FormLabel>
                <div className='flex flex-wrap gap-2'>
                  {platformIdentities.map(
                    (identity: PlatformIdentity, index: number) => {
                      if (identity.platformName === PlatformName.WhatsappWeb) {
                        const phoneNumber = identity.platformId.replace('@s.whatsapp.net', '')
                        return (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='flex items-center gap-2 px-3 py-1.5 rounded-full'
                          >
                            <Phone className='h-3 w-3' />
                            <span className='text-sm'>{phoneNumber}</span>
                            <button
                              type='button'
                              className='ml-1 hover:bg-red-100 rounded-full p-0.5 transition-colors'
                              onClick={() => removePlatformIdentity(index)}
                            >
                              <X className='h-3 w-3 text-red-500' />
                            </button>
                          </Badge>
                        )
                      }
                      return null
                    }
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
