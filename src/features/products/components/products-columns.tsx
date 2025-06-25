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
const formatPrice = (priceObj: { amount: number; currency: string } | number) => {
  if (typeof priceObj === 'number') {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(priceObj);
  }
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: priceObj.currency,
  }).format(priceObj.amount);
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
    [ProductStatus.ACTIVO]: {
      label: 'Activo',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    [ProductStatus.INACTIVO]: {
      label: 'Inactivo',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    [ProductStatus.SIN_STOCK]: {
      label: 'Sin Stock',
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

// Global filter function for multi-field search
export function globalFilterFn(
  row: { original: Product },
  columnId: string,
  filterValue: string
) {
  if (!filterValue) return true

  const searchValue = filterValue.toLowerCase()
  const product = row.original

  // Search in basic fields
  const searchFields = [
    product.name?.toLowerCase() || '',
    product.description?.toLowerCase() || '',
    product.sku?.toLowerCase() || '',
    product.notes?.toLowerCase() || '',
    product.barcode?.toLowerCase() || '',
  ]

  return searchFields.some((field) => field.includes(searchValue))
}

export const createProductColumns = (
  units: Unit[] = [],
  categories: Category[] = [],
  tags: ProductTag[] = []
): ColumnDef<Product>[] => [
  // Global filter column (hidden, used for multi-field search)
  {
    id: 'globalFilter',
    filterFn: globalFilterFn,
    enableColumnFilter: false,
  },
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
    accessorKey: 'cost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Costo" />
    ),
    cell: ({ row }) => {
      const { cost } = row.original;
      
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {formatPrice(cost)}
          </span>
        </div>
      );
    },
    enableSorting: true,
  },

  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio" />
    ),
    cell: ({ row }) => {
      const { price, finalPrice, discount } = row.original;
      const safeDiscount = discount || 0;
      
      // Si hay finalPrice y es menor al precio original, mostrar precio tachado
      const showDiscountedPrice = finalPrice && finalPrice.amount < price.amount;
      
      return (
        <div className="flex flex-col">
          {showDiscountedPrice ? (
            <>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(price)}
              </span>
              <span className="font-medium text-sm text-green-600">
                {formatPrice(finalPrice)}
              </span>
            </>
          ) : (
            <span className="font-medium text-sm">
              {formatPrice(price)}
            </span>
          )}
          {safeDiscount > 0 && (
            <Badge variant="outline" className="text-xs h-4 px-1 w-fit">
              -{safeDiscount}%
            </Badge>
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
    accessorKey: 'unitId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unidad" />
    ),
    cell: ({ row }) => {
      const { unitId } = row.original;
      const unit = units.find(u => u.id === unitId);
      
      return unit ? (
        <Badge variant="outline" className="text-xs">
          {unit.name} ({unit.abbreviation})
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">Sin unidad</span>
      );
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    accessorKey: 'categoryIds',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categorización" />
    ),
    cell: ({ row }) => {
      const { categoryIds, subcategoryIds } = row.original;
      
      // Si hay subcategorías, solo mostrar subcategorías (no duplicar categorías padre)
      if (subcategoryIds && subcategoryIds.length > 0) {
        const subcategoryItems = subcategoryIds.map((subcategoryId) => {
          // Buscar la subcategoría en todas las categorías padre
          for (const parentCategory of categories.filter(c => !c.parentCategoryId)) {
            if (parentCategory.subcategories) {
              const subcategory = parentCategory.subcategories.find(sub => sub.id === subcategoryId);
              if (subcategory) {
                return {
                  id: subcategoryId,
                  name: `${parentCategory.name} > ${subcategory.name}`,
                };
              }
            }
          }
          return null;
        }).filter((item): item is { id: string; name: string } => item !== null);

        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {subcategoryItems.slice(0, 3).map((item) => (
              <Badge 
                key={item.id} 
                variant="secondary" 
                className="text-xs"
              >
                {item.name}
              </Badge>
            ))}
            {subcategoryItems.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{subcategoryItems.length - 3}
              </Badge>
            )}
          </div>
        );
      }
      
      // Si solo hay categorías padre (sin subcategorías), mostrar categorías padre
      if (categoryIds && categoryIds.length > 0) {
        const categoryItems = categoryIds.map((categoryId) => {
          const category = categories.find(c => c.id === categoryId && !c.parentCategoryId);
          return category ? {
            id: categoryId,
            name: category.name,
          } : null;
        }).filter((item): item is { id: string; name: string } => item !== null);

        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {categoryItems.slice(0, 3).map((item) => (
              <Badge 
                key={item.id} 
                variant="secondary" 
                className="text-xs"
              >
                {item.name}
              </Badge>
            ))}
            {categoryItems.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{categoryItems.length - 3}
              </Badge>
            )}
          </div>
        );
      }
      
      // Si no hay categorías ni subcategorías
      return <span className="text-muted-foreground text-sm">-</span>;
    },
    enableSorting: false,
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as string[];
      if (!rowValue || !Array.isArray(rowValue)) return false;
      return value.some((filterValue: string) => rowValue.includes(filterValue));
    },
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
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as string[];
      if (!rowValue || !Array.isArray(rowValue)) return false;
      return value.some((filterValue: string) => rowValue.includes(filterValue));
    },
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
    id: 'actions',
    cell: DataTableRowActions,
  },
];
