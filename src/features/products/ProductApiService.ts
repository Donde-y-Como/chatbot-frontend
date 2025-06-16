import { api } from '@/api/axiosInstance.ts';
import { 
  CreateProductForm, 
  EditProductForm, 
  Product, 
  ProductFilters, 
  ProductsApiResponse,
  Unit,
  Category,
  ProductTag
} from './types';

export const ProductApiService = {
  // Operaciones CRUD principales
  createProduct: async (product: CreateProductForm): Promise<Product> => {
    const response = await api.post('/products/item', product);
    if (response.status !== 201) {
      throw new Error('Error creando producto');
    }
    return response.data;
  },

  getAllProducts: async (filters?: ProductFilters): Promise<ProductsApiResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.categoryIds?.length) {
      params.set('categoryIds', filters.categoryIds.join(','));
    }
    if (filters?.subcategoryIds?.length) {
      params.set('subcategoryIds', filters.subcategoryIds.join(','));
    }
    if (filters?.tagIds?.length) {
      params.set('tagIds', filters.tagIds.join(','));
    }
    if (filters?.unitIds?.length) {
      params.set('unitIds', filters.unitIds.join(','));
    }
    if (filters?.status) {
      params.set('status', filters.status);
    }
    if (filters?.search) {
      params.set('search', filters.search);
    }

    const queryString = params.toString();
    const url = queryString ? `/products/item?${queryString}` : '/products/item';
    
    const response = await api.get(url);
    if (response.status !== 200) {
      throw new Error('Error obteniendo productos');
    }
    return response.data;
  },

  getProductById: async (productId: string): Promise<Product> => {
    const response = await api.get(`/products/item/${productId}`);
    if (response.status !== 200) {
      throw new Error('Error obteniendo producto');
    }
    return response.data;
  },

  updateProduct: async (productId: string, changes: Partial<EditProductForm>): Promise<Product> => {
    const response = await api.put(`/products/item/${productId}`, changes);
    if (response.status !== 200) {
      throw new Error('Error actualizando producto');
    }
    return response.data;
  },

  deleteProduct: async (productId: string): Promise<void> => {
    const response = await api.delete(`/products/item/${productId}`);
    if (response.status !== 200) {
      throw new Error('Error eliminando producto');
    }
  },

  getLowStockProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products/item/low-stock');
    if (response.status !== 200) {
      throw new Error('Error obteniendo productos con bajo stock');
    }
    return response.data;
  },

  // Servicios auxiliares
  getUnits: async (): Promise<Unit[]> => {
    const response = await api.get('/products/units');
    if (response.status !== 200) {
      throw new Error('Error obteniendo unidades');
    }
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/products/categories');
    if (response.status !== 200) {
      throw new Error('Error obteniendo categorías');
    }
    return response.data;
  },

  getProductTags: async (): Promise<ProductTag[]> => {
    const response = await api.get('/products/productTags');
    if (response.status !== 200) {
      throw new Error('Error obteniendo etiquetas');
    }
    return response.data;
  },

  // Búsquedas específicas
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await api.get(`/products/item?search=${encodeURIComponent(query)}`);
    if (response.status !== 200) {
      throw new Error('Error buscando productos');
    }
    return response.data.products || response.data;
  },
};
