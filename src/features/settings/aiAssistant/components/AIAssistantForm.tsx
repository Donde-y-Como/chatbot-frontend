import { useEffect, useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { AVAILABLE_TOOLS } from '@/features/settings/aiAssistant/available-tools.ts'
import { ToolsSelector } from '@/features/settings/aiAssistant/components/ToolsSelector.tsx'
import {
  AIAssistantConfig,
  CreateAIAssistantData,
  IntentPrompt,
} from '../types'

const intentPromptSchema = z.object({
  intentName: z.string().min(1, 'El nombre del intent es requerido'),
  prompt: z.string().min(1, 'El prompt es requerido'),
  priority: z.number().min(1).default(1),
  enabled: z.boolean().default(true),
  tools: z.array(z.string()).default([]),
})

const formSchema = z.object({
  basePrompt: z.string().min(1, 'El prompt base es requerido'),
  contextPrompt: z.string().min(1, 'El prompt de contexto es requerido'),
  quickReplyPrompt: z
    .string()
    .min(1, 'El prompt de respuesta rápida es requerido'),
  intentPrompts: z.array(intentPromptSchema).optional(),
})

type FormData = z.infer<typeof formSchema>

interface AIAssistantFormProps {
  initialData?: AIAssistantConfig | null
  onSubmit: (data: CreateAIAssistantData) => void
  isSubmitting: boolean
}

// Default intents for new configurations
const defaultIntents: IntentPrompt[] = [
  {
    intentName: 'booking',
    prompt:
      'Ayuda al usuario a reservar una cita. Pregunta por fecha, hora y tipo de servicio preferido.',
    priority: 1,
    enabled: true,
    tools: ['getServicesInfo', 'checkAvailability', 'makeAppointment'],
  },
  {
    intentName: 'services',
    prompt:
      'Proporciona información sobre servicios disponibles, precios y descripciones.',
    priority: 2,
    enabled: true,
    tools: ['getServicesInfo', 'checkAvailability', 'makeAppointment'],
  },
  {
    intentName: 'pricing',
    prompt:
      'Responde preguntas sobre precios, descuentos y promociones disponibles.',
    priority: 3,
    enabled: true,
    tools: ['getServicesInfo', 'checkAvailability', 'makeAppointment'],
  },
  {
    intentName: 'general',
    prompt: 'Maneja consultas generales con respuestas útiles y amigables.',
    priority: 4,
    enabled: true,
    tools: [],
  },
]

export function AIAssistantForm({
  initialData,
  onSubmit,
  isSubmitting,
}: AIAssistantFormProps) {
  const [intentPrompts, setIntentPrompts] = useState<IntentPrompt[]>(
    initialData?.intentPrompts || defaultIntents
  )

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basePrompt:
        initialData?.basePrompt ||
        'Eres un asistente útil para nuestro negocio. Ayudas a los clientes con citas, servicios e información general.',
      contextPrompt:
        initialData?.contextPrompt ||
        'Analiza el mensaje del usuario y detecta la intención. Intenciones disponibles: booking, services, pricing, general. Devuelve solo el nombre de la intención.',
      quickReplyPrompt:
        initialData?.quickReplyPrompt ||
        'Basándote en el mensaje del usuario y las respuestas rápidas disponibles, devuelve la respuesta más apropiada o una cadena vacía si ninguna coincide.',
      intentPrompts: intentPrompts,
    },
  })

  useEffect(() => {
    form.setValue('intentPrompts', intentPrompts)
  }, [intentPrompts, form])

  const handleSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      intentPrompts: intentPrompts,
    })
  }

  const addIntent = () => {
    const newIntent: IntentPrompt = {
      intentName: '',
      prompt: '',
      priority: intentPrompts.length + 1,
      enabled: true,
      tools: [],
    }
    setIntentPrompts([...intentPrompts, newIntent])
  }

  const removeIntent = (index: number) => {
    setIntentPrompts(intentPrompts.filter((_, i) => i !== index))
  }

  const updateIntent = (
    index: number,
    field: keyof IntentPrompt,
    value: any
  ) => {
    const updated = [...intentPrompts]
    updated[index] = { ...updated[index], [field]: value }
    setIntentPrompts(updated)
  }

  const moveIntentUp = (index: number) => {
    if (index === 0) return

    const newIntents = [...intentPrompts]
    const currentIntent = newIntents[index]
    const previousIntent = newIntents[index - 1]

    // Swap the intents
    newIntents[index - 1] = currentIntent
    newIntents[index] = previousIntent

    // Update priorities to match new positions
    newIntents.forEach((intent, i) => {
      intent.priority = i + 1
    })

    setIntentPrompts(newIntents)
  }

  const moveIntentDown = (index: number) => {
    if (index >= intentPrompts.length - 1) return

    const newIntents = [...intentPrompts]
    const currentIntent = newIntents[index]
    const nextIntent = newIntents[index + 1]

    // Swap the intents
    newIntents[index + 1] = currentIntent
    newIntents[index] = nextIntent

    // Update priorities to match new positions
    newIntents.forEach((intent, i) => {
      intent.priority = i + 1
    })

    setIntentPrompts(newIntents)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Configuración Principal</CardTitle>
            <CardDescription>
              Define los prompts principales para tu asistente de IA
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='basePrompt'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Base</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Define la personalidad y rol del asistente...'
                      className='min-h-[150px]'
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Define la personalidad y rol principal del asistente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='contextPrompt'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt de Contexto</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Instrucciones para detectar intenciones...'
                      className='min-h-[120px]'
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Usado para la detección de intenciones y análisis de
                    contexto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='quickReplyPrompt'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt de Respuesta Rápida</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Instrucciones para respuestas rápidas...'
                      className='min-h-[120px]'
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Usado para emparejar mensajes con respuestas predefinidas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Prompts de Intención</CardTitle>
                <CardDescription>
                  Configura prompts específicos para cada tipo de intención
                </CardDescription>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addIntent}
                disabled={isSubmitting}
              >
                <Plus className='h-4 w-4 mr-2' />
                Agregar Intencion
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {intentPrompts.map((intent, index) => (
              <Card key={index} className='relative'>
                <CardContent className='pt-6'>
                  <div className='absolute top-2 right-2 flex items-center gap-1'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => moveIntentUp(index)}
                      disabled={index === 0 || isSubmitting}
                      className='h-7 w-7'
                      title='Mover arriba'
                    >
                      <ChevronUp className='h-4 w-4' />
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => moveIntentDown(index)}
                      disabled={
                        index >= intentPrompts.length - 1 || isSubmitting
                      }
                      className='h-7 w-7'
                      title='Mover abajo'
                    >
                      <ChevronDown className='h-4 w-4' />
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => removeIntent(index)}
                      disabled={isSubmitting}
                      className='h-7 w-7 text-destructive hover:text-destructive'
                      title='Eliminar'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>

                  <div className='space-y-4 pr-20'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>
                          Nombre de Intención
                        </label>
                        <Input
                          placeholder='booking, services, etc.'
                          value={intent.intentName}
                          onChange={(e) =>
                            updateIntent(index, 'intentName', e.target.value)
                          }
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className='flex items-center space-x-2'>
                        <Switch
                          checked={intent.enabled}
                          onCheckedChange={(checked) =>
                            updateIntent(index, 'enabled', checked)
                          }
                          disabled={isSubmitting}
                        />
                        <label className='text-sm font-medium'>
                          {intent.enabled ? 'Habilitado' : 'Deshabilitado'}
                        </label>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Prompt de Manejo
                      </label>
                      <Textarea
                        placeholder='Describe cómo manejar esta intención...'
                        value={intent.prompt}
                        onChange={(e) =>
                          updateIntent(index, 'prompt', e.target.value)
                        }
                        disabled={isSubmitting}
                        className='min-h-[100px]'
                      />
                    </div>

                    <div className='space-y-3'>
                      <label className='text-sm font-medium'>
                        Herramientas
                      </label>

                      {/* Chips resumen */}
                      <div className='flex flex-wrap gap-2'>
                        {intent.tools?.length === 0 && (
                          <span className='text-sm text-muted-foreground'>
                            Ninguna herramienta seleccionada
                          </span>
                        )}

                        {intent.tools.map((toolId) => {
                          const tool = AVAILABLE_TOOLS.find(
                            (t) => t.id === toolId
                          )

                          return (
                            <Badge key={toolId} variant='secondary'>
                              {tool?.title ?? toolId}
                            </Badge>
                          )
                        })}
                      </div>

                      {/* Selector */}
                      <ToolsSelector
                        value={intent.tools}
                        onChange={(tools) =>
                          updateIntent(index, 'tools', tools)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {intentPrompts.length === 0 && (
              <div className='text-center py-8 text-muted-foreground'>
                No hay intents configurados. Haz clic en "Agregar Intent" para
                comenzar.
              </div>
            )}
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {initialData ? 'Actualizar Configuración' : 'Crear Configuración'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
