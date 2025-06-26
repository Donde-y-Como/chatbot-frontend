import { Plus, Package, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBundleContext } from '../context/bundles-context';

export function BundlePrimaryButtons() {
  const { setDialogMode, setIsDialogOpen } = useBundleContext();

  const handleCreateBundle = () => {
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Paquete
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={handleCreateBundle} className="p-3">
          <Package className="mr-3 h-5 w-5 text-blue-500" />
          <div className="flex flex-col gap-1">
            <span className="font-medium">Crear Paquete</span>
            <span className="text-xs text-muted-foreground">Agrupa productos y servicios en un paquete</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}