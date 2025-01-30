import React, { useCallback, useMemo, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent, DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
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
import { Template } from '@/features/chats/ChatTypes.ts'
import { MessageSquarePlus } from 'lucide-react'

type TemplateVariables = {
  [key: string]: string
}

interface StartConversationProps {
  templates: Template[]
  onSubmit: (data: NewConversation) => void
}

export type NewConversation = {
  phoneNumber: string
  countryCode: string
  templateName: string
  templateContent: string
  templateVariables: TemplateVariables
  clientName: string
}
export const StartConversation: React.FC<StartConversationProps> = React.memo(
  ({ templates, onSubmit }) => {
    const isMobile = useMediaQuery({ maxWidth: 768 })
    const [isOpen, setIsOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
      null
    )
    const [variables, setVariables] = useState<TemplateVariables>({})
    const [formData, setFormData] = useState({
      clientName: '',
      countryCode: '',
      phoneNumber: '',
    })

    const resetForm = useCallback(() => {
      setFormData({
        clientName: '',
        countryCode: '',
        phoneNumber: '',
      })
      setSelectedTemplate(null)
      setVariables({})
    }, [])

    const handleClose = useCallback(() => {
      setIsOpen(false)
      resetForm()
    }, [resetForm])

    const formatPhoneNumber = useCallback((value: string): string => {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length <= 10) {
        return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
      }
      return numbers.slice(0, 10).replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    }, [])

    const handleSubmit = useCallback(() => {
      if (!selectedTemplate) return

      onSubmit({
        phoneNumber: formData.phoneNumber.replace(/\D/g, ''),
        countryCode: formData.countryCode,
        templateName: selectedTemplate.name,
        templateContent: selectedTemplate.content,
        templateVariables: variables,
        clientName: formData.clientName,
      })
      handleClose()
    }, [
      selectedTemplate,
      onSubmit,
      formData.phoneNumber,
      formData.countryCode,
      formData.clientName,
      variables,
      handleClose,
    ])

    const handleInputChange = useCallback(
      (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
          ...prev,
          [field]: field === 'phoneNumber' ? formatPhoneNumber(value) : value,
        }))
      },
      [formatPhoneNumber]
    )

    const handleVariableChange = useCallback(
      (varName: string, value: string) => {
        setVariables((prev) => ({
          ...prev,
          [varName]: value,
        }))
      },
      []
    )

    const handleTemplateSelect = useCallback(
      (value: string) => {
        const template = templates.find((t) => t.name === value)
        setSelectedTemplate(template || null)
        setVariables({})
      },
      [templates]
    )
    const content = useMemo(
      () => (
        <div className='space-y-6 p-4'>
          <div className='grid gap-4'>
            <div>
              <Label htmlFor='clientName'>Nombre</Label>
              <Input
                id='clientName'
                value={formData.clientName}
                onChange={(e) =>
                  handleInputChange('clientName', e.target.value)
                }
                placeholder='Nombre del cliente'
              />
            </div>

            <div className='flex gap-2'>
              <div className='w-24'>
                <Label htmlFor='countryCode'>Código</Label>
                <Input
                  id='countryCode'
                  value={formData.countryCode}
                  onChange={(e) =>
                    handleInputChange(
                      'countryCode',
                      e.target.value.replace(/\D/g, '')
                    )
                  }
                  maxLength={3}
                  placeholder='52'
                />
              </div>

              <div className='flex-1'>
                <Label htmlFor='phoneNumber'>Teléfono</Label>
                <Input
                  id='phoneNumber'
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange('phoneNumber', e.target.value)
                  }
                  placeholder='951-201-0452'
                />
              </div>
            </div>

            <div>
              <Label>Plantilla</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
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
                <div className='rounded-lg border p-4 bg-muted'>
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
                                    handleVariableChange(
                                      varName,
                                      e.target.value
                                    )
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
              </div>
            )}
          </div>

          <div className='flex items-center justify-end gap-4'>
            <DialogClose className='dialog-close' onClick={handleClose}>
              Cerrar
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.clientName ||
                !formData.countryCode ||
                !formData.phoneNumber ||
                !selectedTemplate ||
                Object.keys(variables).length === 0
              }
            >
              Iniciar conversación
            </Button>
          </div>
        </div>
      ),
      [
        formData.clientName,
        formData.countryCode,
        formData.phoneNumber,
        handleTemplateSelect,
        templates,
        selectedTemplate,
        handleClose,
        handleSubmit,
        variables,
        handleInputChange,
        handleVariableChange,
      ]
    )

    const MobileDrawer = useMemo(
      () => (
        <Drawer
          open={isOpen}
          onOpenChange={setIsOpen}
          modal
          shouldScaleBackground
        >
          <DrawerTrigger asChild>
            <Button onClick={() => setIsOpen(true)}>
              <MessageSquarePlus />
            </Button>
          </DrawerTrigger>
          <DrawerContent onCloseAutoFocus={(e) => e.preventDefault()}>
            <DrawerHeader>
              <DrawerTitle>Nueva conversación</DrawerTitle>
            </DrawerHeader>
            <ScrollArea className='h-[80vh]'>{content}</ScrollArea>
            <DrawerDescription className="sr-only">Formulario para iniciar conversacion</DrawerDescription>
          </DrawerContent>
        </Drawer>
      ),
      [isOpen, content]
    )

    const DesktopDialog = useMemo(
      () => (
        <Dialog open={isOpen} onOpenChange={setIsOpen} modal>
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)}>
              <MessageSquarePlus />
            </Button>
          </DialogTrigger>
          <DialogContent
            className='max-w-2xl'
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogDescription className='sr-only'>
              Formulario iniciar conversacion
            </DialogDescription>
            <DialogHeader>
              <DialogTitle>Nueva conversación</DialogTitle>
            </DialogHeader>
            <ScrollArea className='max-h-[80vh]'>{content}</ScrollArea>
          </DialogContent>
        </Dialog>
      ),
      [isOpen, content]
    )

    return isMobile ? MobileDrawer : DesktopDialog
  }
)