// AddTagButton.tsx
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTagMutations } from '../clients/hooks/useGetTags';


// AddTagButton.tsx



// AddTagButton.tsx


// AddTagButton.tsx

const FormSchema = z.object({
  name: z.string().min(1, {
    message: 'Tag name is required',
  }),
})

type FormValues = z.infer<typeof FormSchema>

export function AddTagButton({ withLabel }: { withLabel?: boolean }) {
  const [open, setOpen] = useState(false)
  const { create } = useTagMutations()

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  })

  async function onSubmit(data: FormValues) {
    await create(data.name)
    form.reset()
    setOpen(false)
  }

  return (
    <>
      <Badge
        variant='outline'
        className='h-7 px-2 text-center text-xs font-medium cursor-pointer hover:bg-accent'
        onClick={() => setOpen(true)}
      >
        <Plus className='h-3 w-3' />
        {withLabel && <span className='ml-1'>Agregar etiqueta</span>}
      </Badge>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Crear etiqueta</DialogTitle>
            <DialogDescription className='sr-only'>
              Agregar etiqueta
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ingrese el nombre de la etiqueta'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type='submit'>Agregar Etiqueta</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
