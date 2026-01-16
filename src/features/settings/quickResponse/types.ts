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
    .startsWith('/', 'El atajo debe comenzar con /'),
  content: z
    .string()
    .min(1, 'El mensaje es requerido'),
  medias: z
    .array(
      z.object({
        type: z.enum(['image', 'video', 'document']),
        url: z.string(),
        caption: z.string().optional(),
        filename: z.string().optional(),
        mimetype: z.string().optional(),
      })
    )
    .default([]),
  assistantConfig: z.object({
    enabled: z.boolean().default(false),
    useCase: z.string().optional(),
  }),
})

export type QuickResponseFormValues = z.infer<typeof quickResponseSchema>
