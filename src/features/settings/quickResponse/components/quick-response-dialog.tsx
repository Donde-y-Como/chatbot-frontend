import { QuickResponse, QuickResponseFormValues } from '../types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QuickResponseForm } from '@/features/settings/quickResponse/components/quick-response-form.tsx'

interface QuickResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: QuickResponseFormValues) => void;
  isSubmitting: boolean;
  initialData?: QuickResponse;
  title: string;
  submitLabel: string;
}

export function QuickResponseDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  title,
  submitLabel
}: QuickResponseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">{submitLabel} respuesta rapida</DialogDescription>
        <QuickResponseForm
          onSubmit={onSubmit}
          initialData={initialData}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
        />
      </DialogContent>
    </Dialog>
  );
}
