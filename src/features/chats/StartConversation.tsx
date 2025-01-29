import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Edit } from 'lucide-react'
import { api } from '@/api/axiosInstance.ts'
import es from 'react-phone-input-2/lang/es.json'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useForm } from 'react-hook-form'
import { Template } from '@/features/chats/ChatTypes.ts'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

export function StartConversation() {
  const [isOpen, setIsOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')

  const form = useForm({
    defaultValues: {
      name: '',
      template: '',
    }
  })

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await api.get<Template[]>('/templates')
      return data
    },
  })

  const onSubmit = (values) => {
    const formattedValues = {
      ...values,
      phone: phoneNumber
    }
    console.log('Form submitted:', formattedValues)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Edit size={24} className="stroke-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">Nuevo Contacto</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background text-foreground focus:ring-2 focus:ring-primary"
                      placeholder="Ingrese nombre"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="text-foreground font-medium">Teléfono</FormLabel>
              <div className="w-full">
                <PhoneInput
                  country="mx"
                  localization={es}
                  value={phoneNumber}
                  onChange={(phone) => setPhoneNumber(phone)}
                  containerStyle={{ width: '100%' }}
                  inputStyle={{
                    width: '100%',
                    height: '40px',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--input)'
                  }}
                  buttonStyle={{
                    backgroundColor: 'var(--foreground)',
                  }}
                  dropdownStyle={{
                    backgroundColor: 'var(--foreground)',
                    color: 'var(--foreground)',
                  }}
                  containerClass="phone-input"
                  inputClass="phone-input-field"
                  dropdownClass="phone-input-dropdown"
                />
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-foreground font-medium">Plantilla</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={cn(
                            'w-full justify-between bg-background text-foreground hover:bg-gray-50 dark:hover:bg-gray-800',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? templates.find((template) => template.businessId === field.value)?.name
                            : "Seleccionar plantilla..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command className="max-h-[300px] overflow-y-auto">
                        <CommandInput placeholder="Buscar plantillas..." className="h-9" />
                        <CommandEmpty>No se encontraron plantillas.</CommandEmpty>
                        <CommandGroup>
                          {templates.map((template) => (
                            <CommandItem
                              key={template.name}
                              value={template.name}
                              onSelect={() => {
                                form.setValue("template", template.name)
                                setOpen(false)
                              }}
                              className="flex flex-col items-start gap-1 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center w-full">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    template.name === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <span className="font-medium">{template.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 pl-6">
                                {template.content}
                              </p>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2"
            >
              Guardar Cambios
            </Button>
          </form>
        </Form>
        <DialogDescription className="sr-only">Formulario</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}