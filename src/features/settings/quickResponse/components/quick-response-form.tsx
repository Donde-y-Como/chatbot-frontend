import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { QuickResponse } from '../types'

// Schema for the form validation
const formSchema = z.object({
  title: z
    .string()
    .min(1, 'El atajo es requerido')
    .startsWith('/', 'El atajo debe comenzar con /')
    .max(20, 'El atajo debe tener menos de 20 caracteres'),
  content: z
    .string()
    .min(1, 'El mensaje es requerido')
    .max(500, 'El mensaje debe tener menos de 500 caracteres'),
  media: z
    .object({
      type: z.string(),
      url: z.string(),
    })
    .optional(),
})

export type QuickResponseFormValues = z.infer<typeof formSchema>

interface QuickResponseFormProps {
  onSubmit: (data: QuickResponseFormValues) => void
  initialData?: QuickResponse
  isSubmitting: boolean
  submitLabel: string
}

export function QuickResponseForm({
  onSubmit,
  initialData,
  isSubmitting,
  submitLabel,
}: QuickResponseFormProps) {
  const form = useForm<QuickResponseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '/',
      content: initialData?.content || '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Atajo</FormLabel>
              <FormControl>
                <Input placeholder='/gracias' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='content'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Gracias por contactarnos...'
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </form>
    </Form>
  )
}
