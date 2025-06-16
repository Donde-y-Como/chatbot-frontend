import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, ProductDialogMode } from '../types';

// Tipos para el contexto simplificado
interface ProductContextState {
  selectedProduct: Product | null;
  dialogMode: ProductDialogMode | null;
  isDialogOpen: boolean;
}

interface ProductContextActions {
  setSelectedProduct: (product: Product | null) => void;
  setDialogMode: (mode: ProductDialogMode | null) => void;
  setIsDialogOpen: (isOpen: boolean) => void;
}

type ProductContext = ProductContextState & ProductContextActions;

// Estado inicial
const initialState: ProductContextState = {
  selectedProduct: null,
  dialogMode: null,
  isDialogOpen: false,
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

  const contextValue: ProductContext = {
    selectedProduct,
    dialogMode,
    isDialogOpen,
    setSelectedProduct,
    setDialogMode,
    setIsDialogOpen,
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
  
  const openCreateDialog = () => {
    context.setSelectedProduct(null);
    context.setDialogMode('create');
    context.setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    context.setSelectedProduct(product);
    context.setDialogMode('edit');
    context.setIsDialogOpen(true);
  };

  const openViewDialog = (product: Product) => {
    context.setSelectedProduct(product);
    context.setDialogMode('view');
    context.setIsDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    context.setSelectedProduct(product);
    context.setDialogMode('delete');
    context.setIsDialogOpen(true);
  };

  const closeDialog = () => {
    context.setIsDialogOpen(false);
    context.setDialogMode(null);
    context.setSelectedProduct(null);
  };

  return {
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    closeDialog,
  };
};
