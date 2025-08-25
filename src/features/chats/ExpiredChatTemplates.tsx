import React, { useCallback, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uid } from 'uid'
import { sortByLastMessageTimestamp } from '@/lib/utils'
import { useWebSocket } from '@/hooks/use-web-socket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Template, Message } from '@/features/chats/ChatTypes'
import { useGetTemplates } from '@/features/clients/hooks/useGetTemplates'

type TemplateVariables = {
  [key: string]: string
}

interface ExpiredChatTemplatesProps {
  selectedChatId: string
}

export const ExpiredChatTemplates: React.FC<ExpiredChatTemplatesProps> = ({
  selectedChatId,
}) => {
  const { data: templates = [], isLoading } = useGetTemplates()
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  )
  const [variables, setVariables] = useState<TemplateVariables>({})

  const queryClient = useQueryClient()
  const { sendMessage: sendToWebSocket } = useWebSocket()

  // Reset variables when template changes
  const handleTemplateSelect = useCallback(
    (value: string) => {
      const template = templates.find((t) => t.name === value)
      setSelectedTemplate(template || null)
      setVariables({})
    },
    [templates]
  )

  // Update variable value when changed
  const handleVariableChange = useCallback((varName: string, value: string) => {
    setVariables((prev) => ({
      ...prev,
      [varName]: value,
    }))
  }, [])

  // Process template content and replace variables
  const processTemplateContent = useCallback(
    (template: Template, variables: TemplateVariables) => {
      let processedContent = template.content

      // Replace all variables in the template content
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        processedContent = processedContent.replace(regex, value)
      })

      return processedContent
    },
    []
  )

  // Create mutation for sending template message
  const sendTemplateMutation = useMutation({
    mutationKey: ['send-template'],
    async mutationFn(data: { conversationId: string; message: Message }) {
      sendToWebSocket(data)
    },
    onSuccess: (_data, variables) => {
      // Update chat messages
      queryClient.setQueryData(['chat', selectedChatId], (oldChats: any) => {
        if (oldChats === undefined) return oldChats
        return {
          ...oldChats,
          messages: [...oldChats.messages, variables.message],
        }
      })

      // Update chat list
      queryClient.setQueryData(['chats'], (oldChats: any) => {
        if (oldChats === undefined) return oldChats

        return [...oldChats]
          .map((chat) => {
            if (chat.id === variables.conversationId) {
              return {
                ...chat,
                lastMessage: variables.message,
              }
            }
            return chat
          })
          .sort(sortByLastMessageTimestamp)
      })

      // Reset after sending
      setSelectedTemplate(null)
      setVariables({})
    },
  })

  // Send the template message
  const handleSendTemplate = useCallback(() => {
    if (!selectedTemplate) return

    // Check if all variables are filled
    const allVariablesFilled =
      Object.keys(variables).length > 0 &&
      Object.values(variables).every((value) => value.trim().length > 0)

    if (!allVariablesFilled) return

    // Process template content with variables
    const processedContent = processTemplateContent(selectedTemplate, variables)

    // Create message object
    const newMsg: Message = {
      id: uid(),
      content: processedContent,
      role: 'business',
      timestamp: Date.now(),
      media: null,
    }

    // Send message
    sendTemplateMutation.mutate({
      conversationId: selectedChatId,
      message: newMsg,
    })
  }, [
    selectedTemplate,
    variables,
    processTemplateContent,
    sendTemplateMutation.mutate,
    selectedChatId,
  ])

  // Check if all required variables are filled
  const isFormValid =
    selectedTemplate &&
    Object.keys(variables).length > 0 &&
    Object.values(variables).every((value) => value.trim().length > 0)

  // Extract variable names from template
  const extractVariables = (template: Template) => {
    const matches = template.content.match(/{{([^}]+)}}/g) || []
    return matches.map((match) => match.slice(2, -2))
  }

  if (isLoading) {
    return <p className='text-sm opacity-60 italic'>Cargando plantillas...</p>
  }

  if (templates.length === 0) {
    return (
      <p className='text-sm opacity-60 italic'>No hay plantillas disponibles</p>
    )
  }

  return (
    <div className='p-2 space-y-4 max-h-[30vh] overflow-y-auto'>
      <p className='text-sm font-medium'>
        Esta conversación ha expirado. Usa una plantilla para reanudar:
      </p>

      <div className='space-y-4'>
        <div>
          <Label htmlFor='template-select'>Plantilla</Label>
          <Select onValueChange={handleTemplateSelect}>
            <SelectTrigger id='template-select'>
              <SelectValue placeholder='Seleccionar plantilla' />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.name} value={template.name}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTemplate && (
          <div className='space-y-4'>
            <Label>Contenido de la plantilla</Label>
            <ScrollArea className='h-24 rounded-lg border p-2 bg-muted'>
              <div className='p-2'>
                {selectedTemplate.content
                  .split(/({{[^}]+}})/)
                  .map((part, index) => {
                    if (part.match(/{{([^}]+)}}/)) {
                      const varName = part.slice(2, -2)
                      return (
                        <Popover key={index}>
                          <PopoverTrigger asChild>
                            <span className='px-1 py-0.5 mx-1 rounded bg-primary text-primary-foreground cursor-pointer'>
                              {part}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className='w-64'>
                            <div className='space-y-2'>
                              <Label htmlFor={`var-${varName}`}>
                                {varName}
                              </Label>
                              <Input
                                id={`var-${varName}`}
                                value={variables[varName] || ''}
                                onChange={(e) =>
                                  handleVariableChange(varName, e.target.value)
                                }
                                placeholder={`Valor para ${varName}`}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      )
                    }
                    return <span key={index}>{part}</span>
                  })}
              </div>
            </ScrollArea>

            <div className='flex flex-col space-y-2'>
              {extractVariables(selectedTemplate).map((varName) => (
                <div key={varName} className='space-y-1'>
                  <Label htmlFor={`input-${varName}`}>{varName}</Label>
                  <Input
                    id={`input-${varName}`}
                    value={variables[varName] || ''}
                    onChange={(e) =>
                      handleVariableChange(varName, e.target.value)
                    }
                    placeholder={`Valor para ${varName}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleSendTemplate}
          disabled={!isFormValid}
          className='w-full'
        >
          Enviar plantilla
        </Button>
      </div>
    </div>
  )
}

export default ExpiredChatTemplates
