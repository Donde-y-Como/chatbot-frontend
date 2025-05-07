import { z } from 'zod'
import { Media } from '@/features/chats/ChatTypes.ts'

export type QuickResponse = {
  id: string
  businessId: string
  title: string
  content: string
  medias: Media[]
  assistantConfig: {
    enabled: boolean
    useCase: string
  }
}

export const quickResponseSchema = z.object({
  title: z
    .string()
    .min(1, 'El atajo es requerido')
    .startsWith('/', 'El atajo debe comenzar con /')
    .max(20, 'El atajo debe tener menos de 20 caracteres'),
  content: z
    .string()
    .min(1, 'El mensaje es requerido')
    .max(500, 'El mensaje debe tener menos de 500 caracteres'),
  medias: z
    .array(
      z.object({
        type: z.string(),
        url: z.string(),
      })
    )
    .default([]),
  assistantConfig: z.object({
    enabled: z.boolean().default(false),
    useCase: z.string().optional(),
  }),
})

export type QuickResponseFormValues = z.infer<typeof quickResponseSchema>
