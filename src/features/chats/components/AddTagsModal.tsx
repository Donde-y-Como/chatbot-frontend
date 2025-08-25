import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useGetTags } from "@/features/clients/hooks/useGetTags";
import { ClientPrimitives } from "@/features/clients/types";
import { useState } from "react";

interface AddTagsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  client: ClientPrimitives;
  onSave: (tagIds: string[]) => void;
}

export function AddTagsModal({
  open,
  setOpen,
  client,
  onSave,
}: AddTagsModalProps) {
  const { data: tags=[], isLoading: isTagsLoading } = useGetTags();
  const [selectedTags, setSelectedTags] = useState<string[]>(client.tagIds || []);

  const handleTagSelect = (tagId: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleSave = () => {
    onSave(selectedTags);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Agregar etiquetas</AlertDialogTitle>
          {  tags.length >0 && (
            <AlertDialogDescription>
              Selecciona las etiquetas que quieres agregar a este cliente.
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <div className="grid gap-2">
          {isTagsLoading ? (
            <div>Cargando etiquetas...</div>
          ) : (
            tags.length >0 ? tags.map((tag) => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={tag.id}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => handleTagSelect(tag.id)}
                />
                <Label htmlFor={tag.id}>{tag.name}</Label>
              </div>
            )): (<div>No hay etiquetas disponibles.</div>))
          }
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>Guardar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
