import * as React from 'react'
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { EventPrimitives } from '@/features/events/types.ts'

type Client = {
  id: string
  name: string
  email: string
  photo: string
}

const mockClients = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    photo: '/placeholder.svg?height=40&width=40',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    photo: '/placeholder.svg?height=40&width=40',
  },
  // Add more mock clients as needed
]

export function EventEditModal({
  event,
  open,
  onClose,
}: {
  event: EventPrimitives
  open: boolean
  onClose: () => void
}) {
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(
    null
  )
  const [openCombobox, setOpenCombobox] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showNewClientForm, setShowNewClientForm] = React.useState(false)

  const filteredClients = React.useMemo(() => {
    return mockClients.filter((client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [mockClients, searchQuery])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Event Name</Label>
            <Input id='name' defaultValue={event.name} />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea id='description' defaultValue={event.description} />
          </div>

          <div className='grid gap-2'>
            <Label>Book Clients</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={openCombobox}
                  className='justify-between'
                >
                  {selectedClient ? selectedClient.name : 'Select client...'}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[300px] p-0'>
                <Command>
                  <CommandInput
                    placeholder='Search clients...'
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className='p-2'>
                        <Button
                          variant='ghost'
                          className='w-full justify-start'
                          onClick={() => setShowNewClientForm(true)}
                        >
                          <PlusCircle className='mr-2 h-4 w-4' />
                          Create "{searchQuery}"
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredClients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.name}
                          onSelect={() => {
                            setSelectedClient(client)
                            setOpenCombobox(false)
                          }}
                        >
                          <div className='flex items-center gap-2'>
                            <img
                              src={client.photo || '/placeholder.svg'}
                              alt={client.name}
                              className='h-6 w-6 rounded-full'
                            />
                            <span>{client.name}</span>
                          </div>
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              selectedClient?.id === client.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Add more form fields for other event properties */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
