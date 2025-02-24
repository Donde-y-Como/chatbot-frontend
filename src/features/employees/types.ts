import { z } from "zod"
import { MinutesTimeRange } from "../appointments/types"

export const employeeFormSchema = z.object({
    name: z.string().min(1, { message: "El nombre es obligatorio" }),
    role: z.string().min(1, { message: "El rol es obligatorio" }),
    email: z.string().min(1, { message: "El email es obligatorio" }).email({ message: "El email no es válido" }),
    password: z.string().min(1, { message: "La contraseña es obligatoria" }),
    birthDate: z.string().optional(),
    address: z.string().optional(),
    photo: z.string().optional(),
    schedule: z.record(
        z.object({
            startAt: z.number(),
            endAt: z.number(),
        }),
    ),
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
    role: string
    email: string
    schedule: Record<string, MinutesTimeRange>
    photo?: string
    address?: string
    birthDate?: string
    createdAt: string
    color: string
}

export const dayInitialsMap = {
    SUNDAY: "DO",
    MONDAY: "LU",
    TUESDAY: "MA",
    WEDNESDAY: "MI",
    THURSDAY: "JU",
    FRIDAY: "VI",
    SATURDAY: "SA",
} as const