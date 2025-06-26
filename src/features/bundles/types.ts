import { z } from "zod";
import { PriceObject, priceObjectSchema, ProductStatus } from '../products/types';
import { Media } from '@/features/chats/ChatTypes.ts'

export type BundleItem = {
  itemId: string;
  itemType: "product" | "service";
  quantity: number;
}

export type BundleItemResponse = {
  id: string;
  itemId: string;
  type: "product" | "service";
  quantity: number;
}

const bundleItemSchema = z.object({
  itemId: z.string().min(1, { message: "ID del item es obligatorio" }),
  itemType: z.enum(["product", "service"], { message: "Tipo de item inválido" }),
  quantity: z.number().int().min(1, { message: "La cantidad debe ser al menos 1" }),
});

// Schemas de validación
export const createBundleSchema = z.object({
  // Campos obligatorios
  sku: z.string().min(1, { message: "SKU es obligatorio" }),
  name: z.string().min(1, { message: "El nombre del bundle es obligatorio" }),
  price: priceObjectSchema,
  cost: priceObjectSchema,
  items: z.array(bundleItemSchema).min(1, { message: "Debe tener al menos un item" }),
  
  // Campos opcionales
  description: z.string().default(""),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVO),
  tagIds: z.array(z.string()).default([]),
  files: z.array(z.object({
    url: z.string().url("URL inválida"),
    type: z.string(),
    caption: z.string().optional(),
    filename: z.string().optional(),
    mimetype: z.string().optional(),
  })).default([]),
});

export const editBundleSchema = createBundleSchema.partial().extend({
  id: z.string(),
});

export type CreateBundleForm = z.infer<typeof createBundleSchema>;
export type EditBundleForm = z.infer<typeof editBundleSchema>;

// Tipos principales
export type Bundle = {
  id: string;
  businessId: string;
  sku: string;
  name: string;
  description: string;
  items: BundleItemResponse[];
  price: PriceObject;
  cost: PriceObject;
  status: ProductStatus;
  tagIds: string[];
  files: Media[];
  createdAt: string;
}

// Filtros para bundles
export type BundleFilters = {
  tagIds?: string[];
  status?: ProductStatus;
  query?: string;
}

// Tipos para el contexto
export type BundleDialogMode = 'create' | 'edit' | 'view' | 'delete';

export type BundleContextState = {
  bundles: Bundle[];
  isLoading: boolean;
  filters: BundleFilters;
  selectedBundle: Bundle | null;
  dialogMode: BundleDialogMode | null;
  isDialogOpen: boolean;
}

export type BundleContextActions = {
  setBundles: (bundles: Bundle[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setFilters: (filters: BundleFilters) => void;
  setSelectedBundle: (bundle: Bundle | null) => void;
  setDialogMode: (mode: BundleDialogMode | null) => void;
  setIsDialogOpen: (isOpen: boolean) => void;
  addBundle: (bundle: Bundle) => void;
  updateBundle: (bundle: Bundle) => void;
  removeBundle: (bundleId: string) => void;
}

export type BundleContext = BundleContextState & BundleContextActions;