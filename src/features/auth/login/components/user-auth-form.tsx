import { PasswordInput } from '@/components/password-input'
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
import { authService } from '@/features/auth/AuthService.ts'
import { useAuth } from '@/stores/authStore.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface UserAuthFormProps {
  emailOnly?: boolean
}

const authSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Ingresa tu correo' })
    .email({ message: 'Correo invalido' }),
  password: z.string().min(1, {
    message: 'Ingresa tu contraseña',
  }).optional(),
})

export function UserAuthForm({ emailOnly = false }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setAccessToken, setUser } = useAuth()
  type FormValues = z.infer<typeof authSchema>
  const form = useForm<FormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: emailOnly
      ? { email: '' }
      : { email: '', password: '' },
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
      toast.error('Credenciales incorrectas')
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)

      if (emailOnly) {
        await authService.requestLoginLink(data.email)
        toast.success('Enlace de acceso enviado a tu correo')
        form.reset()
      } else {
        if (!data.password) {
          toast.error('Ingresa tu contraseña')
          return;
        }

        await login({
          email: data.email,
          password: data.password,
        })
      }
    } catch (_e: unknown) {
      toast.error('Ocurrió un error, por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='grid gap-6'>
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

            {!emailOnly && (
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <div className='flex items-center justify-between'>
                      <FormLabel>Contraseña</FormLabel>
                      <Link
                        to='/recuperar-cuenta'
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
            )}

            <Button className='mt-2' disabled={isLoading}>
              {isPending ? 'Cargando...' : emailOnly ? 'Enviar enlace' : 'Iniciar sesión'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
