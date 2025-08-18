import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, ChevronUp, Lock, Eye, EyeOff } from 'lucide-react'
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
import { useUpdateCredentials } from '@/hooks/useAuth'

const credentialsSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
  email: z.string().email('Ingresa un email válido').optional().or(z.literal('')),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Al menos uno de email o newPassword debe ser proporcionado
  if (!data.email && !data.newPassword) {
    return false
  }
  return true
}, {
  message: "Debes cambiar al menos el email o la contraseña",
  path: ["email"],
}).refine((data) => {
  // Si se proporciona newPassword, confirmPassword debe coincidir
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type CredentialsFormValues = z.infer<typeof credentialsSchema>

export default function CredentialsSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { mutateAsync: updateCredentials, isPending } = useUpdateCredentials()

  const form = useForm<CredentialsFormValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      currentPassword: '',
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const handleSubmit = async (values: CredentialsFormValues) => {
    try {
      const updateData: {
        currentPassword: string
        email?: string
        newPassword?: string
      } = {
        currentPassword: values.currentPassword,
      }

      if (values.email) {
        updateData.email = values.email
      }

      if (values.newPassword) {
        updateData.newPassword = values.newPassword
      }

      await updateCredentials(updateData)
      
      // Reset form after successful update
      form.reset()
      setIsExpanded(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleCancel = () => {
    form.reset()
    setIsExpanded(false)
  }

  return (
    <div className="space-y-4">
      {/* Header with toggle button */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Credenciales de Acceso</h3>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Cambia tu email de acceso o contraseña. Necesitarás tu contraseña actual para confirmar los cambios.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Contraseña actual */}
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña actual *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Ingresa tu contraseña actual"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                {/* Nuevo email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nuevo email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Ingresa un nuevo email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nueva contraseña */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Ingresa una nueva contraseña"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Confirmar nueva contraseña - solo mostrar si se está ingresando nueva contraseña */}
              {form.watch('newPassword') && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar nueva contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirma la nueva contraseña"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Actualizando...' : 'Actualizar credenciales'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  )
}