import { Product, ProductStatus } from '../types';

// Formatear moneda
export const formatCurrency = (amount: number, currency = 'MXN', locale = 'es-MX') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Formatear porcentaje
export const formatPercentage = (value: number, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

// Calcular precio final con descuento
export const calculateFinalPrice = (price: number = 0, discount: number = 0) => {
  return price * (1 - discount / 100);
};

// Calcular precio con impuestos
export const calculatePriceWithTaxes = (price: number = 0, taxes: number = 0) => {
  return price * (1 + taxes / 100);
};

// Calcular margen de ganancia
export const calculateMargin = (price: number = 0, cost: number = 0) => {
  if (price <= 0) return 0;
  return ((price - cost) / price) * 100;
};

// Calcular ganancia absoluta
export const calculateProfit = (price: number = 0, cost: number = 0) => {
  return price - cost;
};

// Determinar el estado del stock
export const getStockStatus = (stock: number = 0, minimumInventory: number = 0) => {
  if (stock <= 0) {
    return {
      status: 'out_of_stock' as const,
      label: 'Sin stock',
      severity: 'high' as const,
      color: 'red',
    };
  }
  
  if (stock <= minimumInventory) {
    return {
      status: 'low_stock' as const,
      label: 'Stock bajo',
      severity: 'medium' as const,
      color: 'yellow',
    };
  }
  
  return {
    status: 'in_stock' as const,
    label: 'En stock',
    severity: 'low' as const,
    color: 'green',
  };
};

// Determinar la calidad del margen
export const getMarginQuality = (margin: number) => {
  if (margin >= 30) {
    return {
      quality: 'excellent' as const,
      label: 'Excelente',
      color: 'green',
    };
  }
  
  if (margin >= 15) {
    return {
      quality: 'good' as const,
      label: 'Bueno',
      color: 'yellow',
    };
  }
  
  return {
    quality: 'poor' as const,
    label: 'Bajo',
    color: 'red',
  };
};

// Validar SKU
export const validateSKU = (sku: string, existingProducts: Product[] = []) => {
  if (!sku || sku.trim().length === 0) {
    return { isValid: false, message: 'El SKU es obligatorio' };
  }
  
  if (sku.length < 3) {
    return { isValid: false, message: 'El SKU debe tener al menos 3 caracteres' };
  }
  
  if (sku.length > 50) {
    return { isValid: false, message: 'El SKU no puede tener más de 50 caracteres' };
  }
  
  // Verificar caracteres válidos (letras, números, guiones)
  const skuPattern = /^[A-Za-z0-9\-_]+$/;
  if (!skuPattern.test(sku)) {
    return { 
      isValid: false, 
      message: 'El SKU solo puede contener letras, números, guiones y guiones bajos' 
    };
  }
  
  // Verificar duplicados
  const isDuplicate = existingProducts.some(product => 
    product.sku.toLowerCase() === sku.toLowerCase()
  );
  
  if (isDuplicate) {
    return { isValid: false, message: 'Ya existe un producto con este SKU' };
  }
  
  return { isValid: true, message: 'SKU válido' };
};

// Generar SKU automático
export const generateSKU = (name: string, existingProducts: Product[] = []) => {
  // Tomar las primeras 3 letras del nombre y agregar un número
  const baseSKU = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 3)
    .padEnd(3, 'X');
  
  let counter = 1;
  let generatedSKU = `${baseSKU}-${counter.toString().padStart(3, '0')}`;
  
  // Incrementar hasta encontrar un SKU disponible
  while (existingProducts.some(product => product.sku === generatedSKU)) {
    counter++;
    generatedSKU = `${baseSKU}-${counter.toString().padStart(3, '0')}`;
  }
  
  return generatedSKU;
};

