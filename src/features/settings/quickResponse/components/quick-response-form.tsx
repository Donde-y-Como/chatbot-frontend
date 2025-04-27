import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { QuickResponse } from '../types';

// Schema for the form validation
const formSchema = z.object({
  shortcut: z.string()
    .min(1, 'El atajo es requerido')
    .startsWith('/', 'El atajo debe comenzar con /')
    .max(20, 'El atajo debe tener menos de 20 caracteres'),
  message: z.string()
    .min(1, 'El mensaje es requerido')
    .max(500, 'El mensaje debe tener menos de 500 caracteres'),
});

export type QuickResponseFormValues = z.infer<typeof formSchema>;

interface QuickResponseFormProps {
  onSubmit: (data: QuickResponseFormValues) => void;
  initialData?: QuickResponse;
  isSubmitting: boolean;
  submitLabel: string;
}

export function QuickResponseForm({
  onSubmit,
  initialData,
  isSubmitting,
  submitLabel
}: QuickResponseFormProps) {
  const form = useForm<QuickResponseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shortcut: initialData?.shortcut || '/',
      message: initialData?.message || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="shortcut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Atajo</FormLabel>
              <FormControl>
                <Input placeholder="/gracias" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Gracias por contactarnos..." 
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
