import { useState } from 'react'
import type { Employee, Event } from './types'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'

interface EventDialogProps {
  isOpen: boolean
  onClose: () => void
  event: Partial<Event>
  onUpdate: (event: Event) => void
  onCreate: (event: Omit<Event, 'id'>) => void
  onDelete: (eventId: string) => void
  employees: Employee[]
}

export function EventDialog({
  isOpen,
  onClose,
  event,
  onUpdate,
  onCreate,
  onDelete,
  employees,
}: EventDialogProps) {
  const [formData, setFormData] = useState<Partial<Event>>(event)

  const handleSubmit = () => {
    if (formData.id) {
      onUpdate(formData as Event)
    } else {
      onCreate(formData as Omit<Event, 'id'>)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.id ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </DialogHeader>
        {/* Form fields remain the same, just update formData instead of newEvent */}
        <DialogFooter>
          {formData.id && (
            <Button
              variant='destructive'
              onClick={() => onDelete(formData.id!)}
            >
              Delete
            </Button>
          )}
          <Button onClick={handleSubmit}>
            {formData.id ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}