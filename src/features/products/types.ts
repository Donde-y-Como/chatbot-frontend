import { z } from "zod";

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export type ProductPhoto = {
  url: string;
  alt?: string;
}

const priceSchema = z.number().min(0, { message: "El precio debe ser mayor a 0" });

// Schemas de validación
export const createProductSchema = z.object({
  // Campos obligatorios
  sku: z.string().min(1, { message: "SKU es obligatorio" }),
  name: z.string().min(1, { message: "El nombre del producto es obligatorio" }),
  price: priceSchema,
  discount: z.number().min(0).max(100, { message: "El descuento debe estar entre 0 y 100" }).default(0),
  stock: z.number().int().min(0, { message: "El stock debe ser un número entero no negativo" }),
  unitId: z.string().min(1, { message: "La unidad es obligatoria" }),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  minimumInventory: z.number().int().min(0, { message: "El inventario mínimo debe ser un número entero no negativo" }),
  taxes: z.number().min(0).max(100, { message: "Los impuestos deben estar entre 0 y 100" }).default(0),
  cost: priceSchema,
  
  // Campos opcionales
  description: z.string().default(""),
  barcode: z.string().nullish(),
  categoryIds: z.array(z.string()).default([]),
  subcategoryIds: z.array(z.string()).default([]),
  photos: z.array(z.string().url("URL de foto inválida")).default([]),
  tagIds: z.array(z.string()).default([]),
  notes: z.string().default(""),
});

export const editProductSchema = createProductSchema.partial().extend({
  id: z.string(),
});

export type CreateProductForm = z.infer<typeof createProductSchema>;
export type EditProductForm = z.infer<typeof editProductSchema>;

// Tipos principales
export type ProductPrimitives = {
  id: string;
  businessId: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  unitId: string;
  status: ProductStatus;
  minimumInventory: number;
  taxes: number;
  cost: number;
  barcode?: string | null;
  categoryIds: string[];
  subcategoryIds: string[];
  photos: string[];
  tagIds: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type Product = ProductPrimitives;

// Tipos relacionados
export type Unit = {
  id: string;
  businessId: string;
  name: string;
  abbreviation: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export type Category = {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductTag = {
  id: string;
  businessId: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// Filtros para productos
export type ProductFilters = {
  categoryIds?: string[];
  subcategoryIds?: string[];
  tagIds?: string[];
  unitIds?: string[];
  status?: ProductStatus;
  search?: string;
}

// Respuesta de la API
export type ProductsApiResponse = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

// Tipos para el contexto
export type ProductDialogMode = 'create' | 'edit' | 'view' | 'delete';

export type ProductContextState = {
  products: Product[];
  units: Unit[];
  categories: Category[];
  tags: ProductTag[];
  isLoading: boolean;
  filters: ProductFilters;
  selectedProduct: Product | null;
  dialogMode: ProductDialogMode | null;
  isDialogOpen: boolean;
}

export type ProductContextActions = {
  setProducts: (products: Product[]) => void;
  setUnits: (units: Unit[]) => void;
  setCategories: (categories: Category[]) => void;
  setTags: (tags: ProductTag[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setFilters: (filters: ProductFilters) => void;
  setSelectedProduct: (product: Product | null) => void;
  setDialogMode: (mode: ProductDialogMode | null) => void;
  setIsDialogOpen: (isOpen: boolean) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
}

export type ProductContext = ProductContextState & ProductContextActions;
