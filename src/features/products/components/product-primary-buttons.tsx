import { Download, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductActions } from '../context/products-context';
import { useExportProducts } from '../hooks/useProductMutations';

export function ProductPrimaryButtons() {
  const { openCreateDialog } = useProductActions();
  const exportMutation = useExportProducts();

  const handleExport = () => {
    exportMutation.mutate({});
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Button 
        onClick={openCreateDialog}
        className="flex-1 sm:flex-none"
      >
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Producto
      </Button>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="flex-1 sm:flex-none"
        >
          <Download className="mr-2 h-4 w-4" />
          {exportMutation.isPending ? 'Exportando...' : 'Exportar'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          className="flex-1 sm:flex-none"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>
    </div>
  );
}
