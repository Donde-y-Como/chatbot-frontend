import { z } from 'zod'

export interface AccountPrimitives {
  address: string
  description: string
  vertical: string
  about: string
  email: string
  websites: string[]
  profile_picture_url: string
}

export const verticals = [
  { label: 'Servicios Profesionales', value: 'PROF_SERVICES' },
  { label: 'Comercio Minorista', value: 'RETAIL' },
  { label: 'Alimentos y Bebidas', value: 'FOOD_BEVERAGE' },
  { label: 'Salud', value: 'HEALTH' },
  { label: 'Educación', value: 'EDUCATION' },
  { label: 'Viajes', value: 'TRAVEL' },
  { label: 'Entretenimiento', value: 'ENTERTAINMENT' },
  { label: 'Otro', value: 'OTHER' },
] as const

export const PATTERNS = {
  URL: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  DESCRIPTION: /^[^<>]*$/,
}

export const whatsappFormSchema = z.object({
  address: z
    .string()
    .min(2, {
      message: 'La dirección debe tener al menos 2 caracteres.',
    })
    .max(100, {
      message: 'La dirección no debe exceder los 100 caracteres.',
    }),
  description: z
    .string()
    .min(2, {
      message: 'La descripción debe tener al menos 2 caracteres.',
    })
    .max(256, {
      message: 'La descripción no debe exceder los 256 caracteres.',
    })
    .regex(PATTERNS.DESCRIPTION, {
      message: 'La descripción contiene caracteres no permitidos.',
    }),
  email: z
    .string()
    .email({
      message: 'Por favor ingresa un correo electrónico válido.',
    })
    .regex(PATTERNS.EMAIL, {
      message: 'El formato del correo electrónico no es válido.',
    }),
  profile_picture_url: z
    .string()
    .url({
      message: 'Por favor ingresa una URL válida para la foto de perfil.',
    })
    .regex(PATTERNS.URL, {
      message:
        'La URL debe comenzar con http:// o https:// y tener un dominio válido.',
    })
    .optional()
    .or(z.literal('')),
  websites: z
    .array(
      z
        .string()
        .url({
          message: 'Por favor ingresa una URL de sitio web válida.',
        })
        .regex(PATTERNS.URL, {
          message:
            'La URL debe comenzar con http:// o https:// y tener un dominio válido.',
        })
    )
    .min(1, {
      message: 'Se requiere al menos un sitio web.',
    }),
  vertical: z.string({
    required_error: 'Por favor selecciona un sector de negocio.',
  }),
})

export type WhatsAppFormValues = z.infer<typeof whatsappFormSchema>

export const defaultValues: Partial<WhatsAppFormValues> = {
  address: '',
  description: '',
  email: '',
  profile_picture_url: '',
  websites: [''],
  vertical: '',
}
