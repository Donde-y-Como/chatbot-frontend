import { QuickResponse } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface QuickResponseListProps {
  quickResponses: QuickResponse[];
  onEdit: (quickResponse: QuickResponse) => void;
  onDelete: (quickResponse: QuickResponse) => void;
}

export function QuickResponseList({
  quickResponses,
  onEdit,
  onDelete
}: QuickResponseListProps) {
  if (quickResponses.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          No hay respuestas rápidas configuradas.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Atajo</TableHead>
            <TableHead>Mensaje</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quickResponses.map((quickResponse) => (
            <TableRow key={quickResponse.id}>
              <TableCell className="font-medium">
                {quickResponse.shortcut}
              </TableCell>
              <TableCell className="truncate max-w-xs">
                {quickResponse.message}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(quickResponse)}
                    title="Editar"
                  >
                    <IconEdit size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(quickResponse)}
                    title="Eliminar"
                  >
                    <IconTrash size={18} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
