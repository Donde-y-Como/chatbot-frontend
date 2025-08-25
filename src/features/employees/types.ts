import { z } from 'zod'
import { MinutesTimeRange } from '../appointments/types'

export const scheduleSchema = z
  .object({
    MONDAY: z
      .object({
        startAt: z.number(),
        endAt: z.number(),
      })
      .optional(),
    TUESDAY: z
      .object({
        startAt: z.number(),
        endAt: z.number(),
      })
      .optional(),
    WEDNESDAY: z
      .object({
        startAt: z.number(),
        endAt: z.number(),
      })
      .optional(),
    THURSDAY: z
      .object({
        startAt: z.number(),
        endAt: z.number(),
      })
      .optional(),
    FRIDAY: z
      .object({
        startAt: z.number(),
        endAt: z.number(),
      })
      .optional(),
    SATURDAY: z
      .object({
        startAt: z.number(),
        endAt: z.number(),
      })
      .optional(),
    SUNDAY: z
      .object({
        startAt: z.number(),
        endAt: z.number(),
      })
      .optional(),
  })
  .refine(
    (value) => {
      return Object.values(value).some((day) => day !== undefined)
    },
    { message: 'Al menos un día de la semana es obligatorio' }
  )

export const employeeFormSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es obligatorio' }),
  roleIds: z
    .array(z.string())
    .min(1, { message: 'Al menos un rol es obligatorio' }),
  email: z
    .string()
    .min(1, { message: 'El email es obligatorio' })
    .email({ message: 'El email no es válido' }),
  password: z.string().min(1, { message: 'La contraseña es obligatoria' }),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  photo: z.string().optional(),
  schedule: scheduleSchema,
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
export const employeeEditFormSchema = employeeFormSchema.extend({
  password: z.string().optional(),
})
export type EmployeeEditFormValues = z.infer<typeof employeeEditFormSchema>

export type Employee = {
  id: string
  businessId: string
  name: string
  roleIds: string[]
  roleNames: string[]
  email: string
  schedule: Record<string, MinutesTimeRange>
  photo?: string
  address?: string
  birthDate?: string
  createdAt: string
  color: string
}

export const dayInitialsMap = {
  SUNDAY: 'DO',
  MONDAY: 'LU',
  TUESDAY: 'MA',
  WEDNESDAY: 'MI',
  THURSDAY: 'JU',
  FRIDAY: 'VI',
  SATURDAY: 'SA',
} as const
