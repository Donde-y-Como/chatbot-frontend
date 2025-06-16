import { format, parseISO } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { es } from 'date-fns/locale/es';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTableColumnHeader } from '@/components/tables/data-table-column-header';
import { cn } from '@/lib/utils';
import { Product, ProductStatus, Unit, Category, ProductTag } from '../types';
import { DataTableRowActions } from './data-table-row-actions';

// Función helper para formatear precios
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(price);
};

// Función helper para el badge de status
const getStatusBadge = (status: ProductStatus) => {
  if (!status) {
    return (
      <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-800 border-gray-200">
        Sin estado
      </Badge>
    );
  }

  const statusConfig = {
    [ProductStatus.ACTIVE]: {
      label: 'Activo',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    [ProductStatus.INACTIVE]: {
      label: 'Inactivo',
      className: 'bg-red-100 text-red-800 border-red-200'
    }
  };

  const config = statusConfig[status];
  if (!config) {
    return (
      <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-800 border-gray-200">
        Desconocido
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn('text-sm', config.className)}>
      {config.label}
    </Badge>
  );
};

// Función helper para el badge de stock
const getStockBadge = (stock: number, minimumInventory: number) => {
  if (stock <= 0) {
    return (
      <Badge variant="destructive" className="text-sm">
        Sin stock
      </Badge>
    );
  }
  
  if (stock <= minimumInventory) {
    return (
      <Badge variant="outline" className="text-sm bg-yellow-50 text-yellow-800 border-yellow-200">
        Stock bajo ({stock})
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="text-sm bg-green-50 text-green-800 border-green-200">
      {stock} unidades
    </Badge>
  );
};

export const createProductColumns = (
  units: Unit[] = [],
  categories: Category[] = [],
  tags: ProductTag[] = []
): ColumnDef<Product>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Producto" />
    ),
    cell: ({ row }) => {
      const { photos, name, sku } = row.original;
      const mainPhoto = photos?.[0];
      
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage 
              src={mainPhoto || ''} 
              alt={name || 'Producto'} 
              className="object-cover rounded-md" 
            />
            <AvatarFallback className="rounded-md bg-muted">
              {(name || 'PR').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-medium text-sm">{name || 'Sin nombre'}</p>
            <p className="text-xs text-muted-foreground">SKU: {sku || 'Sin SKU'}</p>
          </div>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: true,
  },

  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio" />
    ),
    cell: ({ row }) => {
      const { price, discount } = row.original;
      const safePrice = price || 0;
      const safeDiscount = discount || 0;
      const finalPrice = safePrice * (1 - safeDiscount / 100);
      
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {formatPrice(finalPrice)}
          </span>
          {safeDiscount > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(safePrice)}
              </span>
              <Badge variant="outline" className="text-xs h-4 px-1">
                -{safeDiscount}%
              </Badge>
            </div>
          )}
        </div>
      );
    },
    enableSorting: true,
  },

  {
    accessorKey: 'stock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const { stock, minimumInventory, unitId } = row.original;
      const safeStock = stock || 0;
      const safeMinInventory = minimumInventory || 0;
      const unit = units.find(u => u.id === unitId);
      
      return (
        <div className="flex flex-col gap-1">
          {getStockBadge(safeStock, safeMinInventory)}
          {unit && (
            <span className="text-xs text-muted-foreground">
              Unidad: {unit.abbreviation}
            </span>
          )}
        </div>
      );
    },
    enableSorting: true,
  },

  {
    accessorKey: 'categoryIds',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categorías" />
    ),
    cell: ({ row }) => {
      const { categoryIds } = row.original;
      if (!categoryIds || categoryIds.length === 0) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }

      return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {categoryIds.slice(0, 2).map((categoryId) => {
            const category = categories.find(c => c.id === categoryId);
            return (
              <Badge key={categoryId} variant="outline" className="text-xs">
                {category?.name || 'Sin nombre'}
              </Badge>
            );
          })}
          {categoryIds.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{categoryIds.length - 2}
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
  },

  {
    accessorKey: 'tagIds',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Etiquetas" />
    ),
    cell: ({ row }) => {
      const { tagIds } = row.original;
      if (!tagIds || tagIds.length === 0) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }

      return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {tagIds.slice(0, 2).map((tagId) => {
            const tag = tags.find(t => t.id === tagId);
            return (
              <Badge 
                key={tagId} 
                variant="secondary" 
                className="text-xs"
                style={{ 
                  backgroundColor: tag?.color ? `${tag.color}20` : undefined,
                  borderColor: tag?.color || undefined,
                  color: tag?.color || undefined
                }}
              >
                {tag?.name || 'Sin nombre'}
              </Badge>
            );
          })}
          {tagIds.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{tagIds.length - 2}
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
  },

  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => getStatusBadge(row.original.status),
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    accessorKey: 'cost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Costo" />
    ),
    cell: ({ row }) => {
      const { cost, price } = row.original;
      const safeCost = cost || 0;
      const safePrice = price || 0;
      const margin = safePrice > 0 ? ((safePrice - safeCost) / safePrice) * 100 : 0;
      
      return (
        <div className="flex flex-col">
          <span className="text-sm">{formatPrice(safeCost)}</span>
          <span className={cn(
            "text-xs",
            margin > 30 ? "text-green-600" : margin > 10 ? "text-yellow-600" : "text-red-600"
          )}>
            Margen: {margin.toFixed(1)}%
          </span>
        </div>
      );
    },
    enableSorting: true,
  },

  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creado" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {format(parseISO(row.original.createdAt), 'dd/MM/y', { locale: es })}
      </Badge>
    ),
    enableSorting: true,
  },

  {
    id: 'actions',
    cell: DataTableRowActions,
  },
];
