import { QuickResponse } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuickResponseForm, QuickResponseFormValues } from './quick-response-form';

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
