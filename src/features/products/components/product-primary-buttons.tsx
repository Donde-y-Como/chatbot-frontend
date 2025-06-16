import { Plus, Zap, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProductActions } from '../context/products-context';

export function ProductPrimaryButtons() {
  const { openCreateDialog } = useProductActions();

  const handleQuickProduct = () => {
    openCreateDialog('quick');
  };

  const handleCompleteProduct = () => {
    openCreateDialog('complete');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={handleQuickProduct} className="p-3">
          <Zap className="mr-3 h-5 w-5 text-blue-500" />
          <div className="flex flex-col gap-1">
            <span className="font-medium">Producto rápido</span>
            <span className="text-xs text-muted-foreground">Solo campos esenciales para crear rápidamente</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCompleteProduct} className="p-3">
          <Settings className="mr-3 h-5 w-5 text-green-500" />
          <div className="flex flex-col gap-1">
            <span className="font-medium">Producto completo</span>
            <span className="text-xs text-muted-foreground">Todos los campos y opciones avanzadas</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
