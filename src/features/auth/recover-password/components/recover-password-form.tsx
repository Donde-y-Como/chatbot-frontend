import { useParams, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { authService } from '@/features/auth/AuthService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertTriangle, CheckCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const formSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .max(100, { message: 'La contraseña es demasiado larga' }),
  password: z.string().min(1, {
    message: 'Confirma tu contraseña',
  }),
}).refine((data) => data.newPassword === data.password, {
  message: 'Las contraseñas no coinciden',
  path: ['password']
})

type FormValues = z.infer<typeof formSchema>

export function RecoverPasswordForm() {
  const { token } = useParams({ from: '/(auth)/restablecer-contrasena/$token' })
  const router = useRouter()
  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      password: ''
    },
    mode: 'onChange'
  })

  useEffect(() => {
    const validateToken = async () => {
      try {
        const isValid = await authService.verifyResetToken(token)
        setIsTokenValid(isValid)
      } catch (error) {
        setIsTokenValid(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const onSubmit = async (values: FormValues) => {
    if (!isTokenValid) return

    setIsSubmitting(true)
    try {
      const passwordUpdated = await authService.resetPassword(token, values.newPassword)
      setIsSuccess(passwordUpdated)
      
      if (!passwordUpdated) {
        toast.error("No se pudo restablecer tu contraseña.")
        return
      }

      toast.success("Tu contraseña ha sido actualizada correctamente.")
      setTimeout(() => {
        router.navigate({ to: '/iniciar-sesion' })
      }, 2000)
    } catch (error) {
      toast.error("No se pudo restablecer tu contraseña.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isValidating) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-neutral-100">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Validando enlace</CardTitle>
          <CardDescription>Estamos verificando tu enlace de restablecimiento</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!isTokenValid) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-neutral-100">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Enlace inválido</CardTitle>
          <CardDescription>El enlace de restablecimiento de contraseña es inválido o ha expirado.</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center pb-6">
          <Button
            variant="default"
            onClick={() => router.navigate({ to: '/iniciar-sesion' })}
          >
            Volver a iniciar sesión
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-neutral-100">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">¡Contraseña actualizada!</CardTitle>
          <CardDescription>Tu contraseña ha sido restablecida correctamente. Serás redirigido al inicio de sesión.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-neutral-100">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Restablecer contraseña</CardTitle>
        <CardDescription>Introduce tu nueva contraseña abajo</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className={cn(
                        "focus-visible:ring-primary",
                        form.formState.errors.newPassword && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className={cn(
                        "focus-visible:ring-primary",
                        form.formState.errors.password && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar contraseña
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center space-y-2">
        <Button
          variant="link"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => router.navigate({ to: '/iniciar-sesion' })}
        >
          Volver a iniciar sesión
        </Button>
      </CardFooter>
    </Card>
  )
}
