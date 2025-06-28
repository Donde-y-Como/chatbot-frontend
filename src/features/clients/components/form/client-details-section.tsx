import { format } from 'date-fns'
import { UseFormReturn } from 'react-hook-form'
import { es } from 'date-fns/locale'
import {
  CalendarIcon,
  Camera,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { CreateClientForm } from '../../types'
import { ClientAnnexesForm } from './client-annexes-form'

interface ClientDetailsSectionProps {
  form: UseFormReturn<CreateClientForm>
  files: File[]
  onFilesChange: (files: File[]) => void
}

export function ClientDetailsSection({
  form,
  files,
  onFilesChange,
}: ClientDetailsSectionProps) {
  return (
    <div className='space-y-8'>
      {/* Photo Upload Section */}
      <Card>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Camera className='h-5 w-5 text-primary' />
            Foto del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <p className='text-sm text-muted-foreground'>
              Sube una foto del cliente para identificación visual
            </p>
            <FileUpload
              maxFiles={1}
              maxSize={10 * 1024 * 1024}
              value={files}
              onChange={onFilesChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Section */}
      <Card>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <CalendarIcon className='h-5 w-5 text-primary' />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='birthdate'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel className='text-sm font-medium'>
                    Fecha de nacimiento
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal h-10',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), 'PPP', { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        locale={es}
                        captionLayout='dropdown-years'
                        fixedWeeks
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => field.onChange(date?.toISOString())}
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
                <FormItem>
                  <FormLabel className='text-sm font-medium flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    Dirección
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Dirección completa del cliente'
                      className='h-10'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Annexes Section */}
      <ClientAnnexesForm />
    </div>
  )
}