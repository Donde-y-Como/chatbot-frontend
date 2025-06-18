import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, ProductDialogMode } from '../types';

// Tipos para el contexto simplificado
interface ProductContextState {
  selectedProduct: Product | null;
  dialogMode: ProductDialogMode | null;
  isDialogOpen: boolean;
  createMode: 'quick' | 'complete' | null;
}

interface ProductContextActions {
  setSelectedProduct: (product: Product | null) => void;
  setDialogMode: (mode: ProductDialogMode | null) => void;
  setIsDialogOpen: (isOpen: boolean) => void;
  setCreateMode: (mode: 'quick' | 'complete' | null) => void;
}

type ProductContext = ProductContextState & ProductContextActions;

// Estado inicial
const initialState: ProductContextState = {
  selectedProduct: null,
  dialogMode: null,
  isDialogOpen: false,
  createMode: null,
};

// Crear el contexto
const ProductContextInstance = createContext<ProductContext | undefined>(undefined);

// Provider del contexto
interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogMode, setDialogMode] = useState<ProductDialogMode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [createMode, setCreateMode] = useState<'quick' | 'complete' | null>(null);

  const contextValue: ProductContext = {
    selectedProduct,
    dialogMode,
    isDialogOpen,
    createMode,
    setSelectedProduct,
    setDialogMode,
    setIsDialogOpen,
    setCreateMode,
  };

  return (
    <ProductContextInstance.Provider value={contextValue}>
      {children}
    </ProductContextInstance.Provider>
  );
};

// Hook para usar el contexto
export const useProductContext = (): ProductContext => {
  const context = useContext(ProductContextInstance);
  if (!context) {
    throw new Error('useProductContext debe ser usado dentro de un ProductProvider');
  }
  return context;
};

// Hook para acciones comunes
export const useProductActions = () => {
  const context = useProductContext();
  
  const openCreateDialog = (mode: 'quick' | 'complete' = 'complete') => {
    context.setSelectedProduct(null);
    context.setDialogMode('create');
    context.setCreateMode(mode);
    context.setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    context.setSelectedProduct(product);
    context.setDialogMode('edit');
    context.setCreateMode(null);
    context.setIsDialogOpen(true);
  };

  const openViewDialog = (product: Product) => {
    context.setSelectedProduct(product);
    context.setDialogMode('view');
    context.setCreateMode(null);
    context.setIsDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    context.setSelectedProduct(product);
    context.setDialogMode('delete');
    context.setCreateMode(null);
    context.setIsDialogOpen(true);
  };

  const closeDialog = () => {
    context.setIsDialogOpen(false);
    context.setDialogMode(null);
    context.setSelectedProduct(null);
    context.setCreateMode(null);
  };

  return {
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    closeDialog,
  };
};
