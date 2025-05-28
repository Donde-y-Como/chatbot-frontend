import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare } from 'lucide-react'

interface NotesStepProps {
  notes: string
  onNotesChange: (notes: string) => void
  onNext: () => void
  onBack: () => void
  onCancel: () => void
}

export function NotesStep({
  notes,
  onNotesChange,
  onNext,
  onBack,
  onCancel,
}: NotesStepProps) {
  return (
    <div className='space-y-6 max-h-[60vh] overflow-y-auto'>
      <div className='text-center'>
        <h2 className='text-lg font-semibold mb-2 flex items-center justify-center gap-2'>
          <MessageSquare className='h-5 w-5 text-primary' />
          Notas de la Cita (Opcional)
        </h2>
        <p className='text-sm text-muted-foreground'>
          Agregue cualquier información adicional o instrucciones especiales para esta cita
        </p>
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Notas y Observaciones</CardTitle>
          <CardDescription>
            Información adicional que considere importante para esta cita
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='appointment-notes'>Notas</Label>
            <Textarea
              id='appointment-notes'
              placeholder='Ejemplo: El cliente prefiere personal femenino, tiene alergia a ciertos productos, instrucciones especiales, etc.'
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
              className='resize-none'
            />
            <p className='text-xs text-muted-foreground'>
              {notes.length}/500 caracteres
            </p>
          </div>

          {notes.trim() && (
            <div className='mt-4 p-3 bg-primary/5 rounded-md border border-primary/20'>
              <h4 className='text-sm font-medium mb-2 text-primary'>Vista previa:</h4>
              <p className='text-sm text-muted-foreground'>{notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className='flex justify-between gap-4 pt-4'>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant='secondary' onClick={onBack}>
            Atrás
          </Button>
        </div>
        <Button onClick={onNext}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
