import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Plus } from 'lucide-react'

export function MakeAppointmentDialog() {
  const handleSubmit = () => {

  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='w-full bg-primary hover:bg-primary/90 transition-all duration-300'>
          <Plus className='mr-2 h-4 w-4 animate-pulse' /> Agendar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogDescription className="sr-only">Agendar cita</DialogDescription>
        <DialogHeader>
          <DialogTitle>Agendar cita</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleSubmit}>Agendar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}