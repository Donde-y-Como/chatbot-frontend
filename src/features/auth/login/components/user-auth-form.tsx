import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import { useAuth } from '@/stores/authStore.ts'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
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
import { PasswordInput } from '@/components/password-input'
import { authService } from '@/features/auth/AuthService.ts'

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Ingresa tu correo' })
    .email({ message: 'Correo invalido' }),
  password: z.string().min(1, {
    message: 'Ingresa tu contraseña',
  }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setAccessToken, setUser } = useAuth()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { mutateAsync: login, isPending } = useMutation({
    mutationKey: ['login'],
    mutationFn: authService.login,
    onSuccess: async (data) => {
      setAccessToken(data.token)
      const user = await queryClient.fetchQuery({
        queryKey: ['user'],
        queryFn: authService.getMe,
      })

      setUser(user)
      router.navigate({ to: '/', replace: true })
    },
    onError: () => {
      toast.error('Error de autenticación',{
        description: 'Credenciales inválidas',
      })
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      await login(data)
    } catch (_e: unknown) {
      /* empty */
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Correo</FormLabel>
                  <FormControl>
                    <Input autoComplete="username" placeholder='name@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <FormLabel>Contraseña</FormLabel>
                    <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-muted-foreground hover:opacity-75'
                    >
                      Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput autoComplete="current-password" placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={isLoading}>
              {isPending ? 'Cargando...' : 'Iniciar sesión'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
