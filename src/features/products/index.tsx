import { useMemo } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTable } from '@/components/tables/custom-table';
import { Main } from '@/components/layout/main';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { TableSkeleton } from '@/components/TableSkeleton';
import { useGetProducts } from './hooks/useGetProducts';
import { useGetUnits, useGetCategories, useGetProductTags } from './hooks/useGetAuxiliaryData';
import { ProductProvider } from './context/products-context';
import { ProductPrimaryButtons } from './components/product-primary-buttons';
import { ProductFiltersComponent } from './components/product-filters';
import { ProductDialogs } from './components/product-dialogs';
import { createProductColumns } from './components/products-columns';
import { calculateProductStats } from './utils/productUtils';
import { Product, ProductFilters } from './types';
import { useState } from 'react';

function ProductsContent() {
  const [filters, setFilters] = useState<ProductFilters>({});
  
  const { data: productsData, isLoading: isLoadingProducts } = useGetProducts(filters);
  const { data: unitsData, isLoading: isLoadingUnits } = useGetUnits();
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategories();
  const { data: tagsData, isLoading: isLoadingTags } = useGetProductTags();

  const isLoading = isLoadingProducts || isLoadingUnits || isLoadingCategories || isLoadingTags;
  
  // Crear columnas de la tabla usando useMemo
  const columns = useMemo(() => {
    if (!unitsData || !categoriesData || !tagsData) return [];
    return createProductColumns(unitsData, categoriesData, tagsData);
  }, [unitsData, categoriesData, tagsData]);

  // Obtener productos de la respuesta
  const products = productsData ? (Array.isArray(productsData) ? productsData : productsData.products || []) : [];

  // Calcular estadísticas
  const stats = calculateProductStats(products);

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <Main fixed>
      <section className="p-2">
        <div className="mb-2 w-full flex sm:items-center flex-col sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <SidebarTrigger variant="outline" className="sm:hidden" />
              <Separator orientation="vertical" className="h-7 sm:hidden" />
              <h1 className="text-2xl font-bold">Productos</h1>
            </div>
            <p className="text-muted-foreground self-start mb-2 sm:mb-0">
              Gestiona tu inventario de productos, precios y stock.
            </p>
          </div>

          <ProductPrimaryButtons />
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">{stats.active} activos</span>
                {stats.inactive > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-500">{stats.inactive} inactivos</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas de stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-red-600">Sin stock</span>
                {stats.lowStock > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-600">{stats.lowStock} stock bajo</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <ProductFiltersComponent 
            onFiltersChange={setFilters}
            initialFilters={filters}
          />
        </div>

        {/* Tabla de productos */}
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {products.length > 0 && unitsData && categoriesData && tagsData ? (
            <CustomTable<Product> 
              data={products} 
              columns={columns}
              showSearch={true}
              searchColumn="name"
              searchPlaceholder="Buscar por nombre o SKU..."
              enableGlobalFilter={true}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {Object.keys(filters).length > 0
                    ? 'No se encontraron productos que coincidan con los filtros aplicados.'
                    : 'Comienza creando tu primer producto para gestionar tu inventario.'}
                </p>
                <ProductPrimaryButtons />
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <ProductDialogs />
    </Main>
  );
}

export default function Products() {
  return (
    <ProductProvider>
      <ProductsContent />
    </ProductProvider>
  );
}