// Filtrar productos
export const filterProducts = (
  products: Product[],
  searchTerm: string,
  filters: {
    status?: ProductStatus;
    categoryIds?: string[];
    tagIds?: string[];
    unitIds?: string[];
    lowStock?: boolean;
  } = {}
) => {
  return products.filter(product => {
    // Filtro de búsqueda por texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }
    
    // Filtro por estado
    if (filters.status && product.status !== filters.status) {
      return false;
    }
    
    // Filtro por categorías
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const hasCategory = filters.categoryIds.some(categoryId =>
        product.categoryIds.includes(categoryId)
      );
      if (!hasCategory) return false;
    }
    
    // Filtro por etiquetas
    if (filters.tagIds && filters.tagIds.length > 0) {
      const hasTag = filters.tagIds.some(tagId =>
        product.tagIds.includes(tagId)
      );
      if (!hasTag) return false;
    }
    
    // Filtro por unidades
    if (filters.unitIds && filters.unitIds.length > 0) {
      if (!filters.unitIds.includes(product.unitId)) {
        return false;
      }
    }
    
    // Filtro por stock bajo
    if (filters.lowStock) {
      if (product.stock > product.minimumInventory) {
        return false;
      }
    }
    
    return true;
  });
};

// Ordenar productos
export const sortProducts = (
  products: Product[],
  sortBy: 'name' | 'sku' | 'price' | 'stock' | 'createdAt' = 'name',
  sortDirection: 'asc' | 'desc' = 'asc'
) => {
  return [...products].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'sku':
        comparison = a.sku.localeCompare(b.sku);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'stock':
        comparison = a.stock - b.stock;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });
};

// Agrupar productos por categoría
export const groupProductsByCategory = (products: Product[], categories: { id: string; name: string }[]) => {
  const grouped = products.reduce((acc, product) => {
    if (product.categoryIds.length === 0) {
      // Productos sin categoría
      if (!acc['uncategorized']) {
        acc['uncategorized'] = [];
      }
      acc['uncategorized'].push(product);
    } else {
      // Productos con categorías
      product.categoryIds.forEach(categoryId => {
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(product);
      });
    }
    return acc;
  }, {} as Record<string, Product[]>);

  // Convertir a array con nombres de categorías
  return Object.entries(grouped).map(([categoryId, products]) => {
    const category = categories.find(c => c.id === categoryId);
    return {
      categoryId,
      categoryName: category ? category.name : 'Sin categoría',
      products,
    };
  });
};

// Calcular estadísticas de productos
export const calculateProductStats = (products: Product[]) => {
  if (products.length === 0) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      outOfStock: 0,
      lowStock: 0,
      totalValue: 0,
      averagePrice: 0,
      averageMargin: 0,
    };
  }

  const stats = products.reduce(
    (acc, product) => {
      acc.total++;
      
      if (product.status === ProductStatus.ACTIVE) {
        acc.active++;
      } else {
        acc.inactive++;
      }
      
      const stock = product.stock || 0;
      const minimumInventory = product.minimumInventory || 0;
      
      if (stock <= 0) {
        acc.outOfStock++;
      } else if (stock <= minimumInventory) {
        acc.lowStock++;
      }
      
      const price = product.price || 0;
      const discount = product.discount || 0;
      const cost = product.cost || 0;
      
      const finalPrice = calculateFinalPrice(price, discount);
      acc.totalValue += finalPrice * stock;
      acc.totalPrice += finalPrice;
      
      const margin = calculateMargin(price, cost);
      acc.totalMargin += margin;
      
      return acc;
    },
    {
      total: 0,
      active: 0,
      inactive: 0,
      outOfStock: 0,
      lowStock: 0,
      totalValue: 0,
      totalPrice: 0,
      totalMargin: 0,
    }
  );

  return {
    total: stats.total,
    active: stats.active,
    inactive: stats.inactive,
    outOfStock: stats.outOfStock,
    lowStock: stats.lowStock,
    totalValue: stats.totalValue,
    averagePrice: stats.totalPrice / stats.total,
    averageMargin: stats.totalMargin / stats.total,
  };
};
